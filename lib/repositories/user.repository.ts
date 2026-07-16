import { db } from "@/lib/db";

export async function findUserById(userId: string) {
  return db.user.findUnique({ where: { id: userId }, select: { id: true } });
}

export async function findUserContacto(userId: string) {
  return db.user.findUnique({
    where: { id: userId },
    select: { name: true, email: true, phone: true },
  });
}
