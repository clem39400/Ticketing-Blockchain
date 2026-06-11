'use client';

import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import type { Address } from 'viem';
import { TICKET_ABI } from '@/contracts/Ticket';

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
