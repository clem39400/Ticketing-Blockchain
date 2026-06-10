'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { getEvents, type EventInfo } from '@/lib/api';
import { formatEventDate, formatEth } from '@/lib/format';
import { EventBanner } from '@/components/EventBanner';
import { Calendar, ArrowRight, Ticket, AlertCircle } from 'lucide-react';

function EventCardSkeleton() {
  return (
    <div className="card overflow-hidden animate-pulse">
      <div className="h-44 bg-line" />
      <div className="p-5 space-y-3">
        <div className="h-3 w-1/3 bg-line rounded-full" />
        <div className="h-5 w-2/3 bg-line rounded-full" />
        <div className="h-3 w-1/4 bg-line rounded-full" />
      </div>
    </div>
  );
}

function EventCard({ event }: { event: EventInfo }) {
  const minPrice =
    event.tickets.length > 0
      ? event.tickets.reduce(
          (m, t) => (t.price < m ? t.price : m),
          event.tickets[0].price
        )
      : null;
  const totalSupply = event.tickets.reduce((s, t) => s + t.quantity, 0);

  return (
    <Link
      href={`/event?name=${encodeURIComponent(event.name)}`}
      className="card group overflow-hidden flex flex-col hover:border-line-strong hover:shadow-lift transition-all duration-200"
    >
      <div className="h-44 relative">
        <EventBanner name={event.name} src={event.eventBanner} />
        <span className="absolute top-3 left-3 badge bg-card/90 backdrop-blur border-line-strong text-ink font-semibold">
          {event.tickets.length} catégorie{event.tickets.length > 1 ? 's' : ''}
        </span>
      </div>
      <div className="p-5 flex flex-col flex-1">
        <p className="flex items-center gap-1.5 text-xs text-ink-muted mb-2">
          <Calendar className="w-3.5 h-3.5" />
          {formatEventDate(event.eventDate)}
        </p>
        <h3 className="text-lg font-bold text-ink leading-snug mb-1.5">
          {event.name}
        </h3>
        <p className="text-sm text-ink-muted mb-5 line-clamp-2">
          {event.description}
        </p>

        <div className="mt-auto flex items-end justify-between pt-4 border-t border-line">
          <div>
            <p className="text-xs text-ink-faint">À partir de</p>
            <p className="text-lg font-extrabold text-ink">
              {minPrice !== null ? formatEth(minPrice) : '—'}
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2 transition-all">
            {totalSupply > 0 ? 'Voir les billets' : 'Bientôt disponible'}
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function EventsPage() {
  const {
    data: events,
    isLoading,
    isError,
    error,
  } = useQuery({ queryKey: ['events'], queryFn: getEvents });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Events</h1>
        <p className="text-ink-muted mt-1.5">
          Réservez vos billets directement on-chain - transparents et vérifiables.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : isError ? (
        <div className="card text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-page border border-line flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-7 h-7 text-red-400" />
          </div>
          <p className="font-semibold text-ink mb-1">API indisponible</p>
          <p className="text-sm text-ink-faint">
            Impossible de charger les événements.{' '}
            {error instanceof Error ? error.message : ''}
          </p>
        </div>
      ) : !events || events.length === 0 ? (
        <div className="card text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-page border border-line flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-7 h-7 text-ink-faint" />
          </div>
          <p className="font-semibold text-ink mb-1">Aucun événement</p>
          <p className="text-sm text-ink-faint">
            Aucun événement n&apos;est enregistré pour le moment.
          </p>
        </div>
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
