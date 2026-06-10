const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request(path, options = {}) {
  const res = await fetch(`${BASE}${path}`, options);
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new Error(text || `HTTP ${res.status}`);
  }
  return res.json();
}

export const api = {
  getEvents: () => request('/events'),

  getEvent: (id) => request(`/events/${id}`),

  getCategories: (id) => request(`/events/${id}/categories`),

  getMyTickets: (address) => request(`/my-tickets?address=${address}`),

  createEvent: (formData) =>
    request('/events', { method: 'POST', body: formData }),

  createCategory: (eventId, formData) =>
    request(`/events/${eventId}/categories`, { method: 'POST', body: formData }),

  pay: (body) =>
    request('/events/pay', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }),
};
