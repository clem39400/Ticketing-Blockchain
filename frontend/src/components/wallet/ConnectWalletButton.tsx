'use client';

import { useState } from 'react';
import { useAccount, useConnect } from 'wagmi';
import { Wallet, ChevronDown } from 'lucide-react';
import { WalletMenu } from './WalletMenu';

/** Navbar wallet control: connect button, or address + dropdown when connected. */
export function ConnectWalletButton() {
  const { address, isConnected } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const [open, setOpen] = useState(false);

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

        {open && <WalletMenu address={address} onClose={() => setOpen(false)} />}
      </div>
    );
  }

  return (
    <button
      onClick={() => connect({ connector: connectors[0] })}
      disabled={isPending}
      className="btn-primary text-sm"
    >
      <Wallet className="w-4 h-4" />
      {isPending ? 'Connexion…' : 'Connecter le Wallet'}
    </button>
  );
}
