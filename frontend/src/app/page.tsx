'use client';

import { useCategoryCount, useAllCategories } from '@/hooks/useTicketContract';
import { HeroSection } from '@/components/HeroSection';
import { TicketCard } from '@/components/TicketCard';
import { Ticket, RefreshCw } from 'lucide-react';

function TicketSkeleton() {
  return (
    <div className="rounded-2xl bg-surface-card border border-surface-border overflow-hidden animate-pulse">
      <div className="h-2 bg-white/[0.06]" />
      <div className="p-6 space-y-4">
        <div className="h-4 w-1/2 bg-white/[0.06] rounded-full" />
        <div className="h-8 w-1/3 bg-white/[0.06] rounded-xl" />
        <div className="space-y-2">
          <div className="h-2 bg-white/[0.04] rounded-full" />
          <div className="h-2 bg-white/[0.04] rounded-full w-3/4" />
        </div>
        <div className="h-10 bg-white/[0.06] rounded-xl" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const { data: count, isLoading: countLoading } = useCategoryCount();
  const catCount = count ? Number(count) : 0;
  const { categories, isLoading, refetch } = useAllCategories(catCount);

  const loading = countLoading || isLoading;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
      <HeroSection />

      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Ticket className="w-5 h-5 text-indigo-400" />
          <h2 className="text-xl font-bold text-white">Catégories de billets</h2>
          {!loading && (
            <span className="text-xs font-medium glass rounded-full px-2.5 py-0.5 text-white/50">
              {categories.length}
            </span>
          )}
        </div>
        <button
          onClick={refetch}
          disabled={loading}
          className="btn-secondary flex items-center gap-1.5 text-sm py-2 px-4"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'spin-slow' : ''}`} />
          Actualiser
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 3 }).map((_, i) => <TicketSkeleton key={i} />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-24 glass rounded-2xl">
          <Ticket className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <p className="text-white/40 font-medium mb-1">Aucune catégorie disponible</p>
          <p className="text-sm text-white/20">
            L&apos;organisateur n&apos;a pas encore créé de catégories.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {categories.map((cat) => (
            <TicketCard key={cat.tokenId.toString()} category={cat} onBuySuccess={refetch} />
          ))}
        </div>
      )}
    </div>
  );
}
