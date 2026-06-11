'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatEther } from 'viem';
import { Calendar, ArrowLeft, AlertCircle } from 'lucide-react';
import { useEventInfo } from '@/hooks/useEvents';
import { useEthEurRate } from '@/hooks/useEthEurRate';
import { isOnChain, ticketKey, minTicketPrice } from '@/lib/tickets';
import { formatEventDate, formatEth, formatEur } from '@/lib/format';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageLoader } from '@/components/ui/Spinner';
import { EventBanner } from '@/features/events/EventBanner';
import { CardPaymentModal } from '@/features/checkout/CardPaymentModal';
import { TicketRow } from './TicketRow';
import { CheckoutPanel } from './CheckoutPanel';
import { useCheckout } from './useCheckout';

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tous les events
      </Link>
      {children}
    </div>
  );
}

/** Event detail: banner, ticket category list and checkout. */
export function EventDetailPage() {
  const searchParams = useSearchParams();
  const eventName = searchParams.get('name') ?? '';

  const { data: event, isLoading, isError, error } = useEventInfo(eventName);
  const tickets = useMemo(() => event?.tickets ?? [], [event]);

  const checkout = useCheckout(eventName, tickets);
  const [showCardModal, setShowCardModal] = useState(false);

  const { rate } = useEthEurRate();
  const totalEurLabel = formatEur(
    Number(formatEther(checkout.totalPriceWei)) * rate
  );

  // The fake card checkout opens first; the mint starts once it is "paid".
  const openCardCheckout = () => {
    if (!checkout.requireWallet()) return;
    if (checkout.totalTickets === 0) return;
    setShowCardModal(true);
  };

  const pay = () =>
    checkout.method === 'card' ? openCardCheckout() : checkout.startWallet();

  if (!eventName) {
    return (
      <PageShell>
        <EmptyState
          icon={<AlertCircle className="w-7 h-7 text-ink-faint" />}
          title="Événement non spécifié"
          subtitle="Aucun nom d'événement dans l'URL."
        />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell>
        <PageLoader />
      </PageShell>
    );
  }

  if (isError || !event) {
    return (
      <PageShell>
        <EmptyState
          icon={<AlertCircle className="w-7 h-7 text-ink-faint" />}
          title="Événement introuvable"
          subtitle={
            error instanceof Error
              ? error.message
              : 'Impossible de charger cet événement.'
          }
        />
      </PageShell>
    );
  }

  const minPrice = minTicketPrice(tickets);
  const selectionLocked =
    checkout.mode !== 'idle' && checkout.mode !== 'error';

  return (
    <PageShell>
      <div className="rounded-2xl overflow-hidden border border-line h-52 sm:h-64 mb-6">
        <EventBanner name={event.name} src={event.eventBanner} />
      </div>

      <h1 className="text-3xl font-extrabold tracking-tight text-ink mb-3">
        {event.name}
      </h1>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-muted mb-4">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {formatEventDate(event.eventDate)}
        </span>
      </div>
      <p className="text-sm text-ink-muted mb-8">{event.description}</p>

      <section className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="section-label">Tickets</h2>
          {minPrice !== null && (
            <span className="text-xs text-ink-faint">
              à partir de{' '}
              <span className="font-semibold text-ink">{formatEth(minPrice)}</span>
            </span>
          )}
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-faint">
            Aucune catégorie de billet pour cet événement.
          </div>
        ) : (
          <ul>
            {tickets.map((t, i) => {
              const key = ticketKey(t.contractAddress, t.onChainTokenId);
              return (
                <TicketRow
                  key={key}
                  ticket={t}
                  onChain={checkout.onChain[key]}
                  remaining={checkout.remainingOf(t)}
                  last={i === tickets.length - 1}
                  qty={checkout.getQty(key)}
                  onChange={(v) => checkout.setQtyFor(key, v)}
                  disabled={selectionLocked || !isOnChain(t)}
                />
              );
            })}
          </ul>
        )}
      </section>

      {showCardModal && (
        <CardPaymentModal
          amountLabel={totalEurLabel}
          onClose={() => setShowCardModal(false)}
          onPaid={() => {
            setShowCardModal(false);
            void checkout.startCard();
          }}
        />
      )}

      <CheckoutPanel
        totalTickets={checkout.totalTickets}
        totalPriceWei={checkout.totalPriceWei}
        method={checkout.method}
        setMethod={checkout.setMethod}
        mode={checkout.mode}
        address={checkout.address}
        txHashes={checkout.txHashes}
        errorMsg={checkout.errorMsg}
        onPay={pay}
        onReset={checkout.resetCheckout}
        progress={checkout.progress}
      />
    </PageShell>
  );
}
