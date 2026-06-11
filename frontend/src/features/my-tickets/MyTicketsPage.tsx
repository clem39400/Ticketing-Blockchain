'use client';

import Link from 'next/link';
import { useAccount } from 'wagmi';
import { Ticket, Wallet, ArrowRight } from 'lucide-react';
import { ticketKey } from '@/lib/tickets';
import { EmptyState } from '@/components/ui/EmptyState';
import { useOwnedTickets } from './useOwnedTickets';
import { OwnedTicketCard } from './OwnedTicketCard';

/** "My tickets" page: NFT tickets held by the connected wallet. */
export function MyTicketsPage() {
  const { isConnected } = useAccount();
  const { ownedByEvent, totalTickets, isLoading } = useOwnedTickets();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">
          My tickets
        </h1>
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
                    <OwnedTicketCard
                      key={ticketKey(ticket.contractAddress, ticket.onChainTokenId)}
                      event={event}
                      ticket={ticket}
                      count={count}
                    />
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
