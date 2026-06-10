// ABI of the new per-ticket-type contract (Smart-contracts/src/Ticket.sol).
// One contract is deployed by the backend for EACH ticket type;
// the frontend reads/writes it at the `contractAddress` stored in the DB.

export const TICKET_ABI = [
  // ---- Views ----
  {
    type: 'function',
    name: 'getCategory',
    stateMutability: 'view',
    inputs: [{ name: 'tokenId', type: 'uint256' }],
    outputs: [
      { name: 'price', type: 'uint256' },
      { name: 'maxSupply', type: 'uint256' },
      { name: 'minted', type: 'uint256' },
      { name: 'uri_', type: 'string' },
    ],
  },
  {
    type: 'function',
    name: 'allTokenIds',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'uint256[]' }],
  },
  {
    type: 'function',
    name: 'ticketsOf',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [
      { name: 'tokenIds', type: 'uint256[]' },
      { name: 'balances', type: 'uint256[]' },
    ],
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
    name: 'balanceOfBatch',
    stateMutability: 'view',
    inputs: [
      { name: 'accounts', type: 'address[]' },
      { name: 'ids', type: 'uint256[]' },
    ],
    outputs: [{ name: '', type: 'uint256[]' }],
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
    name: 'owner',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'address' }],
  },

  // ---- Writes ----
  {
    type: 'function',
    name: 'buy',
    stateMutability: 'payable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'quantity', type: 'uint256' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'createCategory',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'tokenId', type: 'uint256' },
      { name: 'price_', type: 'uint256' },
      { name: 'maxSupply_', type: 'uint256' },
      { name: 'uri_', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'mint',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'tokenId', type: 'uint256' },
      { name: 'quantity', type: 'uint256' },
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
      { name: 'price', type: 'uint256', indexed: false },
      { name: 'maxSupply', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TicketsBought',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'buyer', type: 'address', indexed: true },
      { name: 'quantity', type: 'uint256', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'TicketsMinted',
    inputs: [
      { name: 'tokenId', type: 'uint256', indexed: true },
      { name: 'to', type: 'address', indexed: true },
      { name: 'quantity', type: 'uint256', indexed: false },
    ],
  },
] as const;

/** On-chain category data returned by getCategory(tokenId). */
export type OnChainCategory = {
  price: bigint;
  maxSupply: bigint;
  minted: bigint;
  uri: string;
};
