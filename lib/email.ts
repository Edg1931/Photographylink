// Email delivery via Resend. No-ops (safely) until RESEND_API_KEY is set, so
// the app runs without it and starts sending the moment you add the key.
//
//   RESEND_API_KEY  — from resend.com (free tier)
//   RESEND_FROM     — a verified sender, e.g. "Callsheet <alerts@yourdomain.com>"
//   PLATFORM_INBOX  — where the platform ("we're notified") copy goes

const RESEND_KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM || "Callsheet <onboarding@resend.dev>";
export const PLATFORM_INBOX = process.env.PLATFORM_INBOX || "";

export function emailEnabled(): boolean {
  return Boolean(RESEND_KEY);
}

export async function sendEmail(
  to: string,
  subject: string,
  text: string,
): Promise<boolean> {
  if (!RESEND_KEY || !to) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        authorization: `Bearer ${RESEND_KEY}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ from: FROM, to, subject, text }),
    });
    return res.ok;
  } catch {
    return false;
  }
}
