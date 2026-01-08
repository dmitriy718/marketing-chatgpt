import { logInfo } from "../../utils/logger.js";

async function fetchBusinessDetails(apiKey, id) {
  if (!apiKey || !id) {
    return null;
  }

  const response = await fetch(`https://api.yelp.com/v3/businesses/${id}`, {
    headers: { Authorization: `Bearer ${apiKey}` },
  });
  if (!response.ok) {
    return null;
  }
  return response.json();
}

export async function collectYelp({ apiKey, region, keywords }) {
  if (!apiKey) {
    logInfo("Yelp API key missing, skipping.");
    return [];
  }

  const leads = [];
  for (const keyword of keywords) {
    const url = new URL("https://api.yelp.com/v3/businesses/search");
    url.searchParams.set("term", keyword);
    url.searchParams.set("location", region);
    url.searchParams.set("limit", "20");

    const response = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    const data = await response.json();
    if (!data.businesses) {
      continue;
    }

    for (const business of data.businesses) {
      const details = await fetchBusinessDetails(apiKey, business.id);
      const yelpUrl = details?.url || business.url || "";
      leads.push({
        name: business.name,
        company: business.name,
        email: "",
        phone: details?.phone || business.phone || "",
        website: "",
        budget: "",
        location:
          details?.location?.display_address?.join(", ") ||
          business.location?.display_address?.join(", ") ||
          "",
        goals: "",
        details: [
          details?.categories?.map((cat) => cat.title).join(", "),
          yelpUrl ? `Yelp profile: ${yelpUrl}` : null,
        ]
          .filter(Boolean)
          .join("\n"),
        source: "yelp",
        created_at: new Date().toISOString(),
      });
    }
  }

  return leads;
}
