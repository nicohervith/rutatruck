import "server-only";
import { SignJWT, jwtVerify, type JWTPayload } from "jose";
import { cookies } from "next/headers";

export type Role = "EMPRESA" | "TRANSPORTISTA" | "TRANSPORTISTA_FLOTA" | "EMPRESA_TRANSPORTISTA" | "ADMIN";

export interface SessionPayload extends JWTPayload {
  userId: string;
  role: Role;
  esFlota: boolean;
}

const getKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET no configurado");
  return new TextEncoder().encode(secret);
};

export async function encrypt(payload: SessionPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getKey());
}

export async function decrypt(
  session: string | undefined
): Promise<SessionPayload | null> {
  if (!session) return null;
  try {
    const { payload } = await jwtVerify(session, getKey(), {
      algorithms: ["HS256"],
    });
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSession(userId: string, role: Role, esFlota = false) {
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const token = await encrypt({ userId, role, esFlota });
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    expires: expiresAt,
    sameSite: "lax",
    path: "/",
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
