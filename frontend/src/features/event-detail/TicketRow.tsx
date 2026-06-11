'use client';

import { formatEther } from 'viem';
import clsx from 'clsx';
import { Minus, Plus } from 'lucide-react';
import type { TicketInfo } from '@/lib/api';
import type { OnChainCategory } from '@/contracts/Ticket';
import { formatEth, formatEur } from '@/lib/format';
import { useEthEurRate } from '@/hooks/useEthEurRate';

/** One selectable ticket category: name, price (ETH + EUR) and a stepper. */
export function TicketRow({
  ticket,
  onChain,
  remaining,
  last,
  qty,
  onChange,
  disabled,
}: {
  ticket: TicketInfo;
  onChain?: OnChainCategory;
  remaining: number;
  last: boolean;
  qty: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const soldOut = remaining <= 0;
  const { rate } = useEthEurRate();
  const priceEth = onChain ? Number(formatEther(onChain.price)) : ticket.price;
  const priceLabel = onChain
    ? `${formatEther(onChain.price)} ETH`
    : formatEth(ticket.price);
  const eurLabel = formatEur(priceEth * rate);

  return (
    <li
      className={clsx(
        'flex items-center justify-between gap-4 px-5 sm:px-6 py-5',
        !last && 'border-b border-line'
      )}
    >
      <div className="min-w-0">
        <p className="font-semibold text-ink">{ticket.name}</p>
        {ticket.description && (
          <p className="text-xs text-ink-muted mt-0.5 line-clamp-1">
            {ticket.description}
          </p>
        )}
        <p className="text-xs text-ink-faint mt-0.5">
          {soldOut ? (
            <span className="text-red-500 font-medium">Épuisé</span>
          ) : (
            `${remaining} restant${remaining > 1 ? 's' : ''}`
          )}
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <div className="text-right">
          <span className="block font-bold text-ink tabular-nums">
            {priceLabel}
          </span>
          <span className="block text-xs text-ink-faint tabular-nums">
            ≈ {eurLabel}
          </span>
        </div>
        {soldOut ? (
          <span className="badge">Indisponible</span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              className="stepper-btn"
              onClick={() => onChange(qty - 1)}
              disabled={disabled || qty === 0}
              aria-label="Retirer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-6 text-center font-semibold tabular-nums">
              {qty}
            </span>
            <button
              className="stepper-btn bg-ink text-white border-ink hover:bg-black hover:text-white"
              onClick={() => onChange(qty + 1)}
              disabled={disabled || qty >= remaining}
              aria-label="Ajouter"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </li>
  );
}
