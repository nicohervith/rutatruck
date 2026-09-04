/** Estrellas de solo lectura. El input interactivo vive en ResenaForm. */
export default function Estrellas({
  valor,
  size = "sm",
}: {
  valor: number;
  size?: "sm" | "md";
}) {
  const clase = size === "md" ? "w-5 h-5" : "w-3.5 h-3.5";

  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${valor.toFixed(1)} de 5`}>
      {[1, 2, 3, 4, 5].map((n) => (
        <svg
          key={n}
          className={clase}
          viewBox="0 0 20 20"
          fill={n <= Math.round(valor) ? "#F59E0B" : "#E2E8E8"}
          aria-hidden="true"
        >
          <path d="M9.05 2.93c.3-.92 1.6-.92 1.9 0l1.35 4.15h4.36c.97 0 1.37 1.24.59 1.81l-3.53 2.56 1.35 4.15c.3.92-.76 1.69-1.54 1.12L10 14.16l-3.53 2.56c-.78.57-1.84-.2-1.54-1.12l1.35-4.15L2.75 8.9c-.78-.57-.38-1.81.59-1.81h4.36l1.35-4.15z" />
        </svg>
      ))}
    </span>
  );
}
