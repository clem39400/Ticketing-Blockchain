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
  CalendarPlus,
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/* ---------- New event (API) ---------- */

function NewEventForm() {
  const [form, setForm] = useState({ name: '', description: '', date: '', banner: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.description.trim() || !form.date) {
      setStatus('error');
      setMessage('Nom, description et date sont requis.');
      return;
    }
    setStatus('sending');
    setMessage('');
    try {
      const params = new URLSearchParams({
        name: form.name.trim(),
        description: form.description.trim(),
        eventDate: form.date.split('T')[0], // API attend yyyy-MM-dd
        contractAddress: CONTRACT_ADDRESS,
      });
      if (form.banner.trim()) params.set('eventBanner', form.banner.trim());

      const res = await fetch(`${API_URL}/setup-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('ok');
      setMessage('Événement enregistré dans le back-office.');
      setForm({ name: '', description: '', date: '', banner: '' });
    } catch (err) {
      setStatus('error');
      setMessage(
        `Impossible de joindre l'API (${API_URL}). ${err instanceof Error ? err.message : ''}`
      );
    }
  };

  return (
    <section className="card p-6">
      <div className="flex items-center gap-2.5 mb-5">
        <CalendarPlus className="w-5 h-5 text-ink" />
        <h2 className="section-label">Nouvel événement</h2>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="field-label">Titre *</label>
          <input
            className="input"
            placeholder="ex: Concert Paris 1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
        </div>
        <div>
          <label className="field-label">Description *</label>
          <textarea
            className="input min-h-[88px] resize-y"
            placeholder="Décrivez l'événement…"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="field-label">Date & heure *</label>
            <input
              type="datetime-local"
              className="input"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Bannière (URL, optionnel)</label>
            <input
              className="input"
              placeholder="https://… ou ipfs://…"
              value={form.banner}
              onChange={(e) => setForm({ ...form, banner: e.target.value })}
            />
          </div>
        </div>

        {status === 'error' && (
          <p className="flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            {message}
          </p>
        )}
        {status === 'ok' && (
          <p className="flex items-center gap-2 text-sm text-emerald-600">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {message}
          </p>
        )}

        <button type="submit" disabled={status === 'sending'} className="btn-primary">
          {status === 'sending' ? <Loader2 className="w-4 h-4 spin-slow" /> : <Plus className="w-4 h-4" />}
          Créer l&apos;événement
        </button>
      </form>
    </section>
  );
}

/* ---------- Withdraw ---------- */

function WithdrawSection() {
  const { data: balance, refetch: refetchBalance } = useBalance({
    address: CONTRACT_ADDRESS,
    query: { refetchInterval: 15_000 },
  });
  const { withdraw, hash, isWritePending, isConfirming, isConfirmed, error, reset } = useWithdraw();
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (isWritePending || isConfirming) setStatus('pending');
    if (isConfirmed) {
      setStatus('success');
      refetchBalance();
    }
    if (error) setStatus('error');
  }, [isWritePending, isConfirming, isConfirmed, error, refetchBalance]);

  const ethBalance = balance ? parseFloat(formatEther(balance.value)) : 0;

  return (
    <div className="card p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div>
        <p className="text-sm text-ink-muted mb-1">ETH disponible au retrait</p>
        <p className="text-3xl font-extrabold text-ink tabular-nums">
          {ethBalance.toFixed(6)} <span className="text-base font-semibold text-ink-faint">ETH</span>
        </p>
      </div>

      <div className="flex items-center gap-3">
        {status === 'success' && (
          <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
            <CheckCircle2 className="w-4 h-4" />
            Retrait effectué
          </span>
        )}
        {status === 'error' && (
          <span className="flex items-center gap-1.5 text-red-500 text-sm">
            <AlertCircle className="w-4 h-4" />
            Erreur
          </span>
        )}
        {hash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-ink-muted hover:text-ink flex items-center gap-1"
          >
            Tx <ExternalLink className="w-3 h-3" />
          </a>
        )}
        <button
          disabled={ethBalance === 0 || status === 'pending'}
          onClick={() => {
            reset();
            setStatus('idle');
            withdraw();
          }}
          className="btn-primary"
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

