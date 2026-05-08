import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  let body: { token?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const { token, password } = body;
  if (!token || !password) {
    return NextResponse.json({ error: "Datos incompletos" }, { status: 400 });
  }
  if (password.length < 6) {
    return NextResponse.json({ error: "La contraseña debe tener al menos 6 caracteres" }, { status: 400 });
  }

  const resetToken = await db.passwordResetToken.findUnique({ where: { token } });
  if (!resetToken) {
    return NextResponse.json({ error: "El enlace no es válido o ya fue utilizado" }, { status: 400 });
  }
  if (resetToken.expiresAt < new Date()) {
    await db.passwordResetToken.delete({ where: { token } });
    return NextResponse.json({ error: "El enlace expiró. Solicitá uno nuevo" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(password, 10);

  await db.$transaction([
    db.user.update({ where: { email: resetToken.email }, data: { password: hashed } }),
    db.passwordResetToken.delete({ where: { token } }),
  ]);

  return NextResponse.json({ ok: true });
}
