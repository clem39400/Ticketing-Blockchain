'use client';

import {
  useReadContract,
  useReadContracts,
  useWriteContract,
  useWaitForTransactionReceipt,
  useAccount,
} from 'wagmi';
import { CONTRACT_ADDRESS, EVENT_TICKET_ABI } from '@/contracts/EventTicket1155';
import type { TicketCategory } from '@/contracts/EventTicket1155';

const BASE = {
  address: CONTRACT_ADDRESS,
  abi: EVENT_TICKET_ABI,
} as const;

export function useEventName() {
  return useReadContract({ ...BASE, functionName: 'eventName' });
}

export function useCategoryCount() {
  return useReadContract({ ...BASE, functionName: 'getCategoryCount' });
}

export function useContractOwner() {
  return useReadContract({ ...BASE, functionName: 'owner' });
}

export function useIsOwner() {
  const { address } = useAccount();
  const { data: owner } = useContractOwner();
  return (
    !!address &&
    !!owner &&
    address.toLowerCase() === owner.toLowerCase()
  );
}

export function useAllCategories(count: number) {
  const catContracts = Array.from({ length: count }, (_, i) => ({
    ...BASE,
    functionName: 'categories' as const,
    args: [BigInt(i + 1)] as const,
  }));

  const remContracts = Array.from({ length: count }, (_, i) => ({
    ...BASE,
    functionName: 'remainingTickets' as const,
    args: [BigInt(i + 1)] as const,
  }));

  const { data: catData, isLoading: catLoading, refetch: refetchCat } =
    useReadContracts({ contracts: catContracts, query: { refetchInterval: 30_000 } });

  const { data: remData, isLoading: remLoading, refetch: refetchRem } =
    useReadContracts({ contracts: remContracts, query: { refetchInterval: 30_000 } });

  type RawCategory = readonly [
    name: string,
    price: bigint,
    maxSupply: bigint,
    totalMinted: bigint,
    metadataURI: string,
    exists: boolean,
  ];

  const categories: TicketCategory[] = (catData ?? [])
    .map((entry, i) => {
      if (entry.status !== 'success') return null;
      const raw = entry.result as RawCategory;
      if (!raw[5]) return null; // exists === false
      const rem =
        remData?.[i]?.status === 'success'
          ? (remData[i].result as bigint)
          : BigInt(0);
      return {
        tokenId: BigInt(i + 1),
        name: raw[0],
        price: raw[1],
        maxSupply: raw[2],
        totalMinted: raw[3],
        metadataURI: raw[4],
        exists: raw[5],
        remaining: rem,
      } as TicketCategory;
    })
    .filter((c): c is TicketCategory => c !== null);

  return {
    categories,
    isLoading: catLoading || remLoading,
    refetch: () => { refetchCat(); refetchRem(); },
  };
}

export function useUserBalance(tokenId: bigint) {
  const { address } = useAccount();
  return useReadContract({
    ...BASE,
    functionName: 'balanceOf',
    args: address ? [address, tokenId] : undefined,
    query: { enabled: !!address },
  });
}

export function useMintForETH() {
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

  const mint = (tokenId: bigint, price: bigint) => {
    writeContract({
      ...BASE,
      functionName: 'mintForETH',
      args: [tokenId],
      value: price,
    });
  };

  return {
    mint,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError ?? confirmError,
    reset,
  };
}

export function useCreateCategory() {
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

  const createCategory = (
    name: string,
    priceWei: bigint,
    maxSupply: bigint,
    metadataURI: string
  ) => {
    writeContract({
      ...BASE,
      functionName: 'createCategory',
      args: [name, priceWei, maxSupply, metadataURI],
    });
  };

  return {
    createCategory,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError ?? confirmError,
    reset,
  };
}

export function useWithdraw() {
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

  const withdraw = () => {
    writeContract({ ...BASE, functionName: 'withdraw' });
  };

  return {
    withdraw,
    hash,
    isWritePending,
    isConfirming,
    isConfirmed,
    error: writeError ?? confirmError,
    reset,
  };
}
