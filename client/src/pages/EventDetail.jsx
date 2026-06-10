import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAccount, useWriteContract } from 'wagmi';
import { parseEther } from 'viem';
import { api } from '../api';

const MINT_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'payable',
    inputs: [{ name: 'to', type: 'address' }],
    outputs: [],
  },
];

function ipfsToHttp(url) {
  if (!url) return null;
  return url.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${url.slice(7)}` : url;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const pad = (n) => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function getStock(cat) {
  const total = Number(cat.totalSupply ?? cat.total_supply ?? 0);
  const minted = Number(cat.mintedCount ?? cat.minted_count ?? 0);
  return Math.max(0, total - minted);
}

function getCatPrice(cat) {
  return Number(cat.price ?? 0);
}

function getCatContractAddress(cat) {
  return cat.contractAddress ?? cat.contract_address ?? cat.address;
}

export default function EventDetail() {
  const { id } = useParams();
  const { address } = useAccount();
  const { writeContractAsync } = useWriteContract();

  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [quantities, setQuantities] = useState({});
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [payStatus, setPayStatus] = useState(null); // null | 'loading' | 'success' | { error: string }

  useEffect(() => {
    Promise.all([api.getEvent(id), api.getCategories(id)])
      .then(([ev, cats]) => {
        setEvent(ev);
        setCategories(cats);
        setQuantities(Object.fromEntries(cats.map((c) => [c.id, 0])));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  const setQty = useCallback((catId, delta) => {
    setQuantities((prev) => {
      const cat = categories.find((c) => c.id === catId);
      const stock = getStock(cat);
      const next = Math.max(0, Math.min(stock, (prev[catId] ?? 0) + delta));
      return { ...prev, [catId]: next };
    });
  }, [categories]);

  const totalTickets = Object.values(quantities).reduce((s, q) => s + q, 0);
  const totalPrice = categories.reduce(
    (s, cat) => s + (quantities[cat.id] ?? 0) * getCatPrice(cat),
    0
  );
  const minPrice = categories.length > 0
    ? Math.min(...categories.map(getCatPrice))
    : 0;

  const handleCardPay = async () => {
    setPayStatus('loading');
    try {
      const tickets = categories
        .filter((cat) => (quantities[cat.id] ?? 0) > 0)
        .map((cat) => ({
          contract_address: getCatContractAddress(cat),
          quantity: quantities[cat.id],
        }));
      await api.pay({ buyer_address: address, tickets });
      setPayStatus('success');
    } catch (e) {
      setPayStatus({ error: e.message });
    }
  };

  const handleWalletPay = async () => {
    if (!address) return;
    setPayStatus('loading');
    try {
      for (const cat of categories) {
        const qty = quantities[cat.id] ?? 0;
        if (qty === 0) continue;
        const contractAddr = getCatContractAddress(cat);
        const priceWei = parseEther(String(getCatPrice(cat)));
        for (let i = 0; i < qty; i++) {
          await writeContractAsync({
            address: contractAddr,
            abi: MINT_ABI,
            functionName: 'mint',
            args: [address],
            value: priceWei,
          });
        }
      }
      setPayStatus('success');
    } catch (e) {
      setPayStatus({ error: e.message });
    }
  };

  if (loading) return <div className="event-detail-container"><p className="loading">Loading…</p></div>;
  if (error) return <div className="event-detail-container"><p className="error-msg">Error: {error}</p></div>;
  if (!event) return null;

  const banner = ipfsToHttp(event.bannerUrl ?? event.banner_url ?? event.image);

  return (
    <div className="event-detail-container">
      {banner
        ? <img className="event-detail-banner" src={banner} alt={event.title} />
        : <div className="event-detail-banner-placeholder" />}

      <h1 className="event-detail-title">{event.title}</h1>
      <p className="event-detail-desc">{event.description}</p>
      <p className="event-detail-date">{formatDate(event.date)}</p>

      {/* ── Tickets ── */}
      <div className="card">
        <div className="card-header">
          <span>TICKETS</span>
          {categories.length > 0 && (
            <span className="text-muted">starting at {minPrice.toFixed(2)} ETH</span>
          )}
        </div>

        {categories.length === 0 && (
          <p className="text-muted" style={{ fontSize: 14 }}>No ticket categories yet.</p>
        )}

        {categories.map((cat) => {
          const stock = getStock(cat);
          const qty = quantities[cat.id] ?? 0;
          return (
            <div key={cat.id} className="ticket-row">
              <div className="ticket-row-top">
                <div>
                  <span className="ticket-name">{cat.name ?? cat.title}</span>
                  <span className="ticket-stock">{stock} left</span>
                </div>
                <span className="ticket-price">{getCatPrice(cat)} ETH</span>
              </div>
              <div className="qty-control">
                <button
                  className="qty-btn"
                  onClick={() => setQty(cat.id, -1)}
                  disabled={qty === 0}
                  aria-label="Decrease quantity"
                >
                  –
                </button>
                <span className="qty-value">{qty}</span>
                <button
                  className="qty-btn"
                  onClick={() => setQty(cat.id, +1)}
                  disabled={qty >= stock || stock === 0}
                  aria-label="Increase quantity"
                >
                  +
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Checkout ── */}
      {totalTickets > 0 && (
        <div className="card">
          <div className="checkout-header">
            CHECKOUT — {totalTickets} ticket{totalTickets > 1 ? 's' : ''},{' '}
            {totalPrice.toFixed(2)} ETH
          </div>

          <div className="payment-methods">
            <div
              className={`payment-option${paymentMethod === 'card' ? ' selected' : ''}`}
              onClick={() => setPaymentMethod('card')}
              role="radio"
              aria-checked={paymentMethod === 'card'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPaymentMethod('card')}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'card'}
                onChange={() => setPaymentMethod('card')}
                readOnly
              />
              <div>
                <span className="payment-option-title">💳 Card payment</span>
                <span className="payment-option-desc">
                  Pay by card, the platform mints for you
                </span>
              </div>
            </div>

            <div
              className={`payment-option${paymentMethod === 'wallet' ? ' selected' : ''}`}
              onClick={() => setPaymentMethod('wallet')}
              role="radio"
              aria-checked={paymentMethod === 'wallet'}
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setPaymentMethod('wallet')}
            >
              <input
                type="radio"
                name="payment"
                checked={paymentMethod === 'wallet'}
                onChange={() => setPaymentMethod('wallet')}
                readOnly
              />
              <div>
                <span className="payment-option-title">🔗 Pay with wallet</span>
                <span className="payment-option-desc">
                  Buy on-chain for {totalPrice.toFixed(2)} ETH
                </span>
              </div>
            </div>
          </div>

          {/* Status feedback */}
          {payStatus === 'loading' && (
            <p className="checkout-status text-muted">Processing…</p>
          )}
          {payStatus === 'success' && (
            <p className="checkout-status text-success">✓ Payment successful!</p>
          )}
          {payStatus?.error && (
            <p className="checkout-status text-error">✗ {payStatus.error}</p>
          )}

          {paymentMethod === 'card' && (
            <button
              className="btn-primary"
              onClick={handleCardPay}
              disabled={payStatus === 'loading'}
            >
              Simulate card payment
            </button>
          )}

          {paymentMethod === 'wallet' && (
            <button
              className="btn-primary"
              onClick={handleWalletPay}
              disabled={payStatus === 'loading' || !address}
              title={!address ? 'Connect your wallet first' : undefined}
            >
              {!address ? 'Connect wallet to pay' : 'Pay with wallet'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
