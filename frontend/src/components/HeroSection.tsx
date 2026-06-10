'use client';

import { useEventName } from '@/hooks/useTicketContract';
import { MapPin, Calendar, Zap } from 'lucide-react';

export function HeroSection() {
  const { data: eventName, isLoading } = useEventName();

  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      {/* Ambient background blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -left-32 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse-slow"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -top-16 right-0 w-80 h-80 rounded-full bg-purple-600/15 blur-3xl animate-pulse-slow"
        style={{ animationDelay: '2s' }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-32 bg-indigo-500/10 blur-3xl"
      />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 text-center">
        <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 text-xs font-medium text-indigo-300 mb-6">
          <Zap className="w-3.5 h-3.5" />
          Billetterie sur Ethereum · Sepolia Testnet
        </div>

        {isLoading ? (
          <div className="h-16 w-72 mx-auto rounded-2xl bg-white/[0.05] animate-pulse mb-4" />
        ) : (
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-4">
            {eventName ?? 'Concert Paris 1'}
          </h1>
        )}

        <p className="text-white/50 text-lg mb-8 max-w-md mx-auto">
          Achetez vos billets directement sur la blockchain — transparence totale,
          zéro intermédiaire.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-white/40">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            15 Septembre 2025
          </span>
          <span className="w-1 h-1 rounded-full bg-white/20" />
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4" />
            Paris, France
          </span>
        </div>
      </div>
    </section>
  );
}
