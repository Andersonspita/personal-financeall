import { logAppError, logAppInfo } from "@/lib/errors";

export function isMailConfigured(): boolean {
  if (process.env.RESEND_API_KEY?.trim()) return true;
  return Boolean(process.env.SMTP_HOST?.trim() && process.env.MAIL_FROM?.trim());
}

export async function sendMail(input: { to: string; subject: string; text: string }): Promise<void> {
  const from = process.env.MAIL_FROM?.trim() || "Bússola Financeira <noreply@localhost>";

  if (process.env.RESEND_API_KEY?.trim()) {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY.trim()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
      }),
    });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Resend recusou o e-mail (${response.status}): ${body.slice(0, 200)}`);
    }
    return;
  }

  if (process.env.SMTP_HOST?.trim()) {
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: process.env.SMTP_SECURE === "true",
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
    });
    return;
  }

  logAppInfo("mail.skipped", { to: input.to, subject: input.subject });
}

export async function sendPasswordResetMail(input: { to: string; resetUrl: string }): Promise<void> {
  try {
    await sendMail({
      to: input.to,
      subject: "Redefinir senha — Bússola Financeira",
      text: [
        "Você pediu para redefinir a senha da Bússola Financeira.",
        "",
        "Abra este link (vale por 1 hora):",
        input.resetUrl,
        "",
        "Se você não pediu isso, pode ignorar este e-mail. Sua senha continua a mesma.",
      ].join("\n"),
    });
  } catch (err) {
    logAppError("mail.password-reset", err, { to: input.to });
    throw err;
  }
}
