import "dotenv/config";
import express from "express";
import nodemailer from "nodemailer";

import { appendCsv, readLeads, writeLeads } from "../utils/storage.js";
import { dedupeLeads } from "../utils/dedupe.js";
import { logError, logInfo } from "../utils/logger.js";

const app = express();
const port = Number(process.env.PORT || 5050);
const leadsApiUrl = process.env.LEADS_API_URL;
const leadsWebhookUrl = process.env.LEADS_WEBHOOK_URL;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static("public"));

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
  const lead = {
    name: String(body.name || "").trim(),
    email: String(body.email || "").trim(),
    phone: String(body.phone || "").trim(),
    company: String(body.company || "").trim(),
    website: String(body.website || "").trim(),
    budget: String(body.budget || "").trim(),
    location: String(body.location || "").trim(),
    goals: String(body.goals || "").trim(),
    details: buildDetails(body),
    source: "leadgen-landing",
    created_at: new Date().toISOString(),
  };

  if (!lead.name || !lead.email || !lead.company) {
    return res.status(400).send("Missing required fields.");
  }

  try {
    const leads = await readLeads();
    leads.push(lead);
    const deduped = dedupeLeads(leads);
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

app.listen(port, () => {
  logInfo(`Leadgen running on ${port}`);
});
