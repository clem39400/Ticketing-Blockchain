'use client';

import { useState, useEffect } from 'react';
import { formatEther } from 'viem';
import { useBalance } from 'wagmi';
import {
  useCategoryCount,
  useAllCategories,
  useIsOwner,
  useWithdraw,
  useContractOwner,
} from '@/hooks/useTicketContract';
import { CONTRACT_ADDRESS, type TicketCategory } from '@/contracts/EventTicket1155';
import { DashboardStats } from '@/components/DashboardStats';
import { CreateCategoryModal } from '@/components/CreateCategoryModal';
import {
  Plus,
  ArrowDownToLine,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lock,
  ExternalLink,
  RefreshCw,
} from 'lucide-react';

function CategoryRow({ cat }: { cat: TicketCategory }) {
  const sold = Number(cat.totalMinted);
  const total = Number(cat.maxSupply);
  const pct = total > 0 ? (sold / total) * 100 : 0;

  return (
    <tr className="border-b border-surface-border last:border-0 group hover:bg-white/[0.02] transition-colors">
      <td className="py-4 px-4">
        <span className="text-xs font-mono text-white/30 mr-2">#{cat.tokenId.toString()}</span>
        <span className="text-sm font-medium text-white">{cat.name}</span>
      </td>
      <td className="py-4 px-4 text-sm font-mono text-indigo-300">
        {formatEther(cat.price)} ETH
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[120px]">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs text-white/50 whitespace-nowrap">
            {sold} / {total}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 text-sm">
        <span
          className={
            cat.remaining === BigInt(0)
              ? 'text-red-400'
              : 'text-emerald-400'
          }
        >
          {cat.remaining === BigInt(0) ? 'Épuisé' : `${cat.remaining.toString()} dispo.`}
        </span>
      </td>
    </tr>
  );
}

function WithdrawSection() {
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: CONTRACT_ADDRESS,
    query: { refetchInterval: 15_000 },
  });
  const { withdraw, hash, isWritePending, isConfirming, isConfirmed, error, reset } =
    useWithdraw();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isWritePending || isConfirming) setStatus('pending');
    if (isConfirmed) { setStatus('success'); refetchBalance(); }
    if (error) setStatus('error');
  }, [isWritePending, isConfirming, isConfirmed, error, refetchBalance]);

  const ethBalance = balance ? parseFloat(formatEther(balance.value)) : 0;

  return (
    <div className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm text-white/50 mb-1">ETH disponible au retrait</p>
        <p className="text-2xl font-bold text-white">
          {ethBalance.toFixed(6)}{' '}
          <span className="text-base font-medium text-white/40">ETH</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {status === 'success' && (
          <span className="flex items-center gap-1.5 text-emerald-400 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Retrait effectué
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            Erreur
          </span>
        )}
        {hash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            Tx <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button
          disabled={ethBalance === 0 || status === 'pending'}
          onClick={() => { reset(); setStatus('idle'); withdraw(); }}
          className="btn-primary flex items-center gap-2 text-sm py-2.5"
        >
          {status === 'pending' ? (
            <Loader2 className="w-4 h-4 spin-slow" />
          ) : (
            <ArrowDownToLine className="w-4 h-4" />
          )}
          {status === 'pending' ? 'En cours…' : 'Retirer les fonds'}
        </button>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const isOwner = useIsOwner();
  const { data: owner } = useContractOwner();
  const { data: count, isLoading: countLoading } = useCategoryCount();
  const catCount = count ? Number(count) : 0;
  const { categories, isLoading, refetch } = useAllCategories(catCount);
  const [showCreateModal, setShowCreateModal] = useState(false);

  if (countLoading || isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Loader2 className="w-8 h-8 text-indigo-400 mx-auto spin-slow" />
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-24 text-center">
        <div className="glass rounded-2xl p-12 max-w-md mx-auto">
          <Lock className="w-12 h-12 text-white/20 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Accès restreint</h2>
          <p className="text-white/40 text-sm mb-4">
            Ce dashboard est réservé au propriétaire du contrat.
          </p>
          {owner && (
            <p className="text-xs font-mono text-white/25 break-all">
              Owner : {owner}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Dashboard Organisateur</h1>
          <p className="text-sm text-white/40 mt-1">Gérez vos catégories et vos revenus</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={refetch} className="btn-secondary flex items-center gap-1.5 text-sm">
            <RefreshCw className="w-3.5 h-3.5" />
            Actualiser
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4" />
            Nouvelle catégorie
          </button>
        </div>
      </div>

      {/* Stats */}
      <DashboardStats categories={categories} />

      {/* Withdraw */}
      <WithdrawSection />

      {/* Categories table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-border flex items-center justify-between">
          <h2 className="font-semibold text-white">Catégories de billets</h2>
          <span className="text-xs text-white/30">{categories.length} total</span>
        </div>
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <p className="text-white/30 text-sm">Aucune catégorie créée.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-surface-border text-xs text-white/30 uppercase tracking-wider">
                  <th className="text-left py-3 px-4 font-medium">Catégorie</th>
                  <th className="text-left py-3 px-4 font-medium">Prix</th>
                  <th className="text-left py-3 px-4 font-medium">Ventes</th>
                  <th className="text-left py-3 px-4 font-medium">Statut</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <CategoryRow key={cat.tokenId.toString()} cat={cat} />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => { setShowCreateModal(false); refetch(); }}
        />
      )}
    </div>
  );
}
