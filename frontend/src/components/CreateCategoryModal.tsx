'use client';

import { useState } from 'react';
import { createTicket, type EventInfo } from '@/lib/api';
import { X, Loader2, CheckCircle2, AlertCircle, Plus, Clock } from 'lucide-react';

type Props = {
  events: EventInfo[];
  onClose: () => void;
  onSuccess: () => void;
};

/**
 * Creates a new ticket type via POST /create-ticket.
 * The BACKEND deploys the contract and creates the on-chain category
 * (deployment takes ~1-2 minutes).
 */
export function CreateCategoryModal({ events, onClose, onSuccess }: Props) {
  const [form, setForm] = useState({
    eventName: events[0]?.name ?? '',
    ticketName: '',
    description: '',
    quantity: '',
    price: '',
  });
  const [step, setStep] = useState<'form' | 'pending' | 'success' | 'error'>('form');
  const [formError, setFormError] = useState('');
  const [apiError, setApiError] = useState('');

  const validate = (): boolean => {
    if (!form.eventName) {
      setFormError('Sélectionnez un événement.');
      return false;
    }
    if (!form.ticketName.trim()) {
      setFormError('Le nom du billet est requis.');
      return false;
    }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      setFormError('Prix invalide.');
      return false;
    }
    if (!form.quantity || isNaN(parseInt(form.quantity)) || parseInt(form.quantity) <= 0) {
      setFormError('Quantité invalide.');
      return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStep('pending');
    setApiError('');
    try {
      await createTicket({
        eventName: form.eventName,
        ticketName: form.ticketName.trim(),
        description: form.description.trim(),
        quantity: parseInt(form.quantity),
        price: parseFloat(form.price),
      });
      setStep('success');
      onSuccess();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Erreur inconnue');
      setStep('error');
    }
  };

  const handleClose = () => {
    if (step === 'pending') return;
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
        onClick={step === 'pending' ? undefined : handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-card rounded-2xl shadow-lift overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between p-5 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-ink">Nouveau type de billet</h2>
            </div>
            {step !== 'pending' && (
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg hover:bg-page flex items-center justify-center text-ink-faint hover:text-ink transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5">
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">
                    Événement *
                  </label>
                  <select
                    className="input"
                    value={form.eventName}
                    onChange={(e) => setForm({ ...form, eventName: e.target.value })}
                  >
                    {events.length === 0 && (
                      <option value="">Aucun événement disponible</option>
                    )}
                    {events.map((ev) => (
                      <option key={ev.name} value={ev.name}>
                        {ev.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">
                    Nom du billet *
                  </label>
                  <input
                    className="input"
                    placeholder="ex: VIP, Standard, Gold…"
                    value={form.ticketName}
                    onChange={(e) => setForm({ ...form, ticketName: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">
                    Description
                  </label>
                  <textarea
                    className="input min-h-[72px] resize-y"
                    placeholder="Décrivez ce type de billet…"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">
                      Prix (ETH) *
                    </label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      className="input"
                      placeholder="0.05"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">
                      Quantité max *
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className="input"
                      placeholder="100"
                      value={form.quantity}
                      onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
                  <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                  La plateforme déploie un contrat dédié sur Sepolia : la création
                  prend environ 1 à 2 minutes. Laissez cette fenêtre ouverte.
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <button type="submit" className="w-full btn-primary" disabled={events.length === 0}>
                  Créer le billet
                </button>
              </form>
            )}

            {step === 'pending' && (
              <div className="text-center py-6 space-y-3">
                <Loader2 className="w-10 h-10 text-ink mx-auto spin-slow" />
                <p className="text-ink font-medium">Déploiement du contrat en cours…</p>
                <p className="text-sm text-ink-muted">
                  La plateforme déploie le contrat et crée la catégorie on-chain.
                  Cela peut prendre 1 à 2 minutes.
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <p className="text-ink font-semibold text-lg">Billet créé !</p>
                <p className="text-sm text-ink-muted">
                  Le contrat a été déployé et la catégorie créée on-chain.
                </p>
                <button onClick={onClose} className="w-full btn-secondary mt-2">
                  Fermer
                </button>
              </div>
            )}

            {step === 'error' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-50 border border-red-200">
                  <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-600 mb-1">Création échouée</p>
                    <p className="text-xs text-red-500/80 break-all">
                      {apiError || 'Erreur inconnue'}
                    </p>
                  </div>
                </div>
                <button onClick={() => setStep('form')} className="w-full btn-secondary">
                  Réessayer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
