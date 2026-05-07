"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function CountdownTimer({ deadline }: { deadline: string }) {
  const router = useRouter();
  const [remaining, setRemaining] = useState<number>(
    Math.max(0, new Date(deadline).getTime() - Date.now()),
  );

  useEffect(() => {
    if (remaining <= 0) return;
    const id = setInterval(() => {
      const left = Math.max(0, new Date(deadline).getTime() - Date.now());
      setRemaining(left);
      if (left === 0) {
        clearInterval(id);
        router.refresh();
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadline, router]);

  if (remaining <= 0) {
    return (
      <span className="font-semibold text-red-400">Tiempo vencido</span>
    );
  }

  const hours = Math.floor(remaining / 3600000);
  const minutes = Math.floor((remaining % 3600000) / 60000);
  const seconds = Math.floor((remaining % 60000) / 1000);

  const color = remaining < 30 * 60 * 1000 ? "text-red-400" : "text-orange-300";

  return (
    <span className={`font-mono font-semibold ${color}`}>
      {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </span>
  );
}
