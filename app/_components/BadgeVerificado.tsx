/**
 * Insignia de cuenta verificada. Hoy la única verificación activa es la del
 * email; cuando se sume la de DNI/documentación hay que cambiar el criterio
 * acá y en las queries que traen `emailVerified`.
 */
export default function BadgeVerificado({ verificado }: { verificado: boolean }) {
  if (!verificado) return null;

  return (
    <span
      className="text-xs font-semibold px-2 py-0.5 rounded-full inline-flex items-center gap-1"
      style={{ backgroundColor: "#DCFCE7", color: "#15803D", border: "1px solid #BBF7D0" }}
      title="Verificó su email para poder postularse"
    >
      <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path
          fillRule="evenodd"
          d="M10 1.5l2.09 1.4 2.5-.28 1.02 2.3 2.3 1.02-.28 2.5L19.03 10l-1.4 2.09.28 2.5-2.3 1.02-1.02 2.3-2.5-.28L10 18.5l-2.09-1.4-2.5.28-1.02-2.3-2.3-1.02.28-2.5L.97 10l1.4-2.09-.28-2.5 2.3-1.02 1.02-2.3 2.5.28L10 1.5zm3.36 6.16a.75.75 0 00-1.16-.95l-2.9 3.54-1.5-1.5a.75.75 0 10-1.06 1.06l2.09 2.09a.75.75 0 001.14-.06l3.39-4.18z"
          clipRule="evenodd"
        />
      </svg>
      Cuenta verificada
    </span>
  );
}
