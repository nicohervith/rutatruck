export const FROM_EMAIL = process.env.RESEND_FROM ?? "ClickCargo <onboarding@resend.dev>";

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const { Resend } = await import("resend");
  if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY no configurada");
  const resend = new Resend(process.env.RESEND_API_KEY);
  return resend.emails.send({
    from: FROM_EMAIL,
    ...options,
  });
}
