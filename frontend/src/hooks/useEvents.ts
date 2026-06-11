'use client';

import { useQuery } from '@tanstack/react-query';
import { getEvents, getEventInfo } from '@/lib/api';

// PERF: a generous staleTime lets pages render the cached list instantly
// when navigating back and forth instead of showing a spinner each time.
const EVENTS_STALE_MS = 60_000;

/** All events with their ticket types (shared cache key across pages). */
export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: EVENTS_STALE_MS,
  });
}

/** A single event by name (event detail page). */
export function useEventInfo(eventName: string) {
  return useQuery({
    queryKey: ['event-info', eventName],
    queryFn: () => getEventInfo(eventName),
    enabled: !!eventName,
    staleTime: EVENTS_STALE_MS,
  });
}
