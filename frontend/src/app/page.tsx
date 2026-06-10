'use client';

import Link from 'next/link';
import { formatEther } from 'viem';
import { useEventName, useCategoryCount, useAllCategories } from '@/hooks/useTicketContract';
import { EventBanner } from '@/components/EventBanner';
import { Calendar, MapPin, ArrowRight, Ticket } from 'lucide-react';

// The deployed contract represents one event. Metadata not stored on-chain
// (date / location) is shown as placeholders until wired to the API.
const EVENT_META = {
  date: '15 septembre 2025 · 20:00',
  location: 'Paris, France',
};

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

export default function EventsPage() {
  const { data: eventName, isLoading: nameLoading } = useEventName();
  const { data: count, isLoading: countLoading } = useCategoryCount();
  const catCount = count ? Number(count) : 0;
  const { categories, isLoading: catLoading } = useAllCategories(catCount);

  const loading = nameLoading || countLoading || catLoading;

  const minPrice =
    categories.length > 0
      ? categories.reduce((m, c) => (c.price < m ? c.price : m), categories[0].price)
      : null;
  const totalRemaining = categories.reduce((s, c) => s + Number(c.remaining), 0);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Events</h1>
        <p className="text-ink-muted mt-1.5">
          Réservez vos billets directement on-chain - transparents et vérifiables.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : !eventName ? (
        <div className="card text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-page border border-line flex items-center justify-center mx-auto mb-4">
            <Ticket className="w-7 h-7 text-ink-faint" />
          </div>
          <p className="font-semibold text-ink mb-1">Aucun événement</p>
          <p className="text-sm text-ink-faint">Aucun contrat d&apos;événement n&apos;est déployé.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <Link
            href="/event"
            className="card group overflow-hidden flex flex-col hover:border-line-strong hover:shadow-lift transition-all duration-200"
          >
            <div className="h-44 relative">
              <EventBanner name={eventName as string} />
              <span className="absolute top-3 left-3 badge bg-card/90 backdrop-blur border-line-strong text-ink font-semibold">
                {categories.length} catégorie{categories.length > 1 ? 's' : ''}
              </span>
            </div>
            <div className="p-5 flex flex-col flex-1">
              <p className="flex items-center gap-1.5 text-xs text-ink-muted mb-2">
                <Calendar className="w-3.5 h-3.5" />
                {EVENT_META.date}
              </p>
              <h3 className="text-lg font-bold text-ink leading-snug mb-1.5">
                {eventName as string}
              </h3>
              <p className="flex items-center gap-1.5 text-sm text-ink-muted mb-5">
                <MapPin className="w-3.5 h-3.5" />
                {EVENT_META.location}
              </p>

              <div className="mt-auto flex items-end justify-between pt-4 border-t border-line">
                <div>
                  <p className="text-xs text-ink-faint">À partir de</p>
                  <p className="text-lg font-extrabold text-ink">
                    {minPrice !== null ? `${formatEther(minPrice)} ETH` : '—'}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-sm font-semibold text-ink group-hover:gap-2 transition-all">
                  {totalRemaining > 0 ? 'Voir les billets' : 'Épuisé'}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}
    </div>
  );
}
