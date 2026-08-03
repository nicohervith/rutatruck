export default function CompletarPerfilBanner({
  phone,
  emailVerified,
}: {
  phone: string | null;
  emailVerified: boolean;
}) {
  const faltantes: string[] = [];
  if (!phone) faltantes.push("Agregá tu número de teléfono");
  if (!emailVerified) faltantes.push("Verificá tu email");

  if (faltantes.length === 0) return null;

  return (
    <div
      className="mb-4 flex items-start gap-3 rounded-2xl border px-4 py-3.5"
      style={{ backgroundColor: "#FFFBEB", borderColor: "#FDE68A" }}
    >
      <span
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: "#FEF3C7" }}
      >
        <svg className="h-5 w-5" fill="none" stroke="#92400E" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M12 9v3.75m0 3.75h.008M10.29 3.86L1.82 18a1.5 1.5 0 001.29 2.25h17.78a1.5 1.5 0 001.29-2.25L13.71 3.86a1.5 1.5 0 00-2.42 0z"
          />
        </svg>
      </span>
      <div className="min-w-0">
        <p className="text-sm font-bold" style={{ color: "#92400E" }}>
          Completá tu perfil
        </p>
        <ul className="mt-1 space-y-0.5">
          {faltantes.map((f) => (
            <li key={f} className="text-xs" style={{ color: "#B45309" }}>
              • {f}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
