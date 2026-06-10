'use client';

import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
  useBalance,
  usePublicClient,
} from 'wagmi';
import { useQuery } from '@tanstack/react-query';
import { parseEther, type Address } from 'viem';
import { TICKET_ABI, type OnChainCategory } from '@/contracts/Ticket';
import type { TicketInfo } from '@/lib/api';

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

/* ------------------------------------------------------------------ */
/* Reads                                                               */
/* ------------------------------------------------------------------ */

/** getCategory(tokenId) on one ticket contract. */
export function useCategory(contractAddress?: string, tokenId?: number) {
  const { data, ...rest } = useReadContract({
    address: contractAddress as Address | undefined,
    abi: TICKET_ABI,
    functionName: 'getCategory',
    args: tokenId !== undefined ? [BigInt(tokenId)] : undefined,
    query: {
      enabled: !!contractAddress && tokenId !== undefined,
      refetchInterval: 30_000,
    },
  });

  const category: OnChainCategory | undefined = data
    ? { price: data[0], maxSupply: data[1], minted: data[2], uri: data[3] }
    : undefined;

  return { category, ...rest };
}

/**
 * getCategory for a LIST of ticket types (one contract call per type).
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

/** ETH balance of ONE ticket contract (admin). */
export function useContractEthBalance(contractAddress?: string) {
  return useBalance({
    address: contractAddress as Address | undefined,
    query: { enabled: !!contractAddress, refetchInterval: 15_000 },
  });
}

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

/* ------------------------------------------------------------------ */
/* Writes                                                              */
/* ------------------------------------------------------------------ */

/**
 * Public ETH purchase: buy(tokenId, quantity) on a given ticket contract,
 * with value == quantity * price EXACTLY (contract reverts otherwise).
 */
export function useBuyTickets() {
  const {
    writeContract,
    data: hash,
    isPending: isWritePending,
    error: writeError,
    reset,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash });

  const buy = (
    contractAddress: string,
    tokenId: number,
    quantity: number,
    valueWei: bigint
  ) => {
    writeContract({
      address: contractAddress as Address,
      abi: TICKET_ABI,
      functionName: 'buy',
      args: [BigInt(tokenId), BigInt(quantity)],
      value: valueWei,
    });
  };

  return {
    buy,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError ?? confirmError,
    reset,
  };
}
