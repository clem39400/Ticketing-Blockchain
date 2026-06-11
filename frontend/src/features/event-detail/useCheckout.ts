'use client';

import { useEffect, useMemo, useState } from 'react';
import { useAccount } from 'wagmi';
import { buyTicketEur, type TicketInfo } from '@/lib/api';
import { computeBuyValue, isOnChain, ticketKey } from '@/lib/tickets';
import { useOnChainCategories } from '@/hooks/contracts/useOnChainCategories';
import { useBuyTickets } from '@/hooks/contracts/useBuyTickets';

export type PayMethod = 'card' | 'wallet';
export type CheckoutMode =
  | 'idle'
  | 'card-processing'
  | 'card-success'
  | 'wallet-processing'
  | 'wallet-success'
  | 'error';

type WalletQueueItem = {
  contractAddress: string;
  tokenId: number;
  quantity: number;
  valueWei: bigint;
};

/**
 * Checkout state machine for the event detail page: quantity selection,
 * payment method, the sequential wallet (ETH) purchase queue and the
 * card (EUR, backend mint) flow.
 */
export function useCheckout(eventName: string, tickets: TicketInfo[]) {
  const { address } = useAccount();
  const { categories: onChain, refetch: refetchOnChain } =
    useOnChainCategories(tickets);

  const [qty, setQty] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<PayMethod>('card');
  const [mode, setMode] = useState<CheckoutMode>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<string[]>([]);

  // Wallet (ETH) sequential purchase queue — one buy() per ticket TYPE.
  const [queue, setQueue] = useState<WalletQueueItem[]>([]);
  const [qIndex, setQIndex] = useState(0);

  const { buy, hash, isConfirmed, error: buyError, reset } = useBuyTickets();

  const getQty = (key: string) => qty[key] ?? 0;
  const setQtyFor = (key: string, v: number) =>
    setQty((q) => ({ ...q, [key]: Math.max(0, v) }));

  const remainingOf = (t: TicketInfo): number => {
    const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
    if (cat) return Number(cat.maxSupply - cat.minted);
    return t.quantity; // DB fallback (max supply)
  };

  const { totalTickets, totalPriceWei } = useMemo(() => {
    let count = 0;
    let wei = BigInt(0);
    for (const t of tickets) {
      const n = getQty(ticketKey(t.contractAddress, t.onChainTokenId));
      if (n === 0) continue;
      count += n;
      const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
      wei += computeBuyValue(t.price, n, cat?.price);
    }
    return { totalTickets: count, totalPriceWei: wei };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, qty, onChain]);

  // Drive the wallet queue: when a tx confirms, fire the next buy().
  useEffect(() => {
    if (mode !== 'wallet-processing') return;
    if (buyError) {
      setErrorMsg(buyError.message?.slice(0, 160) ?? 'La transaction a échoué.');
      setMode('error');
      return;
    }
    if (isConfirmed) {
      if (hash) setTxHashes((prev) => [...prev, hash]);
      const next = qIndex + 1;
      if (next < queue.length) {
        setQIndex(next);
        reset();
        const item = queue[next];
        buy(item.contractAddress, item.tokenId, item.quantity, item.valueWei);
      } else {
        setMode('wallet-success');
        refetchOnChain();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, buyError, mode]);

  /** Sets an error asking the user to connect; true when a wallet is present. */
  const requireWallet = (): boolean => {
    if (address) return true;
    setErrorMsg(
      'Connectez votre wallet : les billets seront mintés vers votre adresse.'
    );
    setMode('error');
    return false;
  };

  const startWallet = () => {
    const items: WalletQueueItem[] = [];
    for (const t of tickets) {
      if (!isOnChain(t)) continue; // not deployed yet — cannot be bought
      const n = getQty(ticketKey(t.contractAddress, t.onChainTokenId));
      if (n === 0) continue;
      const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
      items.push({
        contractAddress: t.contractAddress,
        tokenId: t.onChainTokenId,
        quantity: n,
        valueWei: computeBuyValue(t.price, n, cat?.price),
      });
    }
    if (items.length === 0) return;
    setQueue(items);
    setQIndex(0);
    setTxHashes([]);
    setErrorMsg(null);
    setMode('wallet-processing');
    reset();
    buy(items[0].contractAddress, items[0].tokenId, items[0].quantity, items[0].valueWei);
  };

  /** Card flow: the backend mints to the connected wallet, one tx per type. */
  const startCard = async () => {
    if (!requireWallet()) return;
    const selected = tickets.filter(
      (t) => getQty(ticketKey(t.contractAddress, t.onChainTokenId)) > 0
    );
    if (selected.length === 0) return;

    setMode('card-processing');
    setErrorMsg(null);
    setTxHashes([]);
    try {
      const hashes: string[] = [];
      for (const t of selected) {
        const n = getQty(ticketKey(t.contractAddress, t.onChainTokenId));
        const { txHash } = await buyTicketEur({
          eventName,
          ticketName: t.name,
          quantity: n,
          buyerAddress: address!,
        });
        hashes.push(txHash);
        setTxHashes([...hashes]);
      }
      setMode('card-success');
      refetchOnChain();
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Le paiement a échoué.');
      setMode('error');
    }
  };

  const resetCheckout = () => {
    setMode('idle');
    setQty({});
    setQueue([]);
    setQIndex(0);
    setTxHashes([]);
    setErrorMsg(null);
    reset();
  };

  return {
    address,
    onChain,
    getQty,
    setQtyFor,
    remainingOf,
    totalTickets,
    totalPriceWei,
    method,
    setMethod,
    mode,
    errorMsg,
    txHashes,
    progress: { current: qIndex + 1, total: queue.length },
    requireWallet,
    startWallet,
    startCard,
    resetCheckout,
  };
}
