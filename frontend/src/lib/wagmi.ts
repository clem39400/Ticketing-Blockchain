import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';

// PERF: only the `injected` connector is used — it talks to the MetaMask
// (or any EIP-1193) browser extension directly. The wagmi `metaMask()`
// connector pulls the multi-MB @metamask/sdk into every page bundle and
// was the main cause of slow page-to-page navigation.
export const config = createConfig({
  chains: [sepolia],
  connectors: [injected()],
  transports: {
    [sepolia.id]: http(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC ??
        'https://ethereum-sepolia-rpc.publicnode.com',
      // Batch JSON-RPC calls issued in the same tick into a single request.
      { batch: true }
    ),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
