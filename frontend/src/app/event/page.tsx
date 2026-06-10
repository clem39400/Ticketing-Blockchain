"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import { useQuery } from "@tanstack/react-query";
import { getEventInfo, buyTicketEur, type TicketInfo } from "@/lib/api";
import { formatEventDate, formatEth } from "@/lib/format";
import {
  useOnChainCategories,
  useBuyTickets,
  computeBuyValue,
  ticketKey,
  isOnChain,
} from "@/hooks/useTicketContract";
import type { OnChainCategory } from "@/contracts/Ticket";
import { EventBanner } from "@/components/EventBanner";
import {
  Calendar,
  Minus,
  Plus,
  CreditCard,
  Wallet,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import clsx from "clsx";

type PayMethod = "card" | "wallet";
type Mode =
  | "idle"
  | "card-processing"
  | "card-success"
  | "wallet-processing"
  | "wallet-success"
  | "error";

type WalletQueueItem = {
  contractAddress: string;
  tokenId: number;
  quantity: number;
  valueWei: bigint;
};

export default function EventDetailPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
          <Loader2 className="w-6 h-6 text-ink-faint mx-auto spin-slow" />
        </div>
      }
    >
      <EventDetail />
    </Suspense>
  );
}

function EventDetail() {
  const searchParams = useSearchParams();
  const eventName = searchParams.get("name") ?? "";

  const { address } = useAccount();

  const {
    data: event,
    isLoading: eventLoading,
    isError: eventError,
    error: eventErr,
  } = useQuery({
    queryKey: ["event-info", eventName],
    queryFn: () => getEventInfo(eventName),
    enabled: !!eventName,
  });

  const tickets = useMemo(() => event?.tickets ?? [], [event]);

  // On-chain state (minted / price) per ticket type — fallback to DB values.
  const { categories: onChain, refetch: refetchOnChain } =
    useOnChainCategories(tickets);

  const [qty, setQty] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<PayMethod>("card");
  const [mode, setMode] = useState<Mode>("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [txHashes, setTxHashes] = useState<string[]>([]);

  // Wallet (ETH) sequential purchase queue — one buy() per ticket TYPE.
  const [queue, setQueue] = useState<WalletQueueItem[]>([]);
  const [qIndex, setQIndex] = useState(0);

  const { buy, hash, isConfirmed, error: buyError, reset } = useBuyTickets();

  const getQty = (key: string) => qty[key] ?? 0;
  const setQtyFor = (key: string, v: number) =>
    setQty((q) => ({ ...q, [key]: Math.max(0, v) }));

  const remainingOf = (t: TicketInfo): number => {
    const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
    if (cat) return Number(cat.maxSupply - cat.minted);
    return t.quantity; // DB fallback (max supply)
  };

  const { totalTickets, totalPriceWei } = useMemo(() => {
    let count = 0;
    let wei = BigInt(0);
    for (const t of tickets) {
      const n = getQty(ticketKey(t.contractAddress, t.onChainTokenId));
      if (n === 0) continue;
      count += n;
      const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
      wei += computeBuyValue(t.price, n, cat?.price);
    }
    return { totalTickets: count, totalPriceWei: wei };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tickets, qty, onChain]);

  /* ----- Wallet (ETH) flow: sequential buy() per ticket type ----- */

  useEffect(() => {
    if (mode !== "wallet-processing") return;
    if (buyError) {
      setErrorMsg(buyError.message?.slice(0, 160) ?? "La transaction a échoué.");
      setMode("error");
      return;
    }
    if (isConfirmed) {
      if (hash) setTxHashes((prev) => [...prev, hash]);
      const next = qIndex + 1;
      if (next < queue.length) {
        setQIndex(next);
        reset();
        const item = queue[next];
        buy(item.contractAddress, item.tokenId, item.quantity, item.valueWei);
      } else {
        setMode("wallet-success");
        refetchOnChain();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, buyError, mode]);

  const startWallet = () => {
    const items: WalletQueueItem[] = [];
    for (const t of tickets) {
      if (!isOnChain(t)) continue; // not deployed yet — cannot be bought
      const n = getQty(ticketKey(t.contractAddress, t.onChainTokenId));
      if (n === 0) continue;
      const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
      items.push({
        contractAddress: t.contractAddress,
        tokenId: t.onChainTokenId,
        quantity: n,
        valueWei: computeBuyValue(t.price, n, cat?.price),
      });
    }
    if (items.length === 0) return;
    setQueue(items);
    setQIndex(0);
    setTxHashes([]);
    setErrorMsg(null);
    setMode("wallet-processing");
    reset();
    buy(items[0].contractAddress, items[0].tokenId, items[0].quantity, items[0].valueWei);
  };

  /* ----- Carte bancaire flow: backend mints to the connected wallet ----- */

  const startCard = async () => {
    if (!address) {
      setErrorMsg(
        "Connectez votre wallet : les billets seront mintés vers votre adresse."
      );
      setMode("error");
      return;
    }
    const selected = tickets.filter(
      (t) => getQty(ticketKey(t.contractAddress, t.onChainTokenId)) > 0
    );
    if (selected.length === 0) return;

    setMode("card-processing");
    setErrorMsg(null);
    setTxHashes([]);
    try {
      const hashes: string[] = [];
      for (const t of selected) {
        const n = getQty(ticketKey(t.contractAddress, t.onChainTokenId));
        const { txHash } = await buyTicketEur({
          eventName,
          ticketName: t.name,
          quantity: n,
          buyerAddress: address,
        });
        hashes.push(txHash);
        setTxHashes([...hashes]);
      }
      setMode("card-success");
      refetchOnChain();
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Le paiement a échoué."
      );
      setMode("error");
    }
  };

  const pay = () => (method === "card" ? void startCard() : startWallet());

  const resetCheckout = () => {
    setMode("idle");
    setQty({});
    setQueue([]);
    setQIndex(0);
    setTxHashes([]);
    setErrorMsg(null);
    reset();
  };

  /* ----- Render ----- */

  if (!eventName) {
    return (
      <PageShell>
        <Notice
          title="Événement non spécifié"
          subtitle="Aucun nom d'événement dans l'URL."
        />
      </PageShell>
    );
  }

  if (eventLoading) {
    return (
      <PageShell>
        <div className="py-20 text-center">
          <Loader2 className="w-6 h-6 text-ink-faint mx-auto spin-slow" />
        </div>
      </PageShell>
    );
  }

  if (eventError || !event) {
    return (
      <PageShell>
        <Notice
          title="Événement introuvable"
          subtitle={
            eventErr instanceof Error
              ? eventErr.message
              : "Impossible de charger cet événement."
          }
        />
      </PageShell>
    );
  }

  return (
    <PageShell>
      {/* Banner */}
      <div className="rounded-2xl overflow-hidden border border-line h-52 sm:h-64 mb-6">
        <EventBanner name={event.name} src={event.eventBanner} />
      </div>

      {/* Title */}
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

      {/* Tickets */}
      <section className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="section-label">Tickets</h2>
          {tickets.length > 0 && (
            <span className="text-xs text-ink-faint">
              à partir de{" "}
              <span className="font-semibold text-ink">
                {formatEth(
                  tickets.reduce(
                    (m, t) => (t.price < m ? t.price : m),
                    tickets[0].price
                  )
                )}
              </span>
            </span>
          )}
        </div>

        {tickets.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-faint">
            Aucune catégorie de billet pour cet événement.
          </div>
        ) : (
          <ul>
            {tickets.map((t, i) => (
              <TicketRow
                key={ticketKey(t.contractAddress, t.onChainTokenId)}
                ticket={t}
                onChain={onChain[ticketKey(t.contractAddress, t.onChainTokenId)]}
                remaining={remainingOf(t)}
                last={i === tickets.length - 1}
                qty={getQty(ticketKey(t.contractAddress, t.onChainTokenId))}
                onChange={(v) =>
                  setQtyFor(ticketKey(t.contractAddress, t.onChainTokenId), v)
                }
                disabled={(mode !== "idle" && mode !== "error") || !isOnChain(t)}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Checkout */}
      <Checkout
        totalTickets={totalTickets}
        totalPriceWei={totalPriceWei}
        method={method}
        setMethod={setMethod}
        mode={mode}
        address={address}
        txHashes={txHashes}
        errorMsg={errorMsg}
        onPay={pay}
        onReset={resetCheckout}
        progress={{ current: qIndex + 1, total: queue.length }}
      />
    </PageShell>
  );
}

/* ---------- Layout helpers ---------- */

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

function Notice({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="card text-center py-20">
      <div className="w-14 h-14 rounded-2xl bg-page border border-line flex items-center justify-center mx-auto mb-4">
        <AlertCircle className="w-7 h-7 text-ink-faint" />
      </div>
      <p className="font-semibold text-ink mb-1">{title}</p>
      <p className="text-sm text-ink-faint">{subtitle}</p>
    </div>
  );
}

/* ---------- Ticket row ---------- */

function TicketRow({
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
  const priceLabel = onChain
    ? `${formatEther(onChain.price)} ETH`
    : formatEth(ticket.price);

  return (
    <li
      className={clsx(
        "flex items-center justify-between gap-4 px-5 sm:px-6 py-5",
        !last && "border-b border-line"
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
            `${remaining} restant${remaining > 1 ? "s" : ""}`
          )}
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <span className="font-bold text-ink tabular-nums">{priceLabel}</span>
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

/* ---------- Checkout ---------- */

function Checkout({
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
  mode: Mode;
  address?: `0x${string}`;
  txHashes: string[];
  errorMsg: string | null;
  onPay: () => void;
  onReset: () => void;
  progress: { current: number; total: number };
}) {
  const empty = totalTickets === 0;
  const processing = mode === "card-processing" || mode === "wallet-processing";
  const success = mode === "card-success" || mode === "wallet-success";
  const priceLabel = `${formatEther(totalPriceWei)} ETH`;

  if (success) {
    return (
      <section className="card p-6 sm:p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-ink mb-1">Paiement confirmé</h3>
        <p className="text-sm text-ink-muted mb-5">
          {mode === "card-success"
            ? "Paiement par carte accepté - vos billets ont été mintés par la plateforme vers votre wallet."
            : "Vos billets NFT ont été mintés dans votre wallet."}
        </p>
        {txHashes.length > 0 && (
          <div className="flex flex-col items-center gap-1 mb-5">
            {txHashes.map((h) => (
              <a
                key={h}
                href={`https://sepolia.etherscan.io/tx/${h}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink font-mono"
              >
                {h.slice(0, 10)}…{h.slice(-8)}{" "}
                <ExternalLink className="w-3 h-3" />
              </a>
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

  return (
    <section className="card p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h2 className="section-label">Checkout</h2>
        <span className="text-sm text-ink-muted">
          {totalTickets} ticket{totalTickets > 1 ? "s" : ""} ·{" "}
          <span className="font-bold text-ink">{priceLabel}</span>
        </span>
      </div>

      {/* Method toggle */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <MethodCard
          active={method === "card"}
          onClick={() => setMethod("card")}
          disabled={processing}
          icon={<CreditCard className="w-5 h-5" />}
          title="Carte bancaire"
          subtitle="La plateforme minte pour vous"
        />
        <MethodCard
          active={method === "wallet"}
          onClick={() => setMethod("wallet")}
          disabled={processing}
          icon={<Wallet className="w-5 h-5" />}
          title="Wallet (ETH)"
          subtitle={`Achat on-chain · ${priceLabel}`}
        />
      </div>

      {mode === "error" && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span className="break-all">
            {errorMsg ?? "La transaction a échoué."}
          </span>
        </div>
      )}

      {!address && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          {method === "wallet"
            ? "Connectez votre wallet pour payer en ETH."
            : "Connectez votre wallet : les billets seront mintés vers votre adresse."}
        </div>
      )}

      <button
        onClick={mode === "error" ? onReset : onPay}
        disabled={empty || processing || !address}
        className="btn-primary w-full py-3.5 text-base"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 spin-slow" />
            {mode === "wallet-processing"
              ? `Achat ${progress.current}/${progress.total}…`
              : "Mint en cours par la plateforme…"}
          </>
        ) : mode === "error" ? (
          "Réessayer"
        ) : method === "card" ? (
          `Payer par carte · ${priceLabel}`
        ) : (
          `Payer ${priceLabel}`
        )}
      </button>

      {method === "card" && (
        <p className="text-center text-xs text-ink-faint mt-3">
          {mode === "card-processing"
            ? "Paiement accepté - mint on-chain en cours, cela peut prendre 30 à 60 secondes…"
            : "Paiement en euros simulé (aucun débit réel) - les billets sont mintés on-chain par la plateforme."}
        </p>
      )}
    </section>
  );
}

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
        "text-left rounded-xl border p-4 transition-all disabled:opacity-60",
        active
          ? "border-line-strong bg-page ring-1 ring-ink/10"
          : "border-line hover:border-ink-faint"
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
