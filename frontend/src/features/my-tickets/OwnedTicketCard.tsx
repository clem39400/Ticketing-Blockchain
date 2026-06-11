'use client';

import { Ticket } from 'lucide-react';
import type { EventInfo, TicketInfo } from '@/lib/api';
import { formatEventDate, formatEth } from '@/lib/format';

/** One owned ticket type: event, category, price and held quantity. */
export function OwnedTicketCard({
  event,
  ticket,
  count,
}: {
  event: EventInfo;
  ticket: TicketInfo;
  count: number;
}) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className="w-14 h-14 rounded-xl bg-ink flex items-center justify-center shrink-0">
        <Ticket className="w-6 h-6 text-white" strokeWidth={2} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-bold text-ink truncate">{event.name}</p>
        <p className="text-sm text-ink-muted">
          {ticket.name} · {formatEth(ticket.price)} ·{' '}
          {formatEventDate(event.eventDate)}
        </p>
        <p className="text-[11px] text-ink-faint font-mono truncate mt-0.5">
          {ticket.contractAddress}
        </p>
      </div>
      <div className="text-right shrink-0">
        <span className="badge border-line-strong text-ink font-semibold">
          × {count}
        </span>
        <p className="text-[11px] text-ink-faint mt-1 font-mono">
          #{ticket.onChainTokenId}
        </p>
      </div>
    </div>
  );
}
