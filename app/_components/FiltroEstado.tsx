"use client";

import { useRouter, usePathname } from "next/navigation";

interface Opcion {
  value: string;
  label: string;
  count?: number;
  color?: string;
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
      {opciones.map(({ value, label, count, color }) => {
        const active = current === value;
        const c = color ?? "var(--primary)";
        return (
          <button
            key={value}
            onClick={() => select(value)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            style={
              active
                ? { borderColor: c, color: c, backgroundColor: c + "20" }
                : { borderColor: "#1E3838", color: "#6B7280", backgroundColor: "transparent" }
            }
          >
            {label}
            {count !== undefined && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={active ? { backgroundColor: c + "30" } : { backgroundColor: "#ffffff10" }}
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
