import type { Address } from 'viem';

export const CONTRACT_ADDRESS: Address =
  (process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as Address) ??
  '0xc56d9d5fb9202c6c91bed66e27fb816fa2e54b89';

export const EVENT_TICKET_ABI = [
  // ---- View functions ----
  {
    type: 'function',
    name: 'eventName',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'nextTokenId',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getCategoryCount',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'categories',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'name', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'totalMinted', type: 'uint256' },
      { name: 'metadataURI', type: 'string' },
      { name: 'exists', type: 'bool' },
    ],
  },
  {
    type: 'function',
    name: 'remainingTickets',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'uri',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'string' }],
  },
  {
    type: 'function',
    name: 'balanceOf',
    stateMutability: 'view',
    inputs: [
      { name: 'account', type: 'address' },
      { name: 'id', type: 'uint256' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },
  // ---- Write functions ----
  {
    type: 'function',
    name: 'mintForETH',
    stateMutability: 'payable',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'createCategory',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'name', type: 'string' },
      { name: 'price', type: 'uint256' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'metadataURI', type: 'string' },
    ],
    outputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'mintForAddress',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'to', type: 'address' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'withdraw',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  // ---- Events ----
  {
    type: 'event',
    name: 'CategoryCreated',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'name', type: 'string', indexed: false },
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'maxSupply', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TicketMinted',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'buyer', type: 'address', indexed: true },
      { name: 'onChain', type: 'bool', indexed: false },
    ],
  },
  // ---- Errors ----
  {
    type: 'error',
    name: 'CategoryNotFound',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'SoldOut',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
  },
  {
    type: 'error',
    name: 'IncorrectPrice',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'sent', type: 'uint256' },
      { name: 'required', type: 'uint256' },
    ],
  },
  { type: 'error', name: 'WithdrawFailed', inputs: [] },
] as const;

export type TicketCategory = {
  tokenId: bigint;
  name: string;
  price: bigint;
  maxSupply: bigint;
  totalMinted: bigint;
  metadataURI: string;
  exists: boolean;
  remaining: bigint;
};
