// Pure helpers around ticket types (no React, no network).

import { parseEther } from 'viem';
import type { TicketInfo } from '@/lib/api/types';

/** Stable key for a (contractAddress, tokenId) pair. Null parts (ticket not
 *  yet deployed on-chain) map to 'pending' so the key stays usable in React. */
export function ticketKey(
  contractAddress: string | null,
  tokenId: number | null
): string {
  return `${(contractAddress ?? 'pending').toLowerCase()}-${tokenId ?? 'pending'}`;
}

/** A ticket whose contract is deployed and on-chain category created. */
export type OnChainTicket = TicketInfo & {
  contractAddress: string;
  onChainTokenId: number;
};

/** Tickets fresh out of the DB can have null contractAddress/onChainTokenId
 *  while the backend is still deploying — those cannot be read or bought. */
export function isOnChain(t: TicketInfo): t is OnChainTicket {
  return t.contractAddress !== null && t.onChainTokenId !== null;
}

/**
 * Exact wei amount expected by Ticket.buy (msg.value == quantity * price).
 * Prefer the on-chain price when known; otherwise derive it from the DB
 * price in ETH via parseEther(String(price)).
 */
export function computeBuyValue(
  priceEth: number,
  quantity: number,
  onChainPrice?: bigint
): bigint {
  const unit = onChainPrice ?? parseEther(String(priceEth));
  return unit * BigInt(quantity);
}

/** Lowest ticket price of an event (ETH), or null when it has no tickets. */
export function minTicketPrice(tickets: TicketInfo[]): number | null {
  if (tickets.length === 0) return null;
  return tickets.reduce((m, t) => (t.price < m ? t.price : m), tickets[0].price);
}
