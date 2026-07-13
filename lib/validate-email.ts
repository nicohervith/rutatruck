import { resolveMx } from "node:dns/promises";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function isValidEmail(email: string): Promise<boolean> {
  if (!EMAIL_REGEX.test(email)) return false;

  const domain = email.split("@")[1];
  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    return false;
  }
}
