'use client';

import { useEvents } from '@/hooks/useEvents';
import { EventCard, EventCardSkeleton } from './EventCard';
import { EmptyState } from '@/components/ui/EmptyState';
import { Ticket, AlertCircle, ShieldCheck, Zap, Fingerprint } from 'lucide-react';

const HIGHLIGHTS = [
  { icon: ShieldCheck, label: 'Billets NFT infalsifiables' },
  { icon: Zap, label: 'Achat en ETH ou en euros' },
  { icon: Fingerprint, label: 'Propriété vérifiable on-chain' },
];

function Hero() {
  return (
    <div className="mb-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-ink">
        Vos billets, <span className="text-accent">sur la blockchain</span>
      </h1>
      <p className="text-ink-muted mt-2 max-w-xl">
        Réservez vos billets directement on-chain — transparents, vérifiables et
        impossibles à falsifier.
      </p>
      <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5">
        {HIGHLIGHTS.map(({ icon: Icon, label }) => (
          <span
            key={label}
            className="flex items-center gap-1.5 text-xs font-medium text-ink-muted"
          >
            <Icon className="w-3.5 h-3.5 text-accent" />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Home page: hero + grid of all events. */
export function EventsPage() {
  const { data: events, isLoading, isError, error } = useEvents();

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <Hero />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <EmptyState
          icon={<AlertCircle className="w-7 h-7 text-red-400" />}
          title="API indisponible"
          subtitle={`Impossible de charger les événements. ${
            error instanceof Error ? error.message : ''
          }`}
        />
      ) : !events || events.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-7 h-7 text-ink-faint" />}
          title="Aucun événement"
          subtitle="Aucun événement n'est enregistré pour le moment."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {events.map((event) => (
            <EventCard key={event.name} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
