'use client';

import { useMemo, useState } from 'react';
import { formatEther } from 'viem';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getEvents,
  setupEvent,
  collectEth,
  type EventInfo,
  type TicketInfo,
} from '@/lib/api';
import { formatEth, formatEventDate } from '@/lib/format';
import {
  useOnChainCategories,
  useContractEthBalances,
  ticketKey,
} from '@/hooks/useTicketContract';
import type { OnChainCategory } from '@/contracts/Ticket';
import { DashboardStats } from '@/components/DashboardStats';
import { CreateCategoryModal } from '@/components/CreateCategoryModal';
import {
  Plus,
  ArrowDownToLine,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  CalendarPlus,
} from 'lucide-react';

/* ---------- New event (API) ---------- */

function NewEventForm() {
  const queryClient = useQueryClient();
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
      await setupEvent({
        name: form.name.trim(),
        description: form.description.trim(),
        eventDate: form.date.split('T')[0], // API attend yyyy-MM-dd
        eventBanner: form.banner.trim() || undefined,
      });
      setStatus('ok');
      setMessage('Événement enregistré dans le back-office.');
      setForm({ name: '', description: '', date: '', banner: '' });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    } catch (err) {
      setStatus('error');
      setMessage(
        `Impossible de créer l'événement. ${err instanceof Error ? err.message : ''}`
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

/* ---------- Collect ETH (backend withdraw) ---------- */

function CollectEthRow({
  event,
  balances,
}: {
  event: EventInfo;
  balances?: Record<string, bigint>;
}) {
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [txHashes, setTxHashes] = useState<string[]>([]);

  const totalWei = event.tickets.reduce(
    (sum, t) =>
      sum +
      (t.contractAddress
        ? balances?.[t.contractAddress.toLowerCase()] ?? BigInt(0)
        : BigInt(0)),
    BigInt(0)
  );
  const eth = parseFloat(formatEther(totalWei));

  const collect = async () => {
    setStatus('pending');
    setMessage('');
    setTxHashes([]);
    try {
      const { txHashes: hashes } = await collectEth(event.name);
      setTxHashes(hashes ?? []);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setMessage(err instanceof Error ? err.message : 'Erreur inconnue');
    }
  };

  return (
    <div className="py-4 px-5 border-b border-line last:border-0">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="font-semibold text-ink">{event.name}</p>
          <p className="text-xs text-ink-muted">
            {event.tickets.length} contrat{event.tickets.length > 1 ? 's' : ''} ·{' '}
            <span className="font-bold text-ink tabular-nums">{eth.toFixed(6)} ETH</span>{' '}
            à collecter
          </p>
        </div>
        <div className="flex items-center gap-3">
          {status === 'success' && (
            <span className="flex items-center gap-1.5 text-emerald-600 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              Collecté
            </span>
          )}
          {status === 'error' && (
            <span className="flex items-center gap-1.5 text-red-500 text-sm" title={message}>
              <AlertCircle className="w-4 h-4" />
              Erreur
            </span>
          )}
          <button
            disabled={status === 'pending' || event.tickets.length === 0 || totalWei === BigInt(0)}
            onClick={collect}
            className="btn-primary text-sm py-2 px-3.5"
          >
            {status === 'pending' ? (
              <Loader2 className="w-4 h-4 spin-slow" />
            ) : (
              <ArrowDownToLine className="w-4 h-4" />
            )}
            {status === 'pending' ? 'Collecte en cours…' : "Collecter l'ETH"}
          </button>
        </div>
      </div>
      {status === 'error' && message && (
        <p className="text-xs text-red-500 mt-2 break-all">{message}</p>
      )}
      {txHashes.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
          {txHashes.map((h) => (
            <a
              key={h}
              href={`https://sepolia.etherscan.io/tx/${h}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-ink-muted hover:text-ink flex items-center gap-1 font-mono"
            >
              {h.slice(0, 10)}…{h.slice(-6)} <ExternalLink className="w-3 h-3" />
            </a>
          ))}
        </div>
      )}
    </div>
  );
}

/* ---------- Ticket row ---------- */

function TicketRow({
  event,
  ticket,
  onChain,
  balanceWei,
}: {
  event: EventInfo;
  ticket: TicketInfo;
  onChain?: OnChainCategory;
  balanceWei?: bigint;
}) {
  const sold = onChain ? Number(onChain.minted) : null;
  const total = onChain ? Number(onChain.maxSupply) : ticket.quantity;
  const pct = sold !== null && total > 0 ? (sold / total) * 100 : 0;
  const remaining = sold !== null ? total - sold : null;

  return (
    <tr className="border-b border-line last:border-0 hover:bg-page transition-colors">
      <td className="py-4 px-5">
        <p className="text-sm font-medium text-ink">{ticket.name}</p>
        <p className="text-xs text-ink-faint">{event.name}</p>
      </td>
      <td className="py-4 px-5 text-sm font-mono text-ink">
        {onChain ? `${formatEther(onChain.price)} ETH` : formatEth(ticket.price)}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-3">
          <div className="flex-1 max-w-[120px]">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
          <span className="text-xs text-ink-muted whitespace-nowrap tabular-nums">
            {sold !== null ? `${sold} / ${total}` : `— / ${total}`}
          </span>
        </div>
      </td>
      <td className="py-4 px-5 text-sm font-mono text-ink tabular-nums">
        {balanceWei !== undefined
          ? `${parseFloat(formatEther(balanceWei)).toFixed(4)} ETH`
          : '—'}
      </td>
      <td className="py-4 px-5">
        <div className="flex items-center gap-2">
          <span
            className={
              remaining === 0
                ? 'badge border-red-200 bg-red-50 text-red-600'
                : 'badge'
            }
          >
            {remaining === null
              ? 'On-chain indisponible'
              : remaining === 0
                ? 'Épuisé'
                : `${remaining} dispo.`}
          </span>
          {ticket.contractAddress && (
            <a
              href={`https://sepolia.etherscan.io/address/${ticket.contractAddress}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-ink-faint hover:text-ink"
              title={ticket.contractAddress}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      </td>
    </tr>
  );
}

/* ---------- Page ---------- */

export default function AdminPage() {
  const queryClient = useQueryClient();
  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useQuery({ queryKey: ['events'], queryFn: getEvents });

  const [showCreateModal, setShowCreateModal] = useState(false);

  const allRows = useMemo(
    () =>
      (events ?? []).flatMap((event) =>
        event.tickets.map((ticket) => ({ event, ticket }))
      ),
    [events]
  );
  const allTickets = useMemo(() => allRows.map((r) => r.ticket), [allRows]);
  const allAddresses = useMemo(
    () =>
      allTickets
        .map((t) => t.contractAddress)
        .filter((a): a is string => a !== null),
    [allTickets]
  );

  // On-chain data: sold counts (getCategory) + per-contract ETH balances.
  const { categories: onChain, refetch: refetchOnChain } =
    useOnChainCategories(allTickets);
  const { data: balances, refetch: refetchBalances } =
    useContractEthBalances(allAddresses);

  const refreshAll = () => {
    refetchEvents();
    refetchOnChain();
    refetchBalances();
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  // Aggregate stats
  const totalSold = allTickets.reduce((s, t) => {
    const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
    return s + (cat ? Number(cat.minted) : 0);
  }, 0);
  const totalSupply = allTickets.reduce((s, t) => {
    const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
    return s + (cat ? Number(cat.maxSupply) : t.quantity);
  }, 0);
  const totalEthWei = balances
    ? Object.values(balances).reduce((s, v) => s + v, BigInt(0))
    : undefined;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-ink">Admin</h1>
        <p className="text-ink-muted mt-1.5">
          Créez des événements, des billets et collectez l&apos;ETH des ventes.
        </p>
      </div>

      {/* New event - writes to the API back-office */}
      <NewEventForm />

      {eventsLoading ? (
        <div className="card py-16 text-center">
          <Loader2 className="w-7 h-7 text-ink-faint mx-auto spin-slow" />
        </div>
      ) : eventsError ? (
        <div className="card p-8 text-center">
          <AlertCircle className="w-7 h-7 text-red-400 mx-auto mb-3" />
          <p className="font-semibold text-ink mb-1">API indisponible</p>
          <p className="text-sm text-ink-faint">
            Impossible de charger les événements depuis le back-office.
          </p>
        </div>
      ) : (
        <>
          <DashboardStats
            ticketTypeCount={allTickets.length}
            totalSold={totalSold}
            totalSupply={totalSupply}
            totalEthWei={totalEthWei}
          />

          {/* Collect ETH per event (backend owns the contracts) */}
          <div className="card overflow-hidden">
            <div className="px-5 py-4 border-b border-line">
              <h2 className="section-label">Collecte des fonds</h2>
              <p className="text-xs text-ink-faint mt-1">
                Le retrait est effectué par la plateforme (propriétaire des
                contrats) sur chaque contrat de billet de l&apos;événement.
              </p>
            </div>
            {(events ?? []).filter((e) => e.tickets.length > 0).length === 0 ? (
              <div className="py-10 text-center text-sm text-ink-faint">
                Aucun événement avec billets.
              </div>
            ) : (
              (events ?? [])
                .filter((e) => e.tickets.length > 0)
                .map((event) => (
                  <CollectEthRow key={event.name} event={event} balances={balances} />
                ))
            )}
          </div>

          {/* Tickets table */}
          <div className="card overflow-hidden">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <h2 className="section-label">Billets</h2>
              <div className="flex items-center gap-2">
                <button onClick={refreshAll} className="btn-ghost text-sm py-2 px-3">
                  <RefreshCw className="w-3.5 h-3.5" />
                  Actualiser
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn-primary text-sm py-2 px-3.5"
                  disabled={(events ?? []).length === 0}
                >
                  <Plus className="w-4 h-4" />
                  Nouveau billet
                </button>
              </div>
            </div>
            {allRows.length === 0 ? (
              <div className="py-14 text-center text-sm text-ink-faint">
                Aucun billet créé.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-line text-xs text-ink-faint uppercase tracking-label">
                      <th className="text-left py-3 px-5 font-semibold">Billet</th>
                      <th className="text-left py-3 px-5 font-semibold">Prix</th>
                      <th className="text-left py-3 px-5 font-semibold">Ventes</th>
                      <th className="text-left py-3 px-5 font-semibold">Solde ETH</th>
                      <th className="text-left py-3 px-5 font-semibold">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRows.map(({ event, ticket }) => (
                      <TicketRow
                        key={ticketKey(ticket.contractAddress, ticket.onChainTokenId)}
                        event={event}
                        ticket={ticket}
                        onChain={onChain[ticketKey(ticket.contractAddress, ticket.onChainTokenId)]}
                        balanceWei={
                          ticket.contractAddress
                            ? balances?.[ticket.contractAddress.toLowerCase()]
                            : undefined
                        }
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Events recap */}
          {events && events.length > 0 && (
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
          )}
        </>
      )}

      {showCreateModal && (
        <CreateCategoryModal
          events={events ?? []}
          onClose={() => setShowCreateModal(false)}
          onSuccess={() => {
            refreshAll();
          }}
        />
      )}
    </div>
  );
}
