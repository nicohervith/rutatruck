"use client";

import type { CSSProperties } from "react";
import { useRouter, usePathname } from "next/navigation";

interface Opcion {
  value: string;
  label: string;
  count?: number;
  activeStyle?: CSSProperties;
}

export default function FiltroEstado({
  opciones,
  current,
}: {
  opciones: Opcion[];
  current: string;
}) {
  const router = useRouter();
  const pathname = usePathname();

  function select(value: string) {
    if (value) router.push(`${pathname}?estado=${encodeURIComponent(value)}`);
    else router.push(pathname);
  }

  return (
    <div className="flex flex-wrap gap-2">
      {opciones.map(({ value, label, count, activeStyle }) => {
        const active = current === value;
        const defaultActiveStyle: CSSProperties = {
          borderColor: "var(--primary)",
          color: "var(--primary)",
          backgroundColor: "var(--primary-10)",
        };
        const appliedStyle = active ? (activeStyle ?? defaultActiveStyle) : { borderColor: "#D1D5DB", color: "#6B7280", backgroundColor: "transparent" };
        return (
          <button
            key={value}
            onClick={() => select(value)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            style={appliedStyle}
          >
            {label}
            {count !== undefined && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={active ? { backgroundColor: "rgba(0,0,0,0.08)" } : { backgroundColor: "#E5E7EB" }}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
