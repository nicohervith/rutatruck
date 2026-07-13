import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getSession } from "@/lib/dal";

const MAX_INTENTOS = 5;

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session?.userId) {
    return NextResponse.json({ error: "No autenticado" }, { status: 401 });
  }

  let body: { code?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  const code = body.code?.trim();
  if (!code) return NextResponse.json({ error: "Código requerido" }, { status: 400 });

  const record = await db.emailVerificationCode.findFirst({
    where: { userId: session.userId },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    return NextResponse.json({ error: "No hay un código pendiente. Solicitá uno nuevo" }, { status: 400 });
  }
  if (record.expiresAt < new Date()) {
    await db.emailVerificationCode.delete({ where: { id: record.id } });
    return NextResponse.json({ error: "El código expiró. Solicitá uno nuevo" }, { status: 400 });
  }
  if (record.attempts >= MAX_INTENTOS) {
    await db.emailVerificationCode.delete({ where: { id: record.id } });
    return NextResponse.json({ error: "Demasiados intentos. Solicitá un código nuevo" }, { status: 400 });
  }

  if (record.code !== code) {
    await db.emailVerificationCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "Código incorrecto" }, { status: 400 });
  }

  await db.$transaction([
    db.user.update({ where: { id: session.userId }, data: { emailVerified: true } }),
    db.emailVerificationCode.delete({ where: { id: record.id } }),
  ]);

  return NextResponse.json({ ok: true });
}
