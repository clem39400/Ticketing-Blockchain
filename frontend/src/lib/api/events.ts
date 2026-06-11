// Event endpoints of the Spring backend.

import { API_URL, getJson, postForm } from './client';
import type { EventInfo } from './types';

/** GET /events — all events with their ticket types. */
export async function getEvents(): Promise<EventInfo[]> {
  return getJson<EventInfo[]>('/events');
}

/** GET /event-info?eventName=X — a single event, or 404. */
export async function getEventInfo(eventName: string): Promise<EventInfo> {
  const res = await fetch(
    `${API_URL}/event-info?eventName=${encodeURIComponent(eventName)}`
  );
  if (res.status === 404) throw new Error('Événement introuvable.');
  if (!res.ok) throw new Error(`Erreur HTTP ${res.status}`);
  return res.json();
}

/** POST /setup-event — create event metadata in the back-office. */
export async function setupEvent(input: {
  name: string;
  description: string;
  /** yyyy-MM-dd */
  eventDate: string;
  eventBanner?: string;
  contractAddress?: string;
}): Promise<void> {
  const params: Record<string, string> = {
    name: input.name,
    description: input.description,
    eventDate: input.eventDate,
  };
  if (input.eventBanner) params.eventBanner = input.eventBanner;
  if (input.contractAddress) params.contractAddress = input.contractAddress;
  await postForm('/setup-event', params);
}
