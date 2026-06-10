'use client';

import Link from 'next/link';
import { formatEther } from 'viem';
import { useAccount, useReadContracts } from 'wagmi';
import { CONTRACT_ADDRESS, EVENT_TICKET_ABI } from '@/contracts/EventTicket1155';
import { useEventName, useCategoryCount, useAllCategories } from '@/hooks/useTicketContract';
import { Ticket, Wallet, ArrowRight } from 'lucide-react';

const EVENT_META = { date: '15 septembre 2025 · 20:00' };

export default function MyTicketsPage() {
  const { address, isConnected } = useAccount();
  const { data: eventName } = useEventName();
  const { data: count } = useCategoryCount();
  const catCount = count ? Number(count) : 0;
  const { categories, isLoading } = useAllCategories(catCount);

  const { data: balances } = useReadContracts({
    contracts: categories.map((c) => ({
      address: CONTRACT_ADDRESS,
      abi: EVENT_TICKET_ABI,
      functionName: 'balanceOf' as const,
      args: address ? ([address, c.tokenId] as const) : undefined,
    })),
    query: { enabled: !!address && categories.length > 0 },
  });

  const owned = categories
    .map((c, i) => {
      const bal = balances?.[i]?.status === 'success' ? Number(balances[i].result as bigint) : 0;
      return { cat: c, count: bal };
    })
    .filter((o) => o.count > 0);

  const totalTickets = owned.reduce((s, o) => s + o.count, 0);

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
      ) : owned.length === 0 ? (
        <EmptyState
          icon={<Ticket className="w-7 h-7 text-ink-faint" />}
          title="Aucun billet"
          subtitle="Vous ne détenez pas encore de billet pour cet événement."
          action={
            <Link href="/event" className="btn-primary mt-5">
              Parcourir les billets
              <ArrowRight className="w-4 h-4" />
            </Link>
          }
        />
      ) : (
        <>
          <p className="text-sm text-ink-muted mb-4">
            {totalTickets} billet{totalTickets > 1 ? 's' : ''} ·{' '}
            {(eventName as string) ?? 'Event'}
          </p>
          <div className="space-y-4">
            {owned.map(({ cat, count }) => (
              <div key={cat.tokenId.toString()} className="card p-5 flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-ink flex items-center justify-center shrink-0">
                  <Ticket className="w-6 h-6 text-white" strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-ink truncate">{(eventName as string) ?? 'Event'}</p>
                  <p className="text-sm text-ink-muted">
                    {cat.name} · {formatEther(cat.price)} ETH · {EVENT_META.date}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="badge border-line-strong text-ink font-semibold">
                    × {count}
                  </span>
                  <p className="text-[11px] text-ink-faint mt-1 font-mono">#{cat.tokenId.toString()}</p>
                </div>
              </div>
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
