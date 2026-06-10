'use client';

import { useQuery } from '@tanstack/react-query';

/** Taux de secours si CoinGecko est injoignable (demo). */
const FALLBACK_ETH_EUR = 3000;

/**
 * Taux ETH → EUR en direct via CoinGecko (rafraîchi toutes les 5 min).
 * Retourne aussi `isLive` pour indiquer si le taux est réel ou le fallback.
 */
export function useEthEurRate(): { rate: number; isLive: boolean } {
  const { data } = useQuery({
    queryKey: ['eth-eur-rate'],
    queryFn: async () => {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=eur'
      );
      if (!res.ok) throw new Error('CoinGecko indisponible');
      const json = (await res.json()) as { ethereum?: { eur?: number } };
      const rate = json.ethereum?.eur;
      if (!rate || rate <= 0) throw new Error('Taux invalide');
      return rate;
    },
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
    retry: 1,
  });

  return { rate: data ?? FALLBACK_ETH_EUR, isLive: data !== undefined };
}
