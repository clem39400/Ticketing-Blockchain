'use client';

import { usePublicClient } from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import type { Address } from 'viem';

/**
 * ETH balances of MANY ticket contracts at once (admin tickets table /
 * collect-ETH sums). Keyed by lowercased contract address.
 */
export function useContractEthBalances(addresses: string[]) {
  const publicClient = usePublicClient();
  const unique = Array.from(new Set(addresses.map((a) => a.toLowerCase())));

  return useQuery({
    queryKey: ['contract-eth-balances', unique],
    enabled: !!publicClient && unique.length > 0,
    refetchInterval: 15_000,
    queryFn: async () => {
      const out: Record<string, bigint> = {};
      await Promise.all(
        unique.map(async (addr) => {
          out[addr] = await publicClient!.getBalance({
            address: addr as Address,
          });
        })
      );
      return out;
    },
  });
}
