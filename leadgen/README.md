# Carolina Growth Leadgen

Lead generation micro-app that includes:
- A landing page + form
- Outbound collection scripts for public sources
- Local lead storage + optional routing to the main API and email alerts

## Setup
```bash
cd leadgen
cp .env.example .env
npm install
npm run dev
```
Open `http://localhost:5050`.

## Landing Form
The form sends to the existing public intake endpoint:
- `LEADS_API_URL` (default `https://carolinagrowth.co/public/leads`)

It also stores leads locally in `leadgen/data/leads.json` and `leadgen/data/leads.csv`.

## Outbound Collector
Configure API keys in `.env` and run:
```bash
npm run collect
```

The collector uses official APIs when available. If you add new sources, ensure you respect
terms of service and robots.txt.

## Environment
- `LEADS_API_URL`: main API intake endpoint
- `LEADS_API_TOKEN`: optional bearer for webhook routing
- `LEADS_WEBHOOK_URL`: optional CRM webhook
- `SMTP_*`: email alert configuration
- `GOOGLE_PLACES_API_KEY`, `YELP_API_KEY`: outbound collection
