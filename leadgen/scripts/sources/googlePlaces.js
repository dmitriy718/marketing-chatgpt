import { logInfo } from "../../utils/logger.js";

export async function collectGooglePlaces({ apiKey, region, keywords }) {
  if (!apiKey) {
    logInfo("Google Places key missing, skipping.");
    return [];
  }

  const leads = [];
  for (const keyword of keywords) {
    const url = new URL("https://maps.googleapis.com/maps/api/place/textsearch/json");
    url.searchParams.set("query", `${keyword} in ${region}`);
    url.searchParams.set("key", apiKey);

    const response = await fetch(url.toString());
    const data = await response.json();

    if (!data.results) {
      continue;
    }

    for (const result of data.results) {
      leads.push({
        name: result.name,
        company: result.name,
        email: "",
        phone: "",
        website: result.website || "",
        budget: "",
        location: result.formatted_address || "",
        goals: "",
        details: result.formatted_address || "",
        source: "google-places",
        created_at: new Date().toISOString(),
      });
    }
  }

  return leads;
}
