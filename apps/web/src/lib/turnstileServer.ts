import { cookies } from "next/headers";

export async function shouldBypassTurnstile(
  request: Request,
  bodyToken?: string | null
) {
  const internalToken = process.env.INTERNAL_API_TOKEN;
  if (!internalToken) {
    return false;
  }

  const headerToken = request.headers.get("x-internal-token");
  const cookieStore = await cookies();
  const cookieToken = cookieStore.get("cg_internal")?.value ?? null;

  return (
    headerToken === internalToken ||
    cookieToken === internalToken ||
    bodyToken === internalToken
  );
}
