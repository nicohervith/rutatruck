import { formatPromedio } from "@/lib/resenas";

/**
 * Promedio público de un usuario. Solo cuenta reseñas ya publicadas (ver el
 * doble ciego en `lib/services/resena.service.ts`), por eso puede quedar en
 * "Sin calificaciones" aunque el viaje ya se haya calificado.
 */
export default function RatingChip({
  promedio,
  cantidad,
  size = "sm",
}: {
  promedio: number | null;
  cantidad: number;
  size?: "sm" | "md";
}) {
  const valor = cantidad > 0 ? formatPromedio(promedio) : null;
  const texto = size === "md" ? "text-sm" : "text-xs";

  if (!valor) {
    return (
      <span
        className={`${texto} font-medium px-2 py-0.5 rounded-full`}
        style={{ backgroundColor: "#F3F4F6", color: "#9CA3AF" }}
      >
        Sin calificaciones
      </span>
    );
  }

  return (
    <span
      className={`${texto} font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1`}
      style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
      title={`${valor} de 5 en ${cantidad} ${cantidad === 1 ? "calificación" : "calificaciones"}`}
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#F59E0B" aria-hidden="true">
        <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.35 4.15h4.36c.97 0 1.37 1.24.59 1.81l-3.53 2.56 1.35 4.15c.3.92-.76 1.69-1.54 1.12L10 14.16l-3.53 2.56c-.78.57-1.84-.2-1.54-1.12l1.35-4.15L2.75 8.9c-.78-.57-.38-1.81.59-1.81h4.36l1.35-4.15z" />
      </svg>
      {valor}
      <span className="font-normal opacity-75">({cantidad})</span>
    </span>
  );
}
