"use client";

import { useRouter, usePathname } from "next/navigation";

interface Opcion {
  value: string;
  label: string;
  count?: number;
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
      {opciones.map(({ value, label, count }) => {
        const active = current === value;
        return (
          <button
            key={value}
            onClick={() => select(value)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border transition-colors cursor-pointer"
            style={
              active
                ? { borderColor: "#2DD4BF", color: "#2DD4BF", backgroundColor: "#2DD4BF15" }
                : { borderColor: "#1E3838", color: "#6B7280", backgroundColor: "transparent" }
            }
          >
            {label}
            {count !== undefined && (
              <span
                className="ml-1.5 px-1.5 py-0.5 rounded-full text-xs"
                style={active ? { backgroundColor: "#2DD4BF30" } : { backgroundColor: "#ffffff10" }}
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
