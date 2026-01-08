import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";

import { appendCsv, readLeads, writeLeads } from "../utils/storage.js";
import { dedupeLeads } from "../utils/dedupe.js";
import { logError, logInfo } from "../utils/logger.js";
import { collectGooglePlaces } from "../scripts/sources/googlePlaces.js";
import { collectYelp } from "../scripts/sources/yelp.js";

const app = express();
const port = Number(process.env.PORT || 5050);
const leadsApiUrl = process.env.LEADS_API_URL;
const leadsWebhookUrl = process.env.LEADS_WEBHOOK_URL;
const adminToken = process.env.LEADGEN_ADMIN_TOKEN || "";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.resolve(__dirname, "..", "public");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(publicDir));

function requireAdmin(req, res, next) {
  if (!adminToken) {
    return next();
  }
  const headerToken = req.headers["x-leadgen-token"];
  const queryToken = req.query.token;
  if (headerToken === adminToken || queryToken === adminToken) {
    return next();
  }
  return res.status(401).json({ ok: false, error: "Unauthorized" });
}

function parseCsvRow(line) {
  const result = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result.map((value) => value.trim());
}

function parseCsv(text) {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length);
  if (!lines.length) {
    return [];
  }
  const headers = parseCsvRow(lines[0]).map((value) => value.toLowerCase());
  return lines.slice(1).map((line) => {
    const values = parseCsvRow(line);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = values[idx] ?? "";
    });
    return row;
  });
}

function normalizeLead(raw) {
  const createdAt = raw.created_at || new Date().toISOString();
  const lead = {
    id: raw.id || crypto.randomUUID(),
    name: String(raw.name || raw.full_name || raw.contact || "").trim(),
    email: String(raw.email || "").trim(),
    phone: String(raw.phone || "").trim(),
    company: String(raw.company || raw.business || raw.name || "").trim(),
    website: String(raw.website || "").trim(),
    budget: String(raw.budget || "").trim(),
    location: String(raw.location || raw.city || "").trim(),
    industry: String(raw.industry || raw.vertical || "").trim(),
    goals: String(raw.goals || "").trim(),
    notes: String(raw.notes || raw.details || "").trim(),
    source: String(raw.source || "import").trim(),
    status: String(raw.status || "new").trim(),
    consent: String(raw.consent || "unknown").trim(),
    score: Number(raw.score || 0) || 0,
    created_at: createdAt,
    last_contacted_at: raw.last_contacted_at || null,
    activity: Array.isArray(raw.activity) ? raw.activity : [],
  };
  return scoreLead(lead);
}

function scoreLead(lead) {
  let score = 50;
  if (!lead.website) score += 10;
  if (lead.email) score += 10;
  if (lead.phone) score += 5;
  if (lead.industry) score += 5;
  if (lead.location) score += 5;
  if (lead.source === "google-places" || lead.source === "yelp") score += 5;
  lead.score = Math.max(0, Math.min(100, score));
  return lead;
}

function logActivity(lead, entry) {
  const event = {
    id: crypto.randomUUID(),
    type: entry.type || "note",
    message: entry.message || "",
    created_at: new Date().toISOString(),
  };
  lead.activity = Array.isArray(lead.activity) ? lead.activity : [];
  lead.activity.unshift(event);
}

function buildDetails(body) {
  const parts = [
    body.phone ? `Phone: ${body.phone}` : null,
    body.website ? `Website: ${body.website}` : null,
    body.location ? `Location: ${body.location}` : null,
    body.goals ? `Goals: ${body.goals}` : null,
  ].filter(Boolean);
  return parts.join("\n");
}

async function notifyEmail(lead) {
  if (!process.env.SMTP_HOST || !process.env.ALERT_EMAIL) {
    return;
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: process.env.ALERT_EMAIL,
    subject: `New lead: ${lead.company}`,
    text: [
      `Name: ${lead.name}`,
      `Email: ${lead.email}`,
      `Company: ${lead.company}`,
      `Budget: ${lead.budget}`,
      `Source: ${lead.source}`,
      "",
      lead.details,
    ].join("\n"),
  });
}

async function forwardLead(lead) {
  if (leadsApiUrl) {
    try {
      const response = await fetch(leadsApiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: lead.name,
          email: lead.email,
          company: lead.company,
          budget: lead.budget,
          details: lead.details,
          source: lead.source,
        }),
      });
      if (!response.ok) {
        logError("Failed to forward to API", await response.text());
      }
    } catch (error) {
      logError("API forward failed", error);
    }
  }

  if (leadsWebhookUrl) {
    try {
      const response = await fetch(leadsWebhookUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(process.env.LEADS_WEBHOOK_TOKEN
            ? { Authorization: `Bearer ${process.env.LEADS_WEBHOOK_TOKEN}` }
            : {}),
        },
        body: JSON.stringify(lead),
      });
      if (!response.ok) {
        logError("Failed to forward to webhook", await response.text());
      }
    } catch (error) {
      logError("Webhook forward failed", error);
    }
  }
}

