'use client';

import { useState } from 'react';
import { formatEther } from 'viem';
import { useAccount } from 'wagmi';
import { useUserBalance } from '@/hooks/useTicketContract';
import type { TicketCategory } from '@/contracts/EventTicket1155';
import { BuyModal } from './BuyModal';
import { ShoppingCart, Wallet, Check } from 'lucide-react';
import clsx from 'clsx';

const CATEGORY_STYLES: Record<string, { gradient: string; badge: string; glow: string }> = {
  default: {
    gradient: 'from-indigo-500/20 to-purple-500/20',
    badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    glow: 'shadow-indigo-500/20',
  },
  vip: {
    gradient: 'from-amber-500/20 to-orange-500/20',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    glow: 'shadow-amber-500/20',
  },
  premium: {
    gradient: 'from-purple-500/20 to-pink-500/20',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    glow: 'shadow-purple-500/20',
  },
};

function getStyle(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('vip')) return CATEGORY_STYLES.vip;
  if (lower.includes('premium') || lower.includes('gold')) return CATEGORY_STYLES.premium;
  return CATEGORY_STYLES.default;
}

type Props = {
  category: TicketCategory;
  onBuySuccess: () => void;
};

export function TicketCard({ category, onBuySuccess }: Props) {
  const { address } = useAccount();
  const { data: userBalance } = useUserBalance(category.tokenId);
  const [showModal, setShowModal] = useState(false);

  const style = getStyle(category.name);
  const isSoldOut = category.remaining === BigInt(0);
  const soldPct =
    Number(category.totalMinted * BigInt(100)) / Number(category.maxSupply);
  const owned = userBalance ? Number(userBalance) : 0;

  return (
    <>
      <div
        className={clsx(
          'relative group rounded-2xl overflow-hidden border border-white/[0.08] bg-surface-card',
          'hover:border-white/[0.16] hover:shadow-xl transition-all duration-300',
          !isSoldOut && style.glow
        )}
      >
        {/* Gradient top band */}
        <div className={clsx('h-2 w-full bg-gradient-to-r', style.gradient)} />

        {/* Sold out overlay */}
        {isSoldOut && (
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] z-10 flex items-center justify-center rounded-2xl">
            <span className="text-2xl font-black text-white/30 rotate-[-12deg] border-4 border-white/20 rounded-xl px-4 py-2 uppercase tracking-widest">
              Épuisé
            </span>
          </div>
        )}

        <div className="p-6">
          {/* Badge + owned */}
          <div className="flex items-center justify-between mb-4">
            <span
              className={clsx(
                'text-xs font-semibold px-2.5 py-1 rounded-full border',
                style.badge
              )}
            >
              #{category.tokenId.toString()} · {category.name}
            </span>
            {owned > 0 && (
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-medium">
                <Check className="w-3.5 h-3.5" />
                {owned} billet{owned > 1 ? 's' : ''}
              </span>
            )}
          </div>

          {/* Price */}
          <div className="mb-5">
            <p className="text-xs text-white/40 mb-1">Prix par billet</p>
            <p className="text-3xl font-extrabold text-white tracking-tight">
              {formatEther(category.price)}{' '}
              <span className="text-lg font-medium text-white/50">ETH</span>
            </p>
          </div>

          {/* Supply progress */}
          <div className="mb-5 space-y-1.5">
            <div className="flex justify-between text-xs text-white/40">
              <span>{category.totalMinted.toString()} vendus</span>
              <span>{category.maxSupply.toString()} max</span>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${soldPct}%` }}
              />
            </div>
            <p className="text-xs text-white/50 text-right">
              <span
                className={clsx(
                  'font-semibold',
                  isSoldOut ? 'text-red-400' : 'text-emerald-400'
                )}
              >
                {isSoldOut ? '0' : category.remaining.toString()}
              </span>{' '}
              restants
            </p>
          </div>

          {/* CTA */}
          {!address ? (
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 btn-secondary text-sm opacity-70"
            >
              <Wallet className="w-4 h-4" />
              Wallet requis
            </button>
          ) : (
            <button
              disabled={isSoldOut}
              onClick={() => setShowModal(true)}
              className={clsx(
                'w-full flex items-center justify-center gap-2 text-sm',
                isSoldOut ? 'btn-secondary opacity-40' : 'btn-primary'
              )}
            >
              <ShoppingCart className="w-4 h-4" />
              {isSoldOut ? 'Épuisé' : 'Acheter'}
            </button>
          )}
        </div>
      </div>

      {showModal && (
        <BuyModal
          category={category}
          onClose={() => setShowModal(false)}
          onSuccess={() => { setShowModal(false); onBuySuccess(); }}
        />
      )}
    </>
  );
}
