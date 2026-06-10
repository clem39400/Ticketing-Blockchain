// Typed client for the Spring backend (events + tickets stored in MongoDB,
// contracts deployed by the backend — one contract PER TICKET TYPE).

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

/** A ticket type (category). Each one has its OWN contract. */
export type TicketInfo = {
  name: string;
  description: string;
  /** Max supply (DB value, fallback when on-chain read is unavailable). */
  quantity: number;
  /** Price in ETH (double). */
  price: number;
  /** null until the backend has created the on-chain category. */
  onChainTokenId: number | null;
  /** null until the backend has deployed the ticket contract. */
  contractAddress: string | null;
};

export type EventInfo = {
  name: string;
  description: string;
  /** ISO date string (yyyy-MM-dd) from Jackson. */
  eventDate: string;
  eventBanner: string | null;
  contractAddress: string | null;
  tickets: TicketInfo[];
};

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.error === 'string') return body.error;
  } catch {
    /* not JSON */
  }
  return `Erreur HTTP ${res.status}`;
}

/** POST helper — the backend uses @RequestParam, so form-encode everything. */
async function postForm(path: string, params: Record<string, string>): Promise<Response> {
  const body = new URLSearchParams(params);
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res;
}

/** GET /events — all events with their ticket types. */
export async function getEvents(): Promise<EventInfo[]> {
  const res = await fetch(`${API_URL}/events`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** GET /event-info?eventName=X — a single event, or 404. */
export async function getEventInfo(eventName: string): Promise<EventInfo> {
  const res = await fetch(
    `${API_URL}/event-info?eventName=${encodeURIComponent(eventName)}`
  );
  if (res.status === 404) throw new Error('Événement introuvable.');
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** POST /setup-event — create event metadata in the back-office. */
export async function setupEvent(input: {
  name: string;
  description: string;
  /** yyyy-MM-dd */
  eventDate: string;
  eventBanner?: string;
  contractAddress?: string;
}): Promise<void> {
  const params: Record<string, string> = {
    name: input.name,
    description: input.description,
    eventDate: input.eventDate,
  };
  if (input.eventBanner) params.eventBanner = input.eventBanner;
  if (input.contractAddress) params.contractAddress = input.contractAddress;
  await postForm('/setup-event', params);
}

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
export async function collectEth(eventName: string): Promise<{ txHashes: string[] }> {
  const res = await postForm('/collect-eth', { eventName });
  return res.json();
}
