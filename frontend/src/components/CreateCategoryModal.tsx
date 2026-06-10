'use client';

import { useEffect, useState } from 'react';
import { parseEther } from 'viem';
import { useCreateCategory } from '@/hooks/useTicketContract';
import { X, Loader2, CheckCircle2, AlertCircle, Plus } from 'lucide-react';

type Props = {
  onClose: () => void;
  onSuccess: () => void;
};

export function CreateCategoryModal({ onClose, onSuccess }: Props) {
  const { createCategory, isWritePending, isConfirming, isConfirmed, error, reset } =
    useCreateCategory();

  const [form, setForm] = useState({
    name: '',
    price: '',
    maxSupply: '',
    metadataURI: '',
  });
  const [step, setStep] = useState<'form' | 'pending' | 'success' | 'error'>('form');
  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (isWritePending || isConfirming) setStep('pending');
    if (isConfirmed) { setStep('success'); onSuccess(); }
    if (error) setStep('error');
  }, [isWritePending, isConfirming, isConfirmed, error, onSuccess]);

  const validate = (): boolean => {
    if (!form.name.trim()) { setFormError('Le nom est requis.'); return false; }
    if (!form.price || isNaN(parseFloat(form.price)) || parseFloat(form.price) <= 0) {
      setFormError('Prix invalide.'); return false;
    }
    if (!form.maxSupply || isNaN(parseInt(form.maxSupply)) || parseInt(form.maxSupply) <= 0) {
      setFormError('Quantité max invalide.'); return false;
    }
    setFormError('');
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    createCategory(
      form.name.trim(),
      parseEther(form.price),
      BigInt(parseInt(form.maxSupply)),
      form.metadataURI.trim()
    );
  };

  const handleClose = () => { reset(); onClose(); };

  const inputClass =
    'w-full bg-surface border border-surface-border rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-brand-500/50 focus:ring-1 focus:ring-brand-500/30 transition-all';

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={step === 'pending' ? undefined : handleClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md glass rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-white">Nouvelle catégorie</h2>
            </div>
            {step !== 'pending' && (
              <button onClick={handleClose} className="w-8 h-8 rounded-lg hover:bg-white/[0.07] flex items-center justify-center text-white/40 hover:text-white transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5">
            {step === 'form' && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">Nom de la catégorie *</label>
                  <input
                    className={inputClass}
                    placeholder="ex: VIP, Standard, Gold…"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Prix (ETH) *</label>
                    <input
                      type="number"
                      step="0.001"
                      min="0"
                      className={inputClass}
                      placeholder="0.05"
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1.5">Quantité max *</label>
                    <input
                      type="number"
                      min="1"
                      step="1"
                      className={inputClass}
                      placeholder="100"
                      value={form.maxSupply}
                      onChange={(e) => setForm({ ...form, maxSupply: e.target.value })}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-white/50 mb-1.5">URI Métadonnées (IPFS)</label>
                  <input
                    className={inputClass}
                    placeholder="ipfs://…"
                    value={form.metadataURI}
                    onChange={(e) => setForm({ ...form, metadataURI: e.target.value })}
                  />
                </div>

                {formError && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    {formError}
                  </div>
                )}

                <button type="submit" className="w-full btn-primary">
                  Créer la catégorie
                </button>
              </form>
            )}

            {step === 'pending' && (
              <div className="text-center py-6 space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-400 mx-auto spin-slow" />
                <p className="text-white font-medium">
                  {isWritePending ? 'Confirmez dans MetaMask…' : 'Transaction en cours…'}
                </p>
                <p className="text-sm text-white/40">
                  {isConfirming ? 'Attente de confirmation…' : 'Signez dans votre wallet.'}
                </p>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-white font-semibold text-lg">Catégorie créée !</p>
                <button onClick={handleClose} className="w-full btn-secondary mt-2">Fermer</button>
              </div>
            )}

            {step === 'error' && (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-red-500/10 border border-red-500/20">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-red-300 mb-1">Transaction échouée</p>
                    <p className="text-xs text-red-400/70 break-all">
                      {error?.message?.slice(0, 120) ?? 'Erreur inconnue'}
                    </p>
                  </div>
                </div>
                <button onClick={() => { reset(); setStep('form'); }} className="w-full btn-secondary">
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
