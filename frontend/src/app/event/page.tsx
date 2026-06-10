"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { formatEther } from "viem";
import { useAccount } from "wagmi";
import {
  useEventName,
  useCategoryCount,
  useAllCategories,
  useMintForETH,
} from "@/hooks/useTicketContract";
import type { TicketCategory } from "@/contracts/EventTicket1155";
import { EventBanner } from "@/components/EventBanner";
import {
  Calendar,
  MapPin,
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

const EVENT_META = {
  date: "15 septembre 2025 · 20:00",
  location: "Paris, France",
};

type PayMethod = "card" | "wallet";
type Mode =
  | "idle"
  | "card-processing"
  | "card-success"
  | "wallet-processing"
  | "wallet-success"
  | "error";

export default function EventDetailPage() {
  const { address } = useAccount();
  const { data: eventName } = useEventName();
  const { data: count } = useCategoryCount();
  const catCount = count ? Number(count) : 0;
  const { categories, isLoading, refetch } = useAllCategories(catCount);

  const [qty, setQty] = useState<Record<string, number>>({});
  const [method, setMethod] = useState<PayMethod>("card");
  const [mode, setMode] = useState<Mode>("idle");
  const [queue, setQueue] = useState<{ tokenId: bigint; price: bigint }[]>([]);
  const [qIndex, setQIndex] = useState(0);

  const { mint, hash, isConfirmed, error, reset } = useMintForETH();

  const getQty = (id: string) => qty[id] ?? 0;
  const setQtyFor = (id: string, v: number) =>
    setQty((q) => ({ ...q, [id]: Math.max(0, v) }));

  const { totalTickets, totalPrice } = useMemo(() => {
    let tickets = 0;
    let price = BigInt(0);
    for (const c of categories) {
      const n = getQty(c.tokenId.toString());
      tickets += n;
      price += c.price * BigInt(n);
    }
    return { totalTickets: tickets, totalPrice: price };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, qty]);

  // Sequential on-chain minting for the wallet flow.
  useEffect(() => {
    if (mode !== "wallet-processing") return;
    if (error) {
      setMode("error");
      return;
    }
    if (isConfirmed) {
      const next = qIndex + 1;
      if (next < queue.length) {
        setQIndex(next);
        reset();
        mint(queue[next].tokenId, queue[next].price);
      } else {
        setMode("wallet-success");
        refetch();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConfirmed, error, mode]);

  const startWallet = () => {
    const items: { tokenId: bigint; price: bigint }[] = [];
    for (const c of categories) {
      const n = getQty(c.tokenId.toString());
      for (let i = 0; i < n; i++)
        items.push({ tokenId: c.tokenId, price: c.price });
    }
    if (items.length === 0) return;
    setQueue(items);
    setQIndex(0);
    setMode("wallet-processing");
    reset();
    mint(items[0].tokenId, items[0].price);
  };

  const startCard = () => {
    setMode("card-processing");
    // Fake payment: the platform would mint via the API after a real charge.
    setTimeout(() => setMode("card-success"), 1600);
  };

  const pay = () => (method === "card" ? startCard() : startWallet());

  const resetCheckout = () => {
    setMode("idle");
    setQty({});
    setQueue([]);
    setQIndex(0);
    reset();
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-ink mb-5 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Tous les events
      </Link>

      {/* Banner */}
      <div className="rounded-2xl overflow-hidden border border-line h-52 sm:h-64 mb-6">
        <EventBanner name={(eventName as string) ?? "Event"} />
      </div>

      {/* Title */}
      <h1 className="text-3xl font-extrabold tracking-tight text-ink mb-3">
        {(eventName as string) ?? "Event"}
      </h1>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 text-sm text-ink-muted mb-8">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-4 h-4" />
          {EVENT_META.date}
        </span>
        <span className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4" />
          {EVENT_META.location}
        </span>
      </div>

      {/* Tickets */}
      <section className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-line">
          <h2 className="section-label">Tickets</h2>
          {categories.length > 0 && (
            <span className="text-xs text-ink-faint">
              à partir de{" "}
              <span className="font-semibold text-ink">
                {formatEther(
                  categories.reduce(
                    (m, c) => (c.price < m ? c.price : m),
                    categories[0].price,
                  ),
                )}{" "}
                ETH
              </span>
            </span>
          )}
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 className="w-6 h-6 text-ink-faint mx-auto spin-slow" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-12 text-center text-sm text-ink-faint">
            Aucune catégorie de billet pour cet événement.
          </div>
        ) : (
          <ul>
            {categories.map((cat, i) => (
              <CategoryRow
                key={cat.tokenId.toString()}
                cat={cat}
                last={i === categories.length - 1}
                qty={getQty(cat.tokenId.toString())}
                onChange={(v) => setQtyFor(cat.tokenId.toString(), v)}
                disabled={mode !== "idle"}
              />
            ))}
          </ul>
        )}
      </section>

      {/* Checkout */}
      <Checkout
        totalTickets={totalTickets}
        totalPrice={totalPrice}
        method={method}
        setMethod={setMethod}
        mode={mode}
        address={address}
        hash={hash}
        error={error}
        onPay={pay}
        onReset={resetCheckout}
        progress={{ current: qIndex + 1, total: queue.length }}
      />
    </div>
  );
}

/* ---------- Category row ---------- */

function CategoryRow({
  cat,
  last,
  qty,
  onChange,
  disabled,
}: {
  cat: TicketCategory;
  last: boolean;
  qty: number;
  onChange: (v: number) => void;
  disabled: boolean;
}) {
  const soldOut = cat.remaining === BigInt(0);
  const maxReachable = Number(cat.remaining);

  return (
    <li
      className={clsx(
        "flex items-center justify-between gap-4 px-5 sm:px-6 py-5",
        !last && "border-b border-line",
      )}
    >
      <div className="min-w-0">
        <p className="font-semibold text-ink">{cat.name}</p>
        <p className="text-xs text-ink-faint mt-0.5">
          {soldOut ? (
            <span className="text-red-500 font-medium">Épuisé</span>
          ) : (
            `${cat.remaining.toString()} restant${cat.remaining > BigInt(1) ? "s" : ""}`
          )}
        </p>
      </div>

      <div className="flex items-center gap-4 sm:gap-6 shrink-0">
        <span className="font-bold text-ink tabular-nums">
          {formatEther(cat.price)} ETH
        </span>
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
              disabled={disabled || qty >= maxReachable}
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
  totalPrice,
  method,
  setMethod,
  mode,
  address,
  hash,
  error,
  onPay,
  onReset,
  progress,
}: {
  totalTickets: number;
  totalPrice: bigint;
  method: PayMethod;
  setMethod: (m: PayMethod) => void;
  mode: Mode;
  address?: `0x${string}`;
  hash?: `0x${string}`;
  error: Error | null;
  onPay: () => void;
  onReset: () => void;
  progress: { current: number; total: number };
}) {
  const empty = totalTickets === 0;
  const processing = mode === "card-processing" || mode === "wallet-processing";
  const success = mode === "card-success" || mode === "wallet-success";
  const priceLabel = `${formatEther(totalPrice)} ETH`;

  if (success) {
    return (
      <section className="card p-6 sm:p-8 text-center">
        <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-ink mb-1">Paiement confirmé</h3>
        <p className="text-sm text-ink-muted mb-5">
          {mode === "card-success"
            ? "Paiement par carte simulé - vos billets seront mintés par la plateforme."
            : "Vos billets NFT ont été mintés dans votre wallet."}
        </p>
        {hash && (
          <a
            href={`https://sepolia.etherscan.io/tx/${hash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink mb-5"
          >
            Voir la dernière transaction <ExternalLink className="w-3 h-3" />
          </a>
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
            {error?.message?.slice(0, 140) ?? "La transaction a échoué."}
          </span>
        </div>
      )}

      {method === "wallet" && !address && (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm mb-4">
          <AlertCircle className="w-4 h-4 shrink-0" />
          Connectez votre wallet pour payer en ETH.
        </div>
      )}

      <button
        onClick={mode === "error" ? onReset : onPay}
        disabled={empty || processing || (method === "wallet" && !address)}
        className="btn-primary w-full py-3.5 text-base"
      >
        {processing ? (
          <>
            <Loader2 className="w-4 h-4 spin-slow" />
            {mode === "wallet-processing"
              ? `Mint ${progress.current}/${progress.total}…`
              : "Paiement en cours…"}
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
          Paiement par carte simulé (aucun débit réel).
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
          : "border-line hover:border-ink-faint",
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
