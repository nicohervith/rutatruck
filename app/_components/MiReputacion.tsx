import {
  findRatingsDeUsuarios,
  findResenasPublicadasDe,
} from "@/lib/repositories/resena.repository";
import { criteriosDe, formatPromedio, type CriterioKey, type TipoResena } from "@/lib/resenas";
import Estrellas from "@/app/_components/Estrellas";
import Link from "next/link";

/** Reputación propia: promedio publicado y últimas reseñas recibidas. */
export default async function MiReputacion({ userId }: { userId: string }) {
  const [ratings, resenas] = await Promise.all([
    findRatingsDeUsuarios([userId]),
    findResenasPublicadasDe(userId, 5),
  ]);

  const rating = ratings[0];
  if (!rating) return null;

  const promedio = formatPromedio(rating.ratingPromedio);

  return (
    <div
      className="rounded-2xl border p-5 mb-6"
      style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
    >
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <h2 className="font-semibold text-gray-900">Mi reputación</h2>
        <Link
          href={`/perfil/${userId}`}
          className="text-sm font-semibold hover:opacity-80"
          style={{ color: "var(--primary)" }}
        >
          Ver mi perfil público
        </Link>
      </div>

      {rating.ratingCantidad === 0 || !promedio ? (
        <p className="text-sm" style={{ color: "#6B7280" }}>
          Todavía no tenés calificaciones publicadas. Se publican cuando ambas partes califican el
          viaje.
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-gray-900">{promedio}</span>
            <Estrellas valor={rating.ratingPromedio ?? 0} />
            <span className="text-sm" style={{ color: "#6B7280" }}>
              {rating.ratingCantidad} {rating.ratingCantidad === 1 ? "calificación" : "calificaciones"}
            </span>
          </div>

          <div className="mt-4 space-y-3">
            {resenas.map((r) => (
              <div
                key={r.id}
                className="rounded-xl border p-3"
                style={{ backgroundColor: "#FAFAFA", borderColor: "#E2E8E8" }}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="text-sm font-medium text-gray-900">{r.autor.name}</span>
                  <Estrellas valor={r.promedio} />
                </div>
                <p className="text-xs mt-0.5" style={{ color: "#9CA3AF" }}>
                  {r.carga.titulo}
                  {r.publicadaEn ? ` · ${r.publicadaEn.toLocaleDateString("es-AR")}` : ""}
                </p>
                <div className="mt-2 space-y-0.5">
                  {criteriosDe(r.tipo as TipoResena).map((c) => {
                    const valor = r[c.key as CriterioKey];
                    if (valor == null) return null;
                    return (
                      <div key={c.key} className="flex items-center justify-between gap-2">
                        <span className="text-xs" style={{ color: "#6B7280" }}>
                          {c.label}
                        </span>
                        <Estrellas valor={valor} />
                      </div>
                    );
                  })}
                </div>
                {r.comentario && (
                  <p className="text-sm mt-2 italic" style={{ color: "#374151" }}>
                    “{r.comentario}”
                  </p>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
