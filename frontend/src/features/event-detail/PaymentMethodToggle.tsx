'use client';

import clsx from 'clsx';
import { CreditCard, Wallet } from 'lucide-react';
import type { PayMethod } from './useCheckout';

function MethodCard({
  active,
  onClick,
  disabled,
  icon,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'text-left rounded-xl border p-4 transition-all disabled:opacity-60',
        active
          ? 'border-line-strong bg-page ring-1 ring-ink/10'
          : 'border-line hover:border-ink-faint'
      )}
    >
      <div className="flex items-center gap-2 mb-1.5 text-ink">
        {icon}
        <span className="font-semibold text-sm">{title}</span>
      </div>
      <p className="text-xs text-ink-faint">{subtitle}</p>
    </button>
  );
}

/** Card-vs-wallet payment method selector. */
export function PaymentMethodToggle({
  method,
  onChange,
  disabled,
  eurLabel,
  ethLabel,
}: {
  method: PayMethod;
  onChange: (m: PayMethod) => void;
  disabled: boolean;
  eurLabel: string;
  ethLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 mb-5">
      <MethodCard
        active={method === 'card'}
        onClick={() => onChange('card')}
        disabled={disabled}
        icon={<CreditCard className="w-5 h-5" />}
        title="Carte bancaire"
        subtitle={`Paiement en euros · ${eurLabel}`}
      />
      <MethodCard
        active={method === 'wallet'}
        onClick={() => onChange('wallet')}
        disabled={disabled}
        icon={<Wallet className="w-5 h-5" />}
        title="Wallet (ETH)"
        subtitle={`Achat on-chain · ${ethLabel}`}
      />
    </div>
  );
}
