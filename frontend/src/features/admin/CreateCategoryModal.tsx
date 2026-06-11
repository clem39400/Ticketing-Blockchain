'use client';

import { useState } from 'react';
import { createTicket, type EventInfo } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { CheckCircle2, Plus } from 'lucide-react';

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

  return (
    <Modal
      icon={<Plus className="w-4 h-4" />}
      title="Nouveau type de billet"
      busy={step === 'pending'}
      onClose={onClose}
    >
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Événement *</label>
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
            <label className="field-label">Nom du billet *</label>
            <input
              className="input"
              placeholder="ex: VIP, Standard, Gold…"
              value={form.ticketName}
              onChange={(e) => setForm({ ...form, ticketName: e.target.value })}
            />
          </div>
          <div>
            <label className="field-label">Description</label>
            <textarea
              className="input min-h-[72px] resize-y"
              placeholder="Décrivez ce type de billet…"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Prix (ETH) *</label>
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
              <label className="field-label">Quantité max *</label>
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

          <Alert variant="warning" className="text-xs">
            La plateforme déploie un contrat dédié sur Sepolia : la création
            prend environ 1 à 2 minutes. Laissez cette fenêtre ouverte.
          </Alert>

          {formError && <Alert variant="error">{formError}</Alert>}

          <button type="submit" className="w-full btn-primary" disabled={events.length === 0}>
            Créer le billet
          </button>
        </form>
      )}

      {step === 'pending' && (
        <div className="text-center py-6 space-y-3">
          <Spinner className="w-10 h-10 text-ink mx-auto" />
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
          <Alert variant="error">
            <span className="font-medium">Création échouée</span>
            <br />
            <span className="text-xs break-all">{apiError || 'Erreur inconnue'}</span>
          </Alert>
          <button onClick={() => setStep('form')} className="w-full btn-secondary">
            Réessayer
          </button>
        </div>
      )}
    </Modal>
  );
}
