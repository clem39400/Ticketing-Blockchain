'use client';

import { useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { TICKET_ABI, type OnChainCategory } from '@/contracts/Ticket';
import { isOnChain, ticketKey } from '@/lib/tickets';
import type { TicketInfo } from '@/lib/api';

/**
 * getCategory for a LIST of ticket types (one contract call per type,
 * batched into a single multicall round-trip by wagmi).
 * Returns a map keyed by ticketKey(contractAddress, onChainTokenId).
 */
export function useOnChainCategories(tickets: TicketInfo[]) {
  const onChainTickets = tickets.filter(isOnChain);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: onChainTickets.map((t) => ({
      address: t.contractAddress as Address,
      abi: TICKET_ABI,
      functionName: 'getCategory' as const,
      args: [BigInt(t.onChainTokenId)] as const,
    })),
    query: { enabled: onChainTickets.length > 0, refetchInterval: 30_000 },
  });

  const categories: Record<string, OnChainCategory> = {};
  onChainTickets.forEach((t, i) => {
    const entry = data?.[i];
    if (entry?.status === 'success') {
      const raw = entry.result as readonly [bigint, bigint, bigint, string];
      categories[ticketKey(t.contractAddress, t.onChainTokenId)] = {
        price: raw[0],
        maxSupply: raw[1],
        minted: raw[2],
        uri: raw[3],
      };
    }
  });

  return { categories, isLoading, refetch };
}
