'use client';

import { useState } from 'react';
import { formatEther } from 'viem';
import { ArrowDownToLine, CheckCircle2, AlertCircle } from 'lucide-react';
import { collectEth, type EventInfo } from '@/lib/api';
import { Spinner } from '@/components/ui/Spinner';
import { TxLink } from '@/components/ui/TxLink';

function CollectEthRow({
  event,
  balances,
}: {
  event: EventInfo;
  balances?: Record<string, bigint>;
}) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [txHashes, setTxHashes] = useState<string[]>([]);

  const totalWei = event.tickets.reduce(
    (sum, t) =>
      sum +
      (t.contractAddress
        ? balances?.[t.contractAddress.toLowerCase()] ?? BigInt(0)
        : BigInt(0)),
    BigInt(0)
  );
  const eth = parseFloat(formatEther(totalWei));

  const collect = async () => {
    setStatus('pending');
    setMessage('');
    setTxHashes([]);
    try {
      const { txHashes: hashes } = await collectEth(event.name);
      setTxHashes(hashes ?? []);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="py-4 px-5 border-b border-line last:border-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{event.name}</p>
          <p className="text-xs text-ink-muted">
            {event.tickets.length} contrat{event.tickets.length > 1 ? 's' : ''} ·{' '}
            <span className="font-bold text-ink tabular-nums">{eth.toFixed(6)} ETH</span>{' '}
            à collecter
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Collecté
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-red-500 text-sm" title={message}>
              <AlertCircle className="w-4 h-4" />
              Erreur
            </span>
          )}
          <button
            disabled={status === 'pending' || event.tickets.length === 0 || totalWei === BigInt(0)}
            onClick={collect}
            className="btn-primary text-sm py-2 px-3.5"
          >
            {status === 'pending' ? <Spinner /> : <ArrowDownToLine className="w-4 h-4" />}
            {status === 'pending' ? 'Collecte en cours…' : "Collecter l'ETH"}
          </button>
        </div>
      </div>
      {status === 'error' && message && (
        <p className="text-xs text-red-500 mt-2 break-all">{message}</p>
      )}
      {txHashes.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {txHashes.map((h) => (
            <TxLink key={h} hash={h} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Per-event ETH withdrawal panel (the backend owns the contracts). */
export function CollectEthPanel({
  events,
  balances,
}: {
  events: EventInfo[];
  balances?: Record<string, bigint>;
}) {
  const withTickets = events.filter((e) => e.tickets.length > 0);

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="section-label">Collecte des fonds</h2>
        <p className="text-xs text-ink-faint mt-1">
          Le retrait est effectué par la plateforme (propriétaire des contrats)
          sur chaque contrat de billet de l&apos;événement.
        </p>
      </div>
      {withTickets.length === 0 ? (
        <div className="py-10 text-center text-sm text-ink-faint">
          Aucun événement avec billets.
        </div>
      ) : (
        withTickets.map((event) => (
          <CollectEthRow key={event.name} event={event} balances={balances} />
        ))
      )}
    </div>
  );
}
