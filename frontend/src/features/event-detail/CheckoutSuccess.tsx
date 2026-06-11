'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { TxLink } from '@/components/ui/TxLink';

/** Confirmation panel shown once a card or wallet purchase has completed. */
export function CheckoutSuccess({
  viaCard,
  txHashes,
  onReset,
}: {
  viaCard: boolean;
  txHashes: string[];
  onReset: () => void;
}) {
  return (
    <section className="card p-6 sm:p-8 text-center">
      <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
      <h3 className="text-lg font-bold text-ink mb-1">Paiement confirmé</h3>
      <p className="text-sm text-ink-muted mb-5">
        {viaCard
          ? 'Paiement par carte accepté - vos billets ont été mintés par la plateforme vers votre wallet.'
          : 'Vos billets NFT ont été mintés dans votre wallet.'}
      </p>
      {txHashes.length > 0 && (
        <div className="flex flex-col items-center gap-1 mb-5">
          {txHashes.map((h) => (
            <TxLink key={h} hash={h} />
          ))}
        </div>
      )}
      <div className="flex items-center justify-center gap-3">
        <Link href="/my-tickets" className="btn-primary">
          Voir mes billets
        </Link>
        <button onClick={onReset} className="btn-secondary">
          Continuer
        </button>
      </div>
    </section>
  );
}
