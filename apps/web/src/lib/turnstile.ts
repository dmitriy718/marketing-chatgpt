const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export async function verifyTurnstileToken(token: string | null | undefined) {
  const secret = process.env.TURNSTILE_SECRET_KEY;

  if (!secret) {
    return true;
  }

  if (!token) {
    return false;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const payload = (await response.json().catch(() => null)) as
      | { success?: boolean }
      | null;
    return Boolean(payload?.success);
  } catch {
    return false;
  }
}
