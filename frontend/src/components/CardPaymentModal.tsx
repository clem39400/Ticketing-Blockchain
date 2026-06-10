'use client';

import { useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, CreditCard, Lock } from 'lucide-react';

type Props = {
  /** Montant total affiché (ex: "12,50 €"). */
  amountLabel: string;
  onClose: () => void;
  /** Appelé une fois le faux paiement accepté — déclenche le mint côté plateforme. */
  onPaid: () => void;
};

const TEST_CARD = '4242424242424242';
const DECLINED_CARD = '4000000000000002';

/** Vérification de Luhn — comme un vrai PSP. */
function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** "4242424242424242" → "4242 4242 4242 4242" */
function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** "1228" → "12/28" */
function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

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

  const validate = (): string | null => {
    const digits = number.replace(/\D/g, '');
    if (!holder.trim()) return 'Le nom du titulaire est requis.';
    if (digits.length !== 16 || !luhnValid(digits)) return 'Numéro de carte invalide.';
    const m = expiry.match(/^(\d{2})\/(\d{2})$/);
    if (!m) return "Date d'expiration invalide (MM/AA).";
    const month = Number(m[1]);
    if (month < 1 || month > 12) return "Mois d'expiration invalide.";
    const expEnd = new Date(2000 + Number(m[2]), month, 1); // 1er jour du mois suivant
    if (expEnd <= new Date()) return 'Carte expirée.';
    if (!/^\d{3,4}$/.test(cvc)) return 'CVC invalide.';
    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
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
      setTimeout(() => {
        onPaid();
      }, 900);
    }, 1800);
  };

  const busy = step !== 'form';

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-sm"
        onClick={busy ? undefined : onClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md bg-card rounded-2xl shadow-lift overflow-hidden animate-fade-up">
          <div className="flex items-center justify-between p-5 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-ink flex items-center justify-center">
                <CreditCard className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-ink leading-tight">Paiement par carte</h2>
                <p className="text-xs text-ink-faint">Total : {amountLabel}</p>
              </div>
            </div>
            {!busy && (
              <button
                onClick={onClose}
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
                    Titulaire de la carte *
                  </label>
                  <input
                    className="input"
                    placeholder="Jean Dupont"
                    autoComplete="cc-name"
                    value={holder}
                    onChange={(e) => setHolder(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-ink-muted mb-1.5">
                    Numéro de carte *
                  </label>
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
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">
                      Expiration *
                    </label>
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
                    <label className="block text-xs font-medium text-ink-muted mb-1.5">
                      CVC *
                    </label>
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
                  Mode démo — aucun débit réel. Carte de test :{' '}
                  <span className="font-mono whitespace-nowrap">4242 4242 4242 4242</span>
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <button type="submit" className="w-full btn-primary">
                  Payer {amountLabel}
                </button>
              </form>
            )}

            {step === 'processing' && (
              <div className="text-center py-8 space-y-3">
                <Loader2 className="w-10 h-10 text-ink mx-auto spin-slow" />
                <p className="text-ink font-medium">Vérification du paiement…</p>
                <p className="text-sm text-ink-muted">Contact de votre banque en cours.</p>
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
          </div>
        </div>
      </div>
    </>
  );
}
