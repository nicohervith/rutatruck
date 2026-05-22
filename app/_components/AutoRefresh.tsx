"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export function AutoRefresh({
  url,
  intervalMs = 12000,
}: {
  url: string;
  intervalMs?: number;
}) {
  const router = useRouter();
  const lastRef = useRef<string | null>(null);

  useEffect(() => {
    const check = async () => {
      if (document.hidden) return;
      try {
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const value = await res.text();
        if (lastRef.current !== null && lastRef.current !== value) {
          router.refresh();
        }
        lastRef.current = value;
      } catch {}
    };

    check();
    const id = setInterval(check, intervalMs);
    return () => clearInterval(id);
  }, [url, intervalMs, router]);

  return null;
}
