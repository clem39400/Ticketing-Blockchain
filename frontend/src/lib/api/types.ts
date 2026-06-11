// Shared API types — events and tickets as stored by the Spring backend
// (MongoDB metadata + one contract deployed PER TICKET TYPE).

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
