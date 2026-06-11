'use client';

import Link from 'next/link';
import type { EventInfo } from '@/lib/api';
import { minTicketPrice } from '@/lib/tickets';
import { formatEventDate, formatEth } from '@/lib/format';
import { EventBanner } from './EventBanner';
import { Calendar, ArrowRight } from 'lucide-react';

/** Clickable event summary card shown in the home page grid. */
export function EventCard({ event }: { event: EventInfo }) {
  const minPrice = minTicketPrice(event.tickets);
  const totalSupply = event.tickets.reduce((s, t) => s + t.quantity, 0);

  return (
    <Link
      href={`/event?name=${encodeURIComponent(event.name)}`}
      className="card group overflow-hidden flex flex-col hover:border-line-strong hover:shadow-lift hover:-translate-y-0.5 transition-all duration-200"
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
          <span className="flex items-center gap-1 text-sm font-semibold text-accent group-hover:gap-2 transition-all">
            {totalSupply > 0 ? 'Voir les billets' : 'Bientôt disponible'}
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

/** Pulsing placeholder matching EventCard's layout. */
export function EventCardSkeleton() {
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
