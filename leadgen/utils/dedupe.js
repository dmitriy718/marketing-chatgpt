export function buildKey(lead) {
  const parts = [
    lead.company?.toLowerCase() ?? "",
    lead.website?.toLowerCase() ?? "",
    lead.phone?.toLowerCase() ?? "",
  ];
  return parts.join("|");
}

export function dedupeLeads(leads) {
  const seen = new Set();
  return leads.filter((lead) => {
    const key = buildKey(lead);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}