/* ---------- Category row ---------- */

function CategoryRow({ cat }: { cat: TicketCategory }) {
  const sold = Number(cat.totalMinted);
  const total = Number(cat.maxSupply);
  const pct = total > 0 ? (sold / total) * 100 : 0;

  return (
    <tr className="border-b border-line last:border-0 hover:bg-page transition-colors">
      <td className="py-4 px-5">
        <span className="text-xs font-mono text-ink-faint mr-2">#{cat.tokenId.toString()}</span>
        <span className="text-sm font-medium text-ink">{cat.name}</span>
      </td>
      <td className="py-4 px-5 text-sm font-mono text-ink">{formatEther(cat.price)} ETH</td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[120px]">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs text-ink-muted whitespace-nowrap tabular-nums">
            {sold} / {total}
          </span>
        </div>
      </td>
      <td className="py-4 px-5">
        <span
          className={
            cat.remaining === BigInt(0)
              ? 'badge border-red-200 bg-red-50 text-red-600'
              : 'badge'
          }
        >
          {cat.remaining === BigInt(0) ? 'Épuisé' : `${cat.remaining.toString()} dispo.`}
        </span>
      </td>
    </tr>
  );
}

/* ---------- Page ---------- */

export default function AdminPage() {
  const isOwner = useIsOwner();
  const { data: owner } = useContractOwner();
  const { data: count, isLoading: countLoading } = useCategoryCount();
  const catCount = count ? Number(count) : 0;
  const { categories, isLoading, refetch } = useAllCategories(catCount);
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Admin</h1>
        <p className="text-ink-muted mt-1.5">Créez des événements et gérez vos billets on-chain.</p>
      </div>

      {/* New event - always available (writes to the API back-office) */}
      <NewEventForm />

      {/* On-chain section - owner only */}
      {countLoading || isLoading ? (
        <div className="card py-16 text-center">
          <Loader2 className="w-7 h-7 text-ink-faint mx-auto spin-slow" />
        </div>
      ) : !isOwner ? (
        <div className="card p-8 text-center">
          <div className="w-14 h-14 rounded-2xl bg-page border border-line flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-ink-faint" />
          </div>
          <h2 className="text-lg font-bold text-ink mb-1.5">Gestion on-chain restreinte</h2>
          <p className="text-ink-muted text-sm mb-3">
            Les catégories de billets et le retrait des fonds sont réservés au propriétaire du
            contrat.
          </p>
          {owner && (
            <p className="text-xs font-mono text-ink-faint break-all bg-page rounded-lg px-3 py-2 inline-block">
              Owner : {owner}
            </p>
          )}
        </div>
      ) : (
        <>
          <DashboardStats categories={categories} />
          <WithdrawSection />

          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <h2 className="section-label">Catégories de billets</h2>
              <div className="flex items-center gap-2">
                <button onClick={refetch} className="btn-ghost text-sm py-2 px-3">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualiser
                </button>
                <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm py-2 px-3.5">
                  <Plus className="w-4 h-4" />
                  Nouvelle catégorie
                </button>
              </div>
            </div>
            {categories.length === 0 ? (
              <div className="py-14 text-center text-sm text-ink-faint">
                Aucune catégorie créée.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line text-xs text-ink-faint uppercase tracking-label">
                      <th className="text-left py-3 px-5 font-semibold">Catégorie</th>
                      <th className="text-left py-3 px-5 font-semibold">Prix</th>
                      <th className="text-left py-3 px-5 font-semibold">Ventes</th>
                      <th className="text-left py-3 px-5 font-semibold">Statut</th>
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
        </>
      )}

      {showCreateModal && (
        <CreateCategoryModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            setShowCreateModal(false);
            refetch();
          }}
        />
      )}
    </div>
  );
}
