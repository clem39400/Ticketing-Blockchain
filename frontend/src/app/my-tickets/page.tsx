'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { useAccount } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { getEvents, type EventInfo, type TicketInfo } from '@/lib/api';
import { formatEventDate, formatEth } from '@/lib/format';
import { useTicketBalances, ticketKey } from '@/hooks/useTicketContract';
import { Ticket, Wallet, ArrowRight } from 'lucide-react';

type OwnedTicket = { ticket: TicketInfo; count: number };
type OwnedEvent = { event: EventInfo; owned: OwnedTicket[] };

export default function MyTicketsPage() {
  const { isConnected } = useAccount();

  const { data: events, isLoading: eventsLoading } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  // One balanceOf(address, tokenId) call per ticket type, on ITS contract.
  const allTickets = useMemo(
    () => (events ?? []).flatMap((e) => e.tickets),
    [events]
  );
  const { balances, isLoading: balancesLoading } = useTicketBalances(allTickets);

  const ownedByEvent: OwnedEvent[] = useMemo(() => {
    if (!events) return [];
    return events
      .map((event) => ({
        event,
        owned: event.tickets
          .map((ticket) => ({
            ticket,
            count:
              balances[ticketKey(ticket.contractAddress, ticket.onChainTokenId)] ??
              0,
          }))
          .filter((o) => o.count > 0),
      }))
      .filter((g) => g.owned.length > 0);
  }, [events, balances]);

  const totalTickets = ownedByEvent.reduce(
    (s, g) => s + g.owned.reduce((s2, o) => s2 + o.count, 0),
    0
  );

  const isLoading = eventsLoading || balancesLoading;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">My tickets</h1>
        <p className="text-ink-muted mt-1.5">Vos billets NFT détenus on-chain.</p>
      </div>

      {!isConnected ? (
        <EmptyState
          icon={<Wallet className="w-7 h-7 text-ink-faint" />}
          title="Wallet non connecté"
          subtitle="Connectez votre wallet pour voir vos billets."
        />
      ) : isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="card h-24 animate-pulse" />
          ))}
        </div>
      ) : ownedByEvent.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-7 h-7 text-ink-faint" />}
          title="Aucun billet"
          subtitle="Vous ne détenez pas encore de billet."
          action={
            <Link href="/" className="btn-primary mt-5">
              Parcourir les événements
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink-muted mb-4">
            {totalTickets} billet{totalTickets > 1 ? 's' : ''} ·{' '}
            {ownedByEvent.length} événement{ownedByEvent.length > 1 ? 's' : ''}
          </p>
          <div className="space-y-8">
            {ownedByEvent.map(({ event, owned }) => (
              <section key={event.name}>
                <h2 className="font-bold text-ink mb-3">{event.name}</h2>
                <div className="space-y-4">
                  {owned.map(({ ticket, count }) => (
                    <div
                      key={ticketKey(ticket.contractAddress, ticket.onChainTokenId)}
                      className="card p-5 flex items-center gap-4"
                    >
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
                  ))}
                </div>
              </section>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function EmptyState({
  icon,
  title,
  subtitle,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="card text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-page border border-line flex items-center justify-center mx-auto mb-4">
        {icon}
      </div>
      <p className="font-semibold text-ink mb-1">{title}</p>
      <p className="text-sm text-ink-faint">{subtitle}</p>
      {action}
    </div>
  );
}
