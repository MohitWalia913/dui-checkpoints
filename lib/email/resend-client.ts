const RESEND_API_URL = "https://api.resend.com/emails";

export function getResendFromEmail(): string {
  return (
    process.env.RESEND_FROM_EMAIL?.trim() ||
    "DUI Checkpoints Locator <noreply@californiaduicheckpoints.com>"
  );
}

export function parseAdminEmails(): string[] {
  const raw =
    process.env.CHECKPOINT_REPORT_ADMIN_EMAILS?.trim() ||
    process.env.CHECKPOINT_REPORT_ADMIN_EMAIL?.trim() ||
    "info@webds.com,mohit@webds.com";

  const emails = raw
    .split(/[,;]/)
    .map((e) => e.trim())
    .filter(Boolean);

  return emails.length > 0 ? emails : ["mohit@webds.com"];
}

export async function sendResendEmail(params: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  replyTo?: string;
}): Promise<{ sent: boolean; error: string | null }> {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) {
    return { sent: false, error: "RESEND_API_KEY is not set" };
  }

  const to = Array.isArray(params.to) ? params.to : [params.to];

  try {
    const response = await fetch(RESEND_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getResendFromEmail(),
        to,
        subject: params.subject,
        html: params.html,
        text: params.text,
        reply_to: params.replyTo,
      }),
    });

    const json = (await response.json().catch(() => ({}))) as {
      message?: string;
    };

    if (!response.ok) {
      return {
        sent: false,
        error: json.message ?? `Resend API error (${response.status})`,
      };
    }

    return { sent: true, error: null };
  } catch (err) {
    return {
      sent: false,
      error: err instanceof Error ? err.message : "Failed to send email",
    };
  }
}
