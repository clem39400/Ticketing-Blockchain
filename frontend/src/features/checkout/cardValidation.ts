// Pure card-input helpers for the fake card checkout (no React).

export const TEST_CARD = '4242424242424242';
export const DECLINED_CARD = '4000000000000002';

/** Vérification de Luhn — comme un vrai PSP. */
export function luhnValid(digits: string): boolean {
  let sum = 0;
  let double = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let d = Number(digits[i]);
    if (double) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    double = !double;
  }
  return sum % 10 === 0;
}

/** "4242424242424242" → "4242 4242 4242 4242" */
export function formatCardNumber(value: string): string {
  return value
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ');
}

/** "1228" → "12/28" */
export function formatExpiry(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

/** Full form validation. Returns an error message, or null when valid. */
export function validateCardForm(input: {
  holder: string;
  number: string;
  expiry: string;
  cvc: string;
}): string | null {
  const digits = input.number.replace(/\D/g, '');
  if (!input.holder.trim()) return 'Le nom du titulaire est requis.';
  if (digits.length !== 16 || !luhnValid(digits)) return 'Numéro de carte invalide.';
  const m = input.expiry.match(/^(\d{2})\/(\d{2})$/);
  if (!m) return "Date d'expiration invalide (MM/AA).";
  const month = Number(m[1]);
  if (month < 1 || month > 12) return "Mois d'expiration invalide.";
  const expEnd = new Date(2000 + Number(m[2]), month, 1); // 1er jour du mois suivant
  if (expEnd <= new Date()) return 'Carte expirée.';
  if (!/^\d{3,4}$/.test(input.cvc)) return 'CVC invalide.';
  return null;
}
