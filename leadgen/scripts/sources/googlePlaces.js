import { logInfo } from "../../utils/logger.js";

const DEFAULT_DETAILS_LIMIT = 8;

async function fetchPlaceDetails(apiKey, placeId) {
  if (!apiKey || !placeId) {
    return {};
  }

  const url = new URL("https://maps.googleapis.com/maps/api/place/details/json");
  url.searchParams.set("place_id", placeId);
  url.searchParams.set(
    "fields",
    "website,formatted_phone_number,international_phone_number,url"
  );
  url.searchParams.set("key", apiKey);

  try {
    const response = await fetch(url.toString());
    const payload = await response.json();
    if (payload?.result) {
      return payload.result;
    }
  } catch {
    return {};
  }

  return {};
}

export async function collectGooglePlaces({ apiKey, region, keywords }) {
  if (!apiKey) {
    logInfo("Google Places key missing, skipping.");
    return [];
  }

  const detailsEnabled = process.env.LEADGEN_GOOGLE_DETAILS !== "false";
  const detailsLimit = Number(
    process.env.LEADGEN_GOOGLE_DETAILS_LIMIT || DEFAULT_DETAILS_LIMIT
  );

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

    for (let index = 0; index < data.results.length; index += 1) {
      const result = data.results[index];
      let details = {};
      if (detailsEnabled && index < detailsLimit) {
        details = await fetchPlaceDetails(apiKey, result.place_id);
      }

      leads.push({
        name: result.name,
        company: result.name,
        email: "",
        phone:
          details.formatted_phone_number ||
          details.international_phone_number ||
          result.formatted_phone_number ||
          "",
        website: details.website || result.website || "",
        budget: "",
        location: result.formatted_address || "",
        goals: "",
        details: [
          result.formatted_address,
          details.url ? `Google profile: ${details.url}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        source: "google-places",
        created_at: new Date().toISOString(),
      });
    }
  }

  return leads;
}
