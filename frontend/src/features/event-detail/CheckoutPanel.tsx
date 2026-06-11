'use client';

import { formatEther } from 'viem';
import { AlertCircle } from 'lucide-react';
import { formatEur } from '@/lib/format';
import { useEthEurRate } from '@/hooks/useEthEurRate';
import { Alert } from '@/components/ui/Alert';
import { Spinner } from '@/components/ui/Spinner';
import { PaymentMethodToggle } from './PaymentMethodToggle';
import { CheckoutSuccess } from './CheckoutSuccess';
import type { CheckoutMode, PayMethod } from './useCheckout';

/** Checkout section: totals, method toggle, pay button and status banners. */
export function CheckoutPanel({
  totalTickets,
  totalPriceWei,
  method,
  setMethod,
  mode,
  address,
  txHashes,
  errorMsg,
  onPay,
  onReset,
  progress,
}: {
  totalTickets: number;
  totalPriceWei: bigint;
  method: PayMethod;
  setMethod: (m: PayMethod) => void;
  mode: CheckoutMode;
  address?: string;
  txHashes: string[];
  errorMsg: string | null;
  onPay: () => void;
  onReset: () => void;
  progress: { current: number; total: number };
}) {
  const empty = totalTickets === 0;
  const processing = mode === 'card-processing' || mode === 'wallet-processing';
  const { rate } = useEthEurRate();
  const priceLabel = `${formatEther(totalPriceWei)} ETH`;
  const eurLabel = formatEur(Number(formatEther(totalPriceWei)) * rate);
  const totalLabel = method === 'card' ? eurLabel : priceLabel;

  if (mode === 'card-success' || mode === 'wallet-success') {
    return (
      <CheckoutSuccess
        viaCard={mode === 'card-success'}
        txHashes={txHashes}
        onReset={onReset}
      />
    );
  }

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-label">Checkout</h2>
        <span className="text-sm text-ink-muted">
          {totalTickets} ticket{totalTickets > 1 ? 's' : ''} ·{' '}
          <span className="font-bold text-ink">{totalLabel}</span>
        </span>
      </div>

      <PaymentMethodToggle
        method={method}
        onChange={setMethod}
        disabled={processing}
        eurLabel={eurLabel}
        ethLabel={priceLabel}
      />

      {mode === 'error' && (
        <Alert variant="error" className="mb-4">
          {errorMsg ?? 'La transaction a échoué.'}
        </Alert>
      )}

      {!address && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {method === 'wallet'
            ? 'Connectez votre wallet pour payer en ETH.'
            : 'Connectez votre wallet : les billets seront mintés vers votre adresse.'}
        </div>
      )}

      <button
        onClick={mode === 'error' ? onReset : onPay}
        disabled={empty || processing || !address}
        className="btn-primary w-full py-3.5 text-base"
      >
        {processing ? (
          <>
            <Spinner />
            {mode === 'wallet-processing'
              ? `Achat ${progress.current}/${progress.total}…`
              : 'Mint en cours par la plateforme…'}
          </>
        ) : mode === 'error' ? (
          'Réessayer'
        ) : method === 'card' ? (
          `Payer par carte · ${eurLabel}`
        ) : (
          `Payer ${priceLabel}`
        )}
      </button>

      {method === 'card' && (
        <p className="text-center text-xs text-ink-faint mt-3">
          {mode === 'card-processing'
            ? 'Paiement accepté - mint on-chain en cours, cela peut prendre 30 à 60 secondes…'
            : 'Paiement en euros simulé (aucun débit réel) - les billets sont mintés on-chain par la plateforme.'}
        </p>
      )}
    </section>
  );
}
