import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  const secret = process.env.ADMIN_SETUP_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "No configurado" }, { status: 403 });
  }

  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  let body: { name: string; email: string; password: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Body inválido" }, { status: 400 });
  }

  if (!body.name || !body.email || !body.password) {
    return NextResponse.json({ error: "Faltan campos" }, { status: 400 });
  }

  const hashed = await bcrypt.hash(body.password, 12);

  const user = await db.user.upsert({
    where: { email: body.email },
    create: { name: body.name, email: body.email, password: hashed, role: "ADMIN" },
    update: { role: "ADMIN", password: hashed, name: body.name },
    select: { id: true, email: true, name: true, role: true },
  });

  return NextResponse.json({ ok: true, user });
}
