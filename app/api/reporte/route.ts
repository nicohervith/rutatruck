import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  let body: { nombre: string; email: string; tipo: string; descripcion: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { nombre, email, tipo, descripcion } = body;
  if (!nombre || !email || !tipo || !descripcion) {
    return NextResponse.json({ error: "Completá todos los campos" }, { status: 400 });
  }

  const adminEmail = process.env.ADMIN_EMAIL ?? "nhervith@gmail.com";

  try {
    await sendEmail({
      to: adminEmail,
      subject: `[ClickCargo] Reporte: ${tipo} — ${nombre}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto">
          <h2 style="color:#0A1A1A">Nuevo reporte de problema</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;font-weight:600;color:#6B7280;width:120px">Nombre</td><td style="padding:8px 0">${nombre}</td></tr>
            <tr><td style="padding:8px 0;font-weight:600;color:#6B7280">Email</td><td style="padding:8px 0"><a href="mailto:${email}">${email}</a></td></tr>
            <tr><td style="padding:8px 0;font-weight:600;color:#6B7280">Tipo</td><td style="padding:8px 0">${tipo}</td></tr>
          </table>
          <hr style="margin:16px 0;border:none;border-top:1px solid #E2E8E8"/>
          <p style="font-weight:600;color:#6B7280;margin-bottom:8px">Descripción</p>
          <p style="background:#F9FAFB;border-radius:8px;padding:16px;white-space:pre-wrap">${descripcion.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
      `,
    });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[reporte]", err);
    return NextResponse.json({ error: "Error al enviar el reporte" }, { status: 500 });
  }
}
