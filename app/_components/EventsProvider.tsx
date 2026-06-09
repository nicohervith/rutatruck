"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type EventsState = { notifCount: number; privCount: number; hash: string };

const EventsContext = createContext<EventsState>({ notifCount: 0, privCount: 0, hash: "" });

export function useNotifCount() {
  return useContext(EventsContext).notifCount;
}

export function usePrivCount() {
  return useContext(EventsContext).privCount;
}

export function EventsProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [state, setState] = useState<EventsState>({ notifCount: 0, privCount: 0, hash: "" });
  const hashRef = useRef<string | null>(null);

  useEffect(() => {
    let es: EventSource;
    let retryId: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource("/api/events");

      es.addEventListener("update", (e: MessageEvent) => {
        const payload = JSON.parse(e.data) as { count?: number; privCount?: number; hash?: string };

        setState((prev) => ({
          notifCount: payload.count ?? prev.notifCount,
          privCount: payload.privCount ?? prev.privCount,
          hash: payload.hash ?? prev.hash,
        }));

        if (payload.hash !== undefined) {
          if (hashRef.current !== null && hashRef.current !== payload.hash) {
            router.refresh();
          }
          hashRef.current = payload.hash;
        }
      });

      es.onerror = () => {
        es.close();
        retryId = setTimeout(connect, 4000);
      };
    }

    connect();
    return () => {
      es?.close();
      clearTimeout(retryId);
    };
  }, [router]);

  return (
    <EventsContext.Provider value={state}>
      {children}
    </EventsContext.Provider>
  );
}
