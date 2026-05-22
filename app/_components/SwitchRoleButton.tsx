"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  toRole: "empresa" | "transportista";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function SwitchRoleButton({ toRole, className, style, children }: Props) {
  const router = useRouter();
  const [switching, setSwitching] = useState(false);

  const dest = toRole === "empresa" ? "/empresa/dashboard" : "/transportista/cargas";
  const label = toRole === "empresa" ? "Empresa" : "Transportista";

  function handleClick() {
    setSwitching(true);
    setTimeout(() => {
      router.push(dest);
      setTimeout(() => setSwitching(false), 400);
    }, 700);
  }

  return (
    <>
      <button type="button" onClick={handleClick} className={className} style={style}>
        {children}
      </button>

      {switching && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4 animate-in fade-in duration-200"
          style={{ backgroundColor: "#060F0F" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-2"
            style={{ backgroundColor: toRole === "empresa" ? "#06342A" : "#0C2A4A" }}
          >
            {toRole === "empresa" ? (
              <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
              </svg>
            )}
          </div>
          <p className="text-white text-lg font-bold">Cambiando a {label}</p>
          <p className="text-sm" style={{ color: "#6B7280" }}>Vista de {label.toLowerCase()}</p>
        </div>
      )}
    </>
  );
}
