import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/resend";

export async function POST(req: NextRequest) {
  let body: { email?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const email = body.email?.trim().toLowerCase();
  if (!email) return NextResponse.json({ error: "Email requerido" }, { status: 400 });

  // Always return ok — no revelar si el email existe
  const user = await db.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ ok: true });

  // Borrar tokens anteriores del mismo email
  await db.passwordResetToken.deleteMany({ where: { email } });

  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hora

  await db.passwordResetToken.create({ data: { email, token, expiresAt } });

  const baseUrl = process.env.NEXTAUTH_URL?.replace(/\/$/, "") ?? "";
  const resetUrl = `${baseUrl}/nueva-contrasena?token=${token}`;

  await sendEmail({
    to: email,
    subject: "Recuperar contraseña — ClickCargo",
    html: `
      <!DOCTYPE html>
      <html>
      <body style="margin:0;padding:0;background:#0C1E1E;font-family:sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#0C1E1E;padding:40px 20px;">
          <tr><td align="center">
            <table width="100%" style="max-width:480px;background:#112424;border-radius:16px;border:1px solid #1E3838;padding:40px;">
              <tr><td>
                <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#fff;">
                  <span style="color:#2DD4BF;">CLICK</span>CARGO
                </p>
                <p style="margin:0 0 28px;font-size:11px;letter-spacing:2px;color:#2DD4BF;opacity:.7;text-transform:uppercase;">
                  Red integral de cargas
                </p>
                <h2 style="margin:0 0 12px;font-size:18px;color:#fff;font-weight:600;">Recuperar contraseña</h2>
                <p style="margin:0 0 28px;font-size:14px;color:#9CA3AF;line-height:1.6;">
                  Recibimos una solicitud para restablecer la contraseña de tu cuenta. Hacé clic en el botón para crear una nueva contraseña. Este enlace vence en <strong style="color:#fff;">1 hora</strong>.
                </p>
                <a href="${resetUrl}"
                   style="display:inline-block;background:#2DD4BF;color:#0C1E1E;font-weight:700;font-size:14px;padding:14px 32px;border-radius:10px;text-decoration:none;">
                  Restablecer contraseña
                </a>
                <p style="margin:28px 0 0;font-size:12px;color:#4B5563;line-height:1.5;">
                  Si no solicitaste esto, ignorá este email. Tu contraseña no cambiará.<br><br>
                  O copiá este enlace en tu navegador:<br>
                  <span style="color:#2DD4BF;word-break:break-all;">${resetUrl}</span>
                </p>
              </td></tr>
            </table>
          </td></tr>
        </table>
      </body>
      </html>
    `,
  });

  return NextResponse.json({ ok: true });
}
