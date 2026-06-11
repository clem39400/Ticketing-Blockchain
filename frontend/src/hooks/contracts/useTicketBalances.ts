'use client';

import { useAccount, useReadContracts } from 'wagmi';
import type { Address } from 'viem';
import { TICKET_ABI } from '@/contracts/Ticket';
import { isOnChain, ticketKey } from '@/lib/tickets';
import type { TicketInfo } from '@/lib/api';

/**
 * balanceOf(account, tokenId) for a LIST of ticket types (my-tickets page).
 * Returns a map keyed by ticketKey(contractAddress, onChainTokenId).
 */
export function useTicketBalances(tickets: TicketInfo[]) {
  const { address } = useAccount();
  const onChainTickets = tickets.filter(isOnChain);

  const { data, isLoading, refetch } = useReadContracts({
    contracts: onChainTickets.map((t) => ({
      address: t.contractAddress as Address,
      abi: TICKET_ABI,
      functionName: 'balanceOf' as const,
      args: address
        ? ([address, BigInt(t.onChainTokenId)] as const)
        : undefined,
    })),
    query: {
      enabled: !!address && onChainTickets.length > 0,
      refetchInterval: 30_000,
    },
  });

  const balances: Record<string, number> = {};
  onChainTickets.forEach((t, i) => {
    const entry = data?.[i];
    if (entry?.status === 'success') {
      balances[ticketKey(t.contractAddress, t.onChainTokenId)] = Number(
        entry.result as bigint
      );
    }
  });

  return { balances, isLoading, refetch };
}