app.post("/lead", async (req, res) => {
  const body = req.body || {};
  const lead = normalizeLead({
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    phone: String(body.phone || "").trim(),
    company: String(body.company || "").trim(),
    website: String(body.website || "").trim(),
    budget: String(body.budget || "").trim(),
    location: String(body.location || "").trim(),
    goals: String(body.goals || "").trim(),
    details: buildDetails(body),
    notes: buildDetails(body),
    source: "leadgen-landing",
    consent: "opt-in",
  });

  if (!lead.name || !lead.email || !lead.company) {
    return res.status(400).send("Missing required fields.");
  }

  try {
    const leads = (await readLeads()).map(normalizeLead);
    leads.push(lead);
    const deduped = dedupeLeads(leads.map(normalizeLead));
    await writeLeads(deduped);
    await appendCsv(lead);
    await notifyEmail(lead);
    await forwardLead(lead);
    logInfo("Lead captured", { company: lead.company });
  } catch (error) {
    logError("Failed to capture lead", error);
  }

  return res.redirect("/thank-you.html");
});

app.get("/health", (req, res) => {
  res.json({ ok: true });
});

app.get("/api/leads", requireAdmin, async (req, res) => {
  const leads = (await readLeads()).map(normalizeLead);
  res.json({ ok: true, leads });
});

app.post("/api/leads/import", requireAdmin, async (req, res) => {
  const { csv, leads } = req.body || {};
  const imported = [];
  if (csv) {
    const rows = parseCsv(String(csv));
    rows.forEach((row) => imported.push(normalizeLead(row)));
  }
  if (Array.isArray(leads)) {
    leads.forEach((row) => imported.push(normalizeLead(row)));
  }
  if (!imported.length) {
    return res.status(400).json({ ok: false, error: "No leads to import." });
  }

  const existing = (await readLeads()).map(normalizeLead);
  const merged = dedupeLeads([...existing, ...imported]);
  await writeLeads(merged);
  for (const lead of imported) {
    await appendCsv(lead);
  }
  return res.json({ ok: true, imported: imported.length, total: merged.length });
});

app.patch("/api/leads/:id", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const updates = req.body || {};
  const leads = (await readLeads()).map(normalizeLead);
  const lead = leads.find((item) => item.id === id);
  if (!lead) {
    return res.status(404).json({ ok: false, error: "Lead not found." });
  }

  Object.assign(lead, {
    status: updates.status ?? lead.status,
    consent: updates.consent ?? lead.consent,
    notes: updates.notes ?? lead.notes,
    industry: updates.industry ?? lead.industry,
    budget: updates.budget ?? lead.budget,
    location: updates.location ?? lead.location,
  });
  scoreLead(lead);
  if (updates.activity) {
    logActivity(lead, updates.activity);
  }

  await writeLeads(leads);
  res.json({ ok: true, lead });
});

app.post("/api/leads/:id/email", requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { subject, body } = req.body || {};

  if (!subject || !body) {
    return res.status(400).json({ ok: false, error: "Subject and body are required." });
  }

  const leads = (await readLeads()).map(normalizeLead);
  const lead = leads.find((item) => item.id === id);
  if (!lead || !lead.email) {
    return res.status(404).json({ ok: false, error: "Lead email not found." });
  }

  if (lead.consent !== "opt-in") {
    return res.status(400).json({ ok: false, error: "Lead is not marked as opt-in." });
  }

  if (!process.env.SMTP_HOST) {
    return res.status(500).json({ ok: false, error: "SMTP not configured." });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false,
    auth: process.env.SMTP_USER
      ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD }
      : undefined,
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: lead.email,
    subject,
    text: body,
  });

  lead.last_contacted_at = new Date().toISOString();
  lead.status = "contacted";
  logActivity(lead, { type: "email", message: subject });
  await writeLeads(leads);

  res.json({ ok: true });
});

app.post("/api/collect", requireAdmin, async (req, res) => {
  const { region, keywords } = req.body || {};
  const targetRegion = String(region || process.env.LEADGEN_REGION || "South Carolina");
  const keywordList = Array.isArray(keywords)
    ? keywords
    : String(keywords || process.env.LEADGEN_KEYWORDS || "marketing")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);

  const [google, yelp] = await Promise.all([
    collectGooglePlaces({
      apiKey: process.env.GOOGLE_PLACES_API_KEY,
      region: targetRegion,
      keywords: keywordList,
    }),
    collectYelp({
      apiKey: process.env.YELP_API_KEY,
      region: targetRegion,
      keywords: keywordList,
    }),
  ]);

  const collected = [...google, ...yelp].map((lead) =>
    normalizeLead({
      ...lead,
      status: "new",
      consent: "unknown",
      source: lead.source || "collector",
    })
  );

  const existing = (await readLeads()).map(normalizeLead);
  const merged = dedupeLeads([...existing, ...collected]);
  await writeLeads(merged);
  for (const lead of collected) {
    await appendCsv(lead);
  }

  res.json({ ok: true, collected: collected.length, total: merged.length });
});

app.listen(port, () => {
  logInfo(`Leadgen running on ${port}`);
});
