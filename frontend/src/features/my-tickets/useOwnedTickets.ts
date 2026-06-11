'use client';

import { useMemo } from 'react';
import { useEvents } from '@/hooks/useEvents';
import { useTicketBalances } from '@/hooks/contracts/useTicketBalances';
import { ticketKey } from '@/lib/tickets';
import type { EventInfo, TicketInfo } from '@/lib/api';

export type OwnedTicket = { ticket: TicketInfo; count: number };
export type OwnedEvent = { event: EventInfo; owned: OwnedTicket[] };

/**
 * Tickets owned by the connected wallet, grouped by event
 * (one balanceOf(address, tokenId) call per ticket type, on ITS contract).
 */
export function useOwnedTickets() {
  const { data: events, isLoading: eventsLoading } = useEvents();

  const allTickets = useMemo(
    () => (events ?? []).flatMap((e) => e.tickets),
    [events]
  );
  const { balances, isLoading: balancesLoading } = useTicketBalances(allTickets);

  const ownedByEvent: OwnedEvent[] = useMemo(() => {
    if (!events) return [];
    return events
      .map((event) => ({
        event,
        owned: event.tickets
          .map((ticket) => ({
            ticket,
            count:
              balances[ticketKey(ticket.contractAddress, ticket.onChainTokenId)] ??
              0,
          }))
          .filter((o) => o.count > 0),
      }))
      .filter((g) => g.owned.length > 0);
  }, [events, balances]);

  const totalTickets = ownedByEvent.reduce(
    (s, g) => s + g.owned.reduce((s2, o) => s2 + o.count, 0),
    0
  );

  return {
    ownedByEvent,
    totalTickets,
    isLoading: eventsLoading || balancesLoading,
  };
}
