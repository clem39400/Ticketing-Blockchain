'use client';

import type { EventInfo } from '@/lib/api';
import { formatEventDate } from '@/lib/format';

/** Compact recap list of all registered events. */
export function EventsRecap({ events }: { events: EventInfo[] }) {
  if (events.length === 0) return null;

  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-4 border-b border-line">
        <h2 className="section-label">Événements</h2>
      </div>
      {events.map((event) => (
        <div
          key={event.name}
          className="flex items-center justify-between gap-4 px-5 py-3.5 border-b border-line last:border-0"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{event.name}</p>
            <p className="text-xs text-ink-faint">
              {formatEventDate(event.eventDate)} · {event.tickets.length}{' '}
              type{event.tickets.length > 1 ? 's' : ''} de billet
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
