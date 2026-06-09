import { getSession } from "@/lib/dal";
import { db } from "@/lib/db";
import Link from "next/link";
import ReporteForm from "./_components/ReporteForm";

export default async function ReportePage({
  searchParams,
}: {
  searchParams: Promise<{ back?: string }>;
}) {
  const [session, { back }] = await Promise.all([getSession(), searchParams]);

  let defaultEmail = "";
  if (session) {
    const user = await db.user.findUnique({ where: { id: session.userId }, select: { email: true } });
    defaultEmail = user?.email ?? "";
  }

  const backHref = back ?? (session ? `/${session.role === "EMPRESA" || session.role === "EMPRESA_TRANSPORTISTA" ? "empresa" : "transportista"}/dashboard` : "/");

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F2F5F5" }}>
      <header
        className="px-5 py-4 flex items-center gap-3 border-b"
        style={{ backgroundColor: "#0A1A1A", borderColor: "#1E3838" }}
      >
        <Link
          href={backHref}
          className="flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: "#C4DCDC" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          Volver
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-5 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-black text-gray-900 mb-2">Reportar un problema</h1>
          <p className="text-sm" style={{ color: "#6B7280" }}>
            Completá el formulario y te responderemos a la brevedad.
          </p>
        </div>

        <div
          className="rounded-2xl border p-6"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E2E8E8" }}
        >
          <ReporteForm defaultEmail={defaultEmail} backHref={backHref} />
        </div>
      </main>
    </div>
  );
}
