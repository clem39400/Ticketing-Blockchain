import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { api } from '../api';

function ipfsToHttp(url) {
  if (!url) return null;
  return url.startsWith('ipfs://') ? `https://ipfs.io/ipfs/${url.slice(7)}` : url;
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MyTickets() {
  const { address, isConnected } = useAccount();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;
    setLoading(true);
    api.getMyTickets(address)
      .then(setGroups)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [address]);

  if (!isConnected) {
    return (
      <div className="page-container">
        <h1 className="page-title">MY TICKETS</h1>
        <p className="my-tickets-empty">Connect your wallet to view your tickets.</p>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">MY TICKETS</h1>

      {loading && <p className="loading">Loading tickets…</p>}
      {error && <p className="error-msg">Error: {error}</p>}

      {!loading && !error && groups.length === 0 && (
        <p className="my-tickets-empty">You don't own any tickets yet.</p>
      )}

      {groups.map((group) => {
        const eventTitle = group.eventTitle ?? group.event?.title ?? 'Event';
        const eventDate = group.eventDate ?? group.event?.date;
        const tickets = group.tickets ?? group.items ?? [];

        return (
          <div key={group.eventId ?? group.id} className="my-tickets-group">
            <h2 className="my-tickets-group-title">{eventTitle}</h2>

            {tickets.map((ticket) => {
              const img = ipfsToHttp(ticket.imageUrl ?? ticket.image ?? ticket.nftImage);
              const categoryName = ticket.categoryName ?? ticket.category ?? '';
              const price = ticket.price ?? ticket.priceEth;
              const tokenIds = ticket.tokenIds ?? ticket.tokens ?? [];

              return (
                <div key={ticket.id ?? ticket.categoryId} className="ticket-item">
                  {img
                    ? <img className="ticket-item-img" src={img} alt={categoryName} loading="lazy" />
                    : <div className="ticket-item-img-placeholder" />}

                  <div className="ticket-item-info">
                    <div className="ticket-item-header">
                      <div>
                        <div className="ticket-item-title">{eventTitle}</div>
                        <div className="ticket-item-sub">
                          {categoryName}
                          {eventDate && ` · ${formatDate(eventDate)}`}
                        </div>
                      </div>
                      {price != null && (
                        <span className="ticket-item-price">{price} ETH</span>
                      )}
                    </div>

                    {tokenIds.length > 0 && (
                      <div className="token-badges">
                        {tokenIds.map((id) => (
                          <span key={id} className="token-badge">🎫 #{id}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
