import { verifySession } from "@/lib/dal";
import { logout } from "@/app/actions/auth";
import { db } from "@/lib/db";
import { getComisionConfig } from "@/lib/comision";
import ComisionForm from "./_components/ComisionForm";
import PrecioPublicacionForm from "./_components/PrecioPublicacionForm";

export default async function AdminDashboard() {
  const session = await verifySession();

  if (session.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <p className="text-gray-500">Acceso denegado</p>
      </div>
    );
  }

  const [empresas, transportistas, cargas, disputas, comision] = await Promise.all([
    db.user.count({ where: { role: "EMPRESA" } }),
    db.user.count({ where: { role: "TRANSPORTISTA" } }),
    db.carga.count(),
    db.carga.count({ where: { estado: "DISPUTA" } }),
    getComisionConfig(),
  ]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#0C1E1E" }}>
      <header
        className="px-6 py-4 flex items-center justify-between border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-bold text-white">ClickCargo</h1>
          <span className="text-xs bg-white/10 text-gray-400 px-2 py-0.5 rounded-full">Admin</span>
        </div>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm cursor-pointer hover:text-gray-400"
            style={{ color: "#6B7280" }}
          >
            Cerrar sesión
          </button>
        </form>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12 space-y-8">
        <div>
          <h2 className="text-xl font-bold text-white mb-4">Panel de Administración</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Empresas", value: empresas, href: null },
              { label: "Transportistas", value: transportistas, href: null },
              { label: "Cargas", value: cargas, href: null },
              { label: "Disputas", value: disputas, href: "/admin/disputas", alert: disputas > 0 },
            ].map(({ label, value, href, alert }) => {
              const card = (
                <div
                  key={label}
                  className="rounded-xl border p-5 text-center"
                  style={{
                    backgroundColor: alert ? "#2D1B3A" : "#112424",
                    borderColor: alert ? "#7C3AED55" : "#1E3838",
                  }}
                >
                  <p className="text-2xl font-bold" style={{ color: alert ? "#C084FC" : "white" }}>{value}</p>
                  <p className="text-xs mt-1" style={{ color: alert ? "#A855F7" : "#6B7280" }}>{label}</p>
                </div>
              );
              return href ? (
                <a key={label} href={href} className="hover:opacity-80 transition-opacity">
                  {card}
                </a>
              ) : (
                <div key={label}>{card}</div>
              );
            })}
          </div>
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
        >
          <h3 className="font-semibold text-white mb-1">Precio de publicación de carga</h3>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            Monto que paga la empresa para publicar una carga.
          </p>
          <PrecioPublicacionForm precioPublicacion={comision.precioPublicacion} />
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
        >
          <h3 className="font-semibold text-white mb-1">Comisión del transportista</h3>
          <p className="text-sm mb-5" style={{ color: "#6B7280" }}>
            Monto que paga el transportista para activar un viaje.
          </p>
          <ComisionForm
            comisionTipo={comision.comisionTipo}
            comisionValor={comision.comisionValor}
          />
        </div>

        <div
          className="rounded-xl border p-6"
          style={{ backgroundColor: "#112424", borderColor: "#1E3838" }}
        >
          <h3 className="font-semibold text-white mb-1">Crear usuario admin</h3>
          <p className="text-sm mb-3" style={{ color: "#6B7280" }}>
            Desde terminal con{" "}
            <code className="text-xs px-1 py-0.5 rounded" style={{ backgroundColor: "#0F2020", color: "#2DD4BF" }}>
              ADMIN_SETUP_SECRET
            </code>{" "}
            configurado en env:
          </p>
          <pre
            className="text-xs rounded-lg p-3 overflow-x-auto"
            style={{ backgroundColor: "#0F2020", color: "#9CA3AF" }}
          >
{`Invoke-RestMethod -Method POST \\
  -Uri "https://tu-app/api/admin/setup" \\
  -Headers @{"Authorization"="Bearer TU_SECRET"} \\
  -ContentType "application/json" \\
  -Body '{"name":"Admin","email":"a@a.com","password":"pass"}'`}
          </pre>
        </div>
      </main>
    </div>
  );
}
