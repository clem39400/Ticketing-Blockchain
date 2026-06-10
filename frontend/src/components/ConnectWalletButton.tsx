'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { metaMask } from 'wagmi/connectors';
import { Wallet, ChevronDown, LogOut, Copy, Check } from 'lucide-react';
import { useState } from 'react';

export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 bg-card hover:bg-page border border-line-strong rounded-lg px-3.5 py-2 text-sm font-semibold transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="font-mono text-ink">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-ink-faint transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-12 z-50 w-56 rounded-xl bg-card border border-line shadow-lift overflow-hidden">
              <div className="px-4 py-3 border-b border-line">
                <p className="text-xs text-ink-faint mb-1">Connecté sur Sepolia</p>
                <p className="font-mono text-xs text-ink-muted truncate">{address}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-ink-muted hover:text-ink hover:bg-page rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : "Copier l'adresse"}
                </button>
                <button
                  onClick={() => {
                    disconnect();
                    setOpen(false);
                  }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnecter
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: metaMask() })}
      disabled={isPending}
      className="btn-primary text-sm"
    >
      <Wallet className="w-4 h-4" />
      {isPending ? 'Connexion…' : 'Connecter le Wallet'}
    </button>
  );
}
