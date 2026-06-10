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
          className="flex items-center gap-2 bg-white/[0.06] hover:bg-white/[0.09] border border-white/[0.1] hover:border-white/[0.18] rounded-full px-4 py-2 text-sm font-medium transition-all duration-200"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
          <span className="font-mono text-white/90">
            {address.slice(0, 6)}…{address.slice(-4)}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-white/40 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          />
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl bg-surface-card border border-surface-border shadow-2xl shadow-black/50 overflow-hidden">
              <div className="px-4 py-3 border-b border-surface-border">
                <p className="text-xs text-white/40 mb-1">Connecté sur Sepolia</p>
                <p className="font-mono text-xs text-white/70 truncate">{address}</p>
              </div>
              <div className="p-1.5">
                <button
                  onClick={copyAddress}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-white/70 hover:text-white hover:bg-white/[0.06] rounded-xl transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier l\'adresse'}
                </button>
                <button
                  onClick={() => { disconnect(); setOpen(false); }}
                  className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/[0.08] rounded-xl transition-colors"
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
      className="flex items-center gap-2 btn-primary text-sm"
    >
      <Wallet className="w-4 h-4" />
      {isPending ? 'Connexion…' : 'Connecter le Wallet'}
    </button>
  );
}
