// SMS via Twilio. No-ops safely until credentials are set, so the app runs
// without it and starts texting the moment you add them.
//
//   TWILIO_ACCOUNT_SID
//   TWILIO_AUTH_TOKEN
//   TWILIO_FROM   — your Twilio phone number, e.g. +15125550100

const SID = process.env.TWILIO_ACCOUNT_SID;
const TOKEN = process.env.TWILIO_AUTH_TOKEN;
const FROM = process.env.TWILIO_FROM;

export function smsEnabled(): boolean {
  return Boolean(SID && TOKEN && FROM);
}

export async function sendSms(to: string, body: string): Promise<boolean> {
  if (!SID || !TOKEN || !FROM || !to) return false;
  try {
    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${SID}/Messages.json`,
      {
        method: "POST",
        headers: {
          authorization: `Basic ${Buffer.from(`${SID}:${TOKEN}`).toString("base64")}`,
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({ To: to, From: FROM, Body: body }).toString(),
      },
    );
    return res.ok;
  } catch {
    return false;
  }
}
