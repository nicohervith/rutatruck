"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, deleteSession, type Role } from "@/lib/session";

export type FormState = { error?: string } | undefined;

const dashboardByRole: Record<Role, string> = {
  EMPRESA: "/empresa/dashboard",
  TRANSPORTISTA: "/transportista/cargas",
  ADMIN: "/admin/dashboard",
};

export async function signup(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  const role = formData.get("role") as Role;

  if (!name || !email || !password || !role) {
    return { error: "Todos los campos son requeridos" };
  }
  if (!["EMPRESA", "TRANSPORTISTA"].includes(role)) {
    return { error: "Rol inválido" };
  }
  if (password.length < 6) {
    return { error: "La contraseña debe tener al menos 6 caracteres" };
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "Ya existe una cuenta con ese email" };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: { name, email, password: hashedPassword, role },
  });

  await createSession(user.id, user.role as Role);
  redirect(dashboardByRole[user.role as Role]);
}

export async function login(
  _state: FormState,
  formData: FormData
): Promise<FormState> {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { error: "Email y contraseña requeridos" };
  }

  const user = await db.user.findUnique({ where: { email } });
  if (!user) return { error: "Credenciales inválidas" };

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) return { error: "Credenciales inválidas" };

  await createSession(user.id, user.role as Role);
  redirect(dashboardByRole[user.role as Role]);
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
