'use client';

import { useState } from 'react';
import { CheckCircle2, CreditCard, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import {
  DECLINED_CARD,
  formatCardNumber,
  formatExpiry,
  validateCardForm,
} from './cardValidation';

type Props = {
  /** Montant total affiché (ex: "12,50 €"). */
  amountLabel: string;
  onClose: () => void;
  /** Appelé une fois le faux paiement accepté — déclenche le mint côté plateforme. */
  onPaid: () => void;
};

/**
 * Faux checkout de paiement par carte (façon Stripe, mode test).
 * Aucune donnée n'est envoyée à un PSP : la validation est locale
 * (Luhn + expiration), puis le paiement est "accepté" après un court délai.
 */
export function CardPaymentModal({ amountLabel, onClose, onPaid }: Props) {
  const [holder, setHolder] = useState('');
  const [number, setNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [step, setStep] = useState<'form' | 'processing' | 'accepted'>('form');
  const [formError, setFormError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateCardForm({ holder, number, expiry, cvc });
    if (error) {
      setFormError(error);
      return;
    }
    setFormError('');
    setStep('processing');
    const digits = number.replace(/\D/g, '');
    // Simulation PSP : ~1,8 s de "vérification", carte 4000...0002 refusée.
    setTimeout(() => {
      if (digits === DECLINED_CARD) {
        setFormError('Carte refusée par la banque (carte de test "declined").');
        setStep('form');
        return;
      }
      setStep('accepted');
      setTimeout(() => onPaid(), 900);
    }, 1800);
  };

  return (
    <Modal
      icon={<CreditCard className="w-4 h-4" />}
      title="Paiement par carte"
      subtitle={`Total : ${amountLabel}`}
      busy={step !== 'form'}
      onClose={onClose}
    >
      {step === 'form' && (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="field-label">Titulaire de la carte *</label>
            <input
              className="input"
              placeholder="Jean Dupont"
              autoComplete="cc-name"
              value={holder}
              onChange={(e) => setHolder(e.target.value)}
            />
          </div>
          <div>
            <label className="field-label">Numéro de carte *</label>
            <input
              className="input font-mono"
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
              value={number}
              onChange={(e) => setNumber(formatCardNumber(e.target.value))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="field-label">Expiration *</label>
              <input
                className="input font-mono"
                placeholder="MM/AA"
                inputMode="numeric"
                autoComplete="cc-exp"
                value={expiry}
                onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              />
            </div>
            <div>
              <label className="field-label">CVC *</label>
              <input
                className="input font-mono"
                placeholder="123"
                inputMode="numeric"
                autoComplete="cc-csc"
                maxLength={4}
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>

          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-xs">
            <Lock className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              Mode démo — aucun débit réel. Carte de test :{' '}
              <span className="font-mono whitespace-nowrap">
                4242 4242 4242 4242
              </span>
            </span>
          </div>

          {formError && <Alert variant="error">{formError}</Alert>}

          <button type="submit" className="w-full btn-primary">
            Payer {amountLabel}
          </button>
        </form>
      )}

      {step === 'processing' && (
        <div className="text-center py-8 space-y-3">
          <Spinner className="w-10 h-10 text-ink mx-auto" />
          <p className="text-ink font-medium">Vérification du paiement…</p>
          <p className="text-sm text-ink-muted">
            Contact de votre banque en cours.
          </p>
        </div>
      )}

      {step === 'accepted' && (
        <div className="text-center py-8 space-y-3">
          <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
          <p className="text-ink font-semibold text-lg">Paiement accepté</p>
          <p className="text-sm text-ink-muted">
            Mint de vos billets par la plateforme…
          </p>
        </div>
      )}
    </Modal>
  );
}
