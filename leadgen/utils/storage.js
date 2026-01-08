import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "data");
const jsonPath = path.join(dataDir, "leads.json");
const csvPath = path.join(dataDir, "leads.csv");
const csvHeader =
  "created_at,id,name,email,phone,company,website,budget,location,industry,source,status,consent,score,goals,notes\n";

export async function ensureStorage() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(jsonPath);
  } catch {
    await fs.writeFile(jsonPath, "[]", "utf8");
  }
  try {
    await fs.access(csvPath);
  } catch {
    await fs.writeFile(csvPath, csvHeader, "utf8");
  }
}

export async function readLeads() {
  await ensureStorage();
  const raw = await fs.readFile(jsonPath, "utf8");
  return JSON.parse(raw);
}

export async function writeLeads(leads) {
  await ensureStorage();
  await fs.writeFile(jsonPath, JSON.stringify(leads, null, 2), "utf8");
}

export async function appendCsv(lead) {
  await ensureStorage();
  const line = [
    lead.created_at,
    lead.id,
    lead.name,
    lead.email,
    lead.phone,
    lead.company,
    lead.website,
    lead.budget,
    lead.location,
    lead.industry,
    lead.source,
    lead.status,
    lead.consent,
    lead.score,
    lead.goals,
    lead.notes,
  ]
    .map((value) => `"${String(value ?? "").replaceAll('"', '""')}"`)
    .join(",");
  await fs.appendFile(csvPath, `${line}\n`, "utf8");
}
