'use client';

import { useState } from 'react';
import { useDisconnect } from 'wagmi';
import { LogOut, Copy, Check } from 'lucide-react';

/** Dropdown shown under the connected-wallet button (copy address, disconnect). */
export function WalletMenu({
  address,
  onClose,
}: {
  address: string;
  onClose: () => void;
}) {
  const { disconnect } = useDisconnect();
  const [copied, setCopied] = useState(false);

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
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
            {copied ? (
              <Check className="w-4 h-4 text-emerald-500" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? 'Copié !' : "Copier l'adresse"}
          </button>
          <button
            onClick={() => {
              disconnect();
              onClose();
            }}
            className="flex items-center gap-2.5 w-full px-3 py-2 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Déconnecter
          </button>
        </div>
      </div>
    </>
  );
}
