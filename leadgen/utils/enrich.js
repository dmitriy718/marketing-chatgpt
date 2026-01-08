import { logInfo, logError } from "./logger.js";

function extractDomain(website) {
  if (!website) {
    return null;
  }

  const hasScheme = website.startsWith("http://") || website.startsWith("https://");
  try {
    const url = new URL(hasScheme ? website : `https://${website}`);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return null;
  }
}

async function lookupHunter(domain, apiKey) {
  const url = new URL("https://api.hunter.io/v2/domain-search");
  url.searchParams.set("domain", domain);
  url.searchParams.set("api_key", apiKey);

  const response = await fetch(url.toString());
  if (!response.ok) {
    throw new Error(`Hunter error: ${response.status}`);
  }
  const payload = await response.json();
  return payload?.data?.emails ?? [];
}

function pickBestEmail(emails) {
  if (!Array.isArray(emails) || emails.length === 0) {
    return null;
  }

  const scored = emails
    .filter((item) => Boolean(item?.value))
    .sort((a, b) => (b.confidence ?? 0) - (a.confidence ?? 0));

  const generic = scored.find((item) => item.type === "generic");
  return generic?.value ?? scored[0]?.value ?? null;
}

export async function enrichLead(lead) {
  const apiKey = process.env.HUNTER_API_KEY;
  if (!apiKey || lead.email) {
    return lead;
  }

  const domain = extractDomain(lead.website);
  if (!domain) {
    return lead;
  }

  try {
    const emails = await lookupHunter(domain, apiKey);
    const email = pickBestEmail(emails);
    if (email) {
      return {
        ...lead,
        email,
        notes: `${lead.notes || ""}${lead.notes ? " | " : ""}Enriched via Hunter`,
      };
    }
  } catch (error) {
    logError("Hunter enrichment failed", error);
  }

  logInfo("No email found during enrichment", { domain });
  return lead;
}
