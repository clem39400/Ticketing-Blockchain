/** Format an ISO date (yyyy-MM-dd) from the API into French long form. */
export function formatEventDate(iso?: string | null): string {
  if (!iso) return 'Date à venir';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Format an ETH amount (number from the DB) without float noise. */
export function formatEth(price: number): string {
  return `${Number(price.toFixed(6))} ETH`;
}

/** Format a euro amount in French locale (e.g. "12,50 €"). */
export function formatEur(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}
