// Low-level HTTP client for the Spring backend. Only transport concerns
// live here — endpoint functions are in events.ts / tickets.ts.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8080';

async function parseError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    if (body && typeof body.error === 'string') return body.error;
  } catch {
    /* not JSON */
  }
  return `Erreur HTTP ${res.status}`;
}

/** GET helper — throws a readable Error on non-2xx responses. */
export async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`);
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

/** POST helper — the backend uses @RequestParam, so form-encode everything. */
export async function postForm(
  path: string,
  params: Record<string, string>
): Promise<Response> {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(params).toString(),
  });
  if (!res.ok) throw new Error(await parseError(res));
  return res;
}
