'use client';

import { useEffect, useState } from 'react';
import { formatEther } from 'viem';
import { useAccount, useBalance } from 'wagmi';
import { useMintForETH } from '@/hooks/useTicketContract';
import type { TicketCategory } from '@/contracts/EventTicket1155';
import {
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Ticket,
} from 'lucide-react';

type Props = {
  category: TicketCategory;
  onClose: () => void;
  onSuccess: () => void;
};

export function BuyModal({ category, onClose, onSuccess }: Props) {
  const { address } = useAccount();
  const { data: ethBalance } = useBalance({ address });
  const { mint, hash, isWritePending, isConfirming, isConfirmed, error, reset } =
    useMintForETH();
  const [step, setStep] = useState<'confirm' | 'pending' | 'success' | 'error'>('confirm');

  const hasFunds = ethBalance ? ethBalance.value >= category.price : false;
  const isSoldOut = category.remaining === BigInt(0);

  useEffect(() => {
    if (isWritePending || isConfirming) setStep('pending');
    if (isConfirmed) { setStep('success'); onSuccess(); }
    if (error) setStep('error');
  }, [isWritePending, isConfirming, isConfirmed, error, onSuccess]);

  const handleBuy = () => {
    mint(category.tokenId, category.price);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
        onClick={step === 'pending' ? undefined : handleClose}
      />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="pointer-events-auto w-full max-w-md glass rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-surface-border">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-brand flex items-center justify-center">
                <Ticket className="w-4 h-4 text-white" />
              </div>
              <h2 className="font-semibold text-white">Acheter un billet</h2>
            </div>
            {step !== 'pending' && (
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-lg hover:bg-white/[0.07] flex items-center justify-center text-white/40 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="p-5">
            {/* Ticket info */}
            <div className="glass rounded-xl p-4 mb-5">
              <p className="text-xs text-white/40 mb-1">Catégorie</p>
              <p className="text-lg font-bold text-white mb-3">{category.name}</p>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-white/40 mb-0.5">Prix</p>
                  <p className="text-2xl font-extrabold text-gradient">
                    {formatEther(category.price)} ETH
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-white/40 mb-0.5">Disponibles</p>
                  <p className="text-sm font-semibold text-white">
                    {isSoldOut ? (
                      <span className="text-red-400">Épuisé</span>
                    ) : (
                      <span className="text-emerald-400">
                        {category.remaining.toString()} restants
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Steps */}
            {step === 'confirm' && (
              <div className="space-y-4">
                {!address && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Connectez votre wallet pour continuer.
                  </div>
                )}
                {address && !hasFunds && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    Solde ETH insuffisant sur Sepolia.
                  </div>
                )}
                {address && ethBalance && (
                  <div className="flex items-center justify-between text-sm text-white/50 px-1">
                    <span>Votre solde</span>
                    <span className="font-mono text-white/70">
                      {parseFloat(formatEther(ethBalance.value)).toFixed(4)} ETH
                    </span>
                  </div>
                )}
                <button
                  disabled={!address || !hasFunds || isSoldOut}
                  onClick={handleBuy}
                  className="w-full btn-primary"
                >
                  Confirmer l'achat · {formatEther(category.price)} ETH
                </button>
              </div>
            )}

            {step === 'pending' && (
              <div className="text-center py-4 space-y-3">
                <Loader2 className="w-10 h-10 text-indigo-400 mx-auto spin-slow" />
                <p className="text-white font-medium">
                  {isWritePending ? 'Confirmez dans MetaMask…' : 'Transaction en cours…'}
                </p>
                <p className="text-sm text-white/40">
                  {isConfirming ? 'Attente de confirmation on-chain…' : 'Signez la transaction dans votre wallet.'}
                </p>
                {hash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Voir sur Etherscan <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            {step === 'success' && (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-white font-semibold text-lg">Billet acheté !</p>
                <p className="text-sm text-white/40">
                  Votre NFT-ticket est dans votre wallet.
                </p>
                {hash && (
                  <a
                    href={`https://sepolia.etherscan.io/tx/${hash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300"
                  >
                    Voir la transaction <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                <button onClick={handleClose} className="w-full btn-secondary mt-2">
                  Fermer
                </button>
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
                <button
                  onClick={() => { reset(); setStep('confirm'); }}
                  className="w-full btn-secondary"
                >
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
