"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function NotificacionBell() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    fetch("/api/notificaciones/count")
      .then((r) => r.json())
      .then((d) => setCount(d.count ?? 0))
      .catch(() => {});
  }, []);

  return (
    <Link
      href="/transportista/postulaciones"
      className="relative inline-flex items-center p-1 transition-opacity hover:opacity-80"
      style={{ color: "#C4DCDC" }}
      aria-label="Mis postulaciones"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
        />
      </svg>
      {count > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-gray-900">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </Link>
  );
}
