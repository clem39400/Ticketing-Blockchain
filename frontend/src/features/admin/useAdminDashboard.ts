'use client';

import { useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useEvents } from '@/hooks/useEvents';
import { useOnChainCategories } from '@/hooks/contracts/useOnChainCategories';
import { useContractEthBalances } from '@/hooks/contracts/useContractEthBalances';
import { ticketKey } from '@/lib/tickets';

/**
 * Aggregated data for the admin dashboard: events from the API, on-chain
 * sold counts, per-contract ETH balances and the derived global stats.
 */
export function useAdminDashboard() {
  const queryClient = useQueryClient();
  const {
    data: events,
    isLoading: eventsLoading,
    isError: eventsError,
    refetch: refetchEvents,
  } = useEvents();

  const allRows = useMemo(
    () =>
      (events ?? []).flatMap((event) =>
        event.tickets.map((ticket) => ({ event, ticket }))
      ),
    [events]
  );
  const allTickets = useMemo(() => allRows.map((r) => r.ticket), [allRows]);
  const allAddresses = useMemo(
    () =>
      allTickets
        .map((t) => t.contractAddress)
        .filter((a): a is string => a !== null),
    [allTickets]
  );

  const { categories: onChain, refetch: refetchOnChain } =
    useOnChainCategories(allTickets);
  const { data: balances, refetch: refetchBalances } =
    useContractEthBalances(allAddresses);

  const refreshAll = () => {
    refetchEvents();
    refetchOnChain();
    refetchBalances();
    queryClient.invalidateQueries({ queryKey: ['events'] });
  };

  const totalSold = allTickets.reduce((s, t) => {
    const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
    return s + (cat ? Number(cat.minted) : 0);
  }, 0);
  const totalSupply = allTickets.reduce((s, t) => {
    const cat = onChain[ticketKey(t.contractAddress, t.onChainTokenId)];
    return s + (cat ? Number(cat.maxSupply) : t.quantity);
  }, 0);
  const totalEthWei = balances
    ? Object.values(balances).reduce((s, v) => s + v, BigInt(0))
    : undefined;

  return {
    events: events ?? [],
    eventsLoading,
    eventsError,
    allRows,
    allTickets,
    onChain,
    balances,
    refreshAll,
    stats: { totalSold, totalSupply, totalEthWei },
  };
}
