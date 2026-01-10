import { promises as fs } from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, "..", "data");
const jsonPath = path.join(dataDir, "leads.json");
const csvPath = path.join(dataDir, "leads.csv");
const outboxPath = path.join(dataDir, "outbox.json");
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
  try {
    await fs.access(outboxPath);
  } catch {
    await fs.writeFile(outboxPath, "[]", "utf8");
  }
}

async function acquireOutboxLock() {
  const lockPath = `${outboxPath}.lock`;
  const maxAttempts = 40;
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    try {
      return await fs.open(lockPath, "wx");
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(200, 25 + attempt * 10))
      );
    }
  }
  throw new Error("Outbox lock timeout.");
}

async function withOutboxLock(work) {
  await ensureStorage();
  const lockPath = `${outboxPath}.lock`;
  const handle = await acquireOutboxLock();
  try {
    return await work();
  } finally {
    await handle.close();
    await fs.unlink(lockPath).catch(() => null);
  }
}

async function readOutboxUnlocked() {
  await ensureStorage();
  const raw = await fs.readFile(outboxPath, "utf8");
  return JSON.parse(raw);
}

async function writeOutboxUnlocked(entries) {
  await ensureStorage();
  await fs.writeFile(outboxPath, JSON.stringify(entries, null, 2), "utf8");
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

export async function readOutbox() {
  return withOutboxLock(async () => readOutboxUnlocked());
}

export async function writeOutbox(entries) {
  await withOutboxLock(async () => writeOutboxUnlocked(entries));
}

export async function appendOutbox(entry) {
  await withOutboxLock(async () => {
    const current = await readOutboxUnlocked();
    current.push(entry);
    await writeOutboxUnlocked(current);
  });
}

export async function updateOutbox(mutator) {
  return withOutboxLock(async () => {
    const current = await readOutboxUnlocked();
    const next = await mutator(current);
    await writeOutboxUnlocked(next);
    return next;
  });
}
