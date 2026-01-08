import "dotenv/config";

import { readLeads, writeLeads, appendCsv } from "../utils/storage.js";
import { dedupeLeads } from "../utils/dedupe.js";
import { logInfo, logError } from "../utils/logger.js";
import { collectGooglePlaces } from "./sources/googlePlaces.js";
import { collectYelp } from "./sources/yelp.js";
import { collectDirectories } from "./sources/directories.js";
import { enrichLead } from "../utils/enrich.js";

const region = process.env.LEADGEN_REGION || "South Carolina";
const keywords = (process.env.LEADGEN_KEYWORDS || "marketing")
  .split(",")
  .map((item) => item.trim())
  .filter(Boolean);

async function forwardLead(lead) {
  if (!process.env.LEADS_API_URL) {
    return;
  }

  if (!lead.email) {
    logInfo("Skipping CRM forward (missing email)", {
      company: lead.company || lead.name,
      source: lead.source,
    });
    return;
  }

  try {
    const response = await fetch(process.env.LEADS_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: lead.name,
        email: lead.email,
        company: lead.company || lead.name,
        budget: lead.budget,
        details: lead.details,
        source: lead.source,
      }),
    });

    if (!response.ok) {
      logError("Collector API forward failed", await response.text());
    }
  } catch (error) {
    logError("Collector API forward error", error);
  }
}

async function run() {
  logInfo("Starting collector", { region, keywords });

  const [google, yelp, directories] = await Promise.all([
    collectGooglePlaces({
      apiKey: process.env.GOOGLE_PLACES_API_KEY,
      region,
      keywords,
    }),
    collectYelp({
      apiKey: process.env.YELP_API_KEY,
      region,
      keywords,
    }),
    collectDirectories(),
  ]);

  const leads = [...google, ...yelp, ...directories];
  if (!leads.length) {
    logInfo("No leads collected.");
    return;
  }

  const enrichedLeads = [];
  for (const lead of leads) {
    enrichedLeads.push(await enrichLead(lead));
  }

  const existing = await readLeads();
  const merged = dedupeLeads([...existing, ...enrichedLeads]);
  await writeLeads(merged);

  for (const lead of enrichedLeads) {
    await appendCsv(lead);
    await forwardLead(lead);
  }

  logInfo("Collector finished", { leads: leads.length });
}

run().catch((error) => logError("Collector failed", error));
