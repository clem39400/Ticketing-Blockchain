// Ticket endpoints of the Spring backend.

import { postForm } from './client';

/**
 * POST /create-ticket — the BACKEND deploys the ticket contract and creates
 * the on-chain category. Can take ~1-2 minutes.
 */
export async function createTicket(input: {
  eventName: string;
  ticketName: string;
  description: string;
  quantity: number;
  /** Price in ETH. */
  price: number;
}): Promise<void> {
  await postForm('/create-ticket', {
    eventName: input.eventName,
    ticketName: input.ticketName,
    description: input.description,
    quantity: String(input.quantity),
    price: String(input.price),
  });
}

/**
 * POST /buy-ticket-eur — fake euro payment; the backend mints to buyerAddress.
 * Can take ~30-60s (on-chain mint). Returns the mint tx hash.
 */
export async function buyTicketEur(input: {
  eventName: string;
  ticketName: string;
  quantity: number;
  buyerAddress: string;
}): Promise<{ txHash: string }> {
  const res = await postForm('/buy-ticket-eur', {
    eventName: input.eventName,
    ticketName: input.ticketName,
    quantity: String(input.quantity),
    buyerAddress: input.buyerAddress,
  });
  return res.json();
}

/**
 * POST /collect-eth — the backend calls withdraw() on every ticket contract
 * of the event (contracts are owned by the backend's deployer key).
 */
export async function collectEth(
  eventName: string
): Promise<{ txHashes: string[] }> {
  const res = await postForm('/collect-eth', { eventName });
  return res.json();
}
