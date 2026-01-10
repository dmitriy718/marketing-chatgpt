export function getInternalLeadHeaders(): Record<string, string> | null {
  if (typeof window === "undefined") {
    return null;
  }

  const token = (window as Window & { __internalApiToken?: string }).__internalApiToken;
  if (!token) {
    return null;
  }

  return { "x-internal-token": token };
}
