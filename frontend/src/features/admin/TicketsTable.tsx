'use client';

import { formatEther } from 'viem';
import { Plus, RefreshCw } from 'lucide-react';
import type { EventInfo, TicketInfo } from '@/lib/api';
import type { OnChainCategory } from '@/contracts/Ticket';
import { formatEth } from '@/lib/format';
import { ticketKey } from '@/lib/tickets';
import { AddressLink } from '@/components/ui/TxLink';

function TicketTableRow({
  event,
  ticket,
  onChain,
  balanceWei,
}: {
  event: EventInfo;
  ticket: TicketInfo;
  onChain?: OnChainCategory;
  balanceWei?: bigint;
}) {
  const sold = onChain ? Number(onChain.minted) : null;
  const total = onChain ? Number(onChain.maxSupply) : ticket.quantity;
  const pct = sold !== null && total > 0 ? (sold / total) * 100 : 0;
  const remaining = sold !== null ? total - sold : null;

  return (
    <tr className="border-b border-line last:border-0 hover:bg-page transition-colors">
      <td className="py-4 px-5">
        <p className="text-sm font-medium text-ink">{ticket.name}</p>
        <p className="text-xs text-ink-faint">{event.name}</p>
      </td>
      <td className="py-4 px-5 text-sm font-mono text-ink">
        {onChain ? `${formatEther(onChain.price)} ETH` : formatEth(ticket.price)}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[120px]">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs text-ink-muted whitespace-nowrap tabular-nums">
            {sold !== null ? `${sold} / ${total}` : `— / ${total}`}
          </span>
        </div>
      </td>
      <td className="py-4 px-5 text-sm font-mono text-ink tabular-nums">
        {balanceWei !== undefined
          ? `${parseFloat(formatEther(balanceWei)).toFixed(4)} ETH`
          : '—'}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2">
          <span
            className={
              remaining === 0 ? 'badge border-red-200 bg-red-50 text-red-600' : 'badge'
            }
          >
            {remaining === null
              ? 'On-chain indisponible'
              : remaining === 0
                ? 'Épuisé'
                : `${remaining} dispo.`}
          </span>
          {ticket.contractAddress && <AddressLink address={ticket.contractAddress} />}
        </div>
      </td>
    </tr>
  );
}

/** Admin table of every ticket type with sales progress and contract balance. */
export function TicketsTable({
  rows,
  onChain,
  balances,
  onRefresh,
  onCreate,
  createDisabled,
}: {
  rows: { event: EventInfo; ticket: TicketInfo }[];
  onChain: Record<string, OnChainCategory>;
  balances?: Record<string, bigint>;
  onRefresh: () => void;
  onCreate: () => void;
  createDisabled: boolean;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="px-6 py-4 border-b border-line flex items-center justify-between">
        <h2 className="section-label">Billets</h2>
        <div className="flex items-center gap-2">
          <button onClick={onRefresh} className="btn-ghost text-sm py-2 px-3">
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
          <button
            onClick={onCreate}
            className="btn-primary text-sm py-2 px-3.5"
            disabled={createDisabled}
          >
            <Plus className="w-4 h-4" />
            Nouveau billet
          </button>
        </div>
      </div>
      {rows.length === 0 ? (
        <div className="py-14 text-center text-sm text-ink-faint">
          Aucun billet créé.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-line text-xs text-ink-faint uppercase tracking-label">
                <th className="text-left py-3 px-5 font-semibold">Billet</th>
                <th className="text-left py-3 px-5 font-semibold">Prix</th>
                <th className="text-left py-3 px-5 font-semibold">Ventes</th>
                <th className="text-left py-3 px-5 font-semibold">Solde ETH</th>
                <th className="text-left py-3 px-5 font-semibold">Statut</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ event, ticket }) => {
                const key = ticketKey(ticket.contractAddress, ticket.onChainTokenId);
                return (
                  <TicketTableRow
                    key={key}
                    event={event}
                    ticket={ticket}
                    onChain={onChain[key]}
                    balanceWei={
                      ticket.contractAddress
                        ? balances?.[ticket.contractAddress.toLowerCase()]
                        : undefined
                    }
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
