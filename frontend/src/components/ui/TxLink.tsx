import { ExternalLink } from 'lucide-react';

const EXPLORER = 'https://sepolia.etherscan.io';

/** Shortened, monospaced link to a transaction on the Sepolia explorer. */
export function TxLink({ hash }: { hash: string }) {
  return (
    <a
      href={`${EXPLORER}/tx/${hash}`}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink font-mono"
    >
      {hash.slice(0, 10)}…{hash.slice(-8)}
      <ExternalLink className="w-3 h-3" />
    </a>
  );
}

/** Icon-only link to a contract address on the Sepolia explorer. */
export function AddressLink({ address }: { address: string }) {
  return (
    <a
      href={`${EXPLORER}/address/${address}`}
      target="_blank"
      rel="noopener noreferrer"
      className="text-ink-faint hover:text-ink"
      title={address}
    >
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );
}
