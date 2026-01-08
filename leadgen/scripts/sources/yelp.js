import { logInfo } from "../../utils/logger.js";

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
      leads.push({
        name: business.name,
        company: business.name,
        email: "",
        phone: business.phone || "",
        website: business.url || "",
        budget: "",
        location: business.location?.display_address?.join(", ") || "",
        goals: "",
        details: business.categories?.map((cat) => cat.title).join(", ") || "",
        source: "yelp",
        created_at: new Date().toISOString(),
      });
    }
  }

  return leads;
}
