"use client";

// Hash-based refresh is now handled by EventsProvider via SSE.
// This component is kept as a no-op so existing imports don't break.
// It can be removed once all call sites are cleaned up.
export function AutoRefresh({ url: _url }: { url: string; intervalMs?: number }) {
  return null;
}
