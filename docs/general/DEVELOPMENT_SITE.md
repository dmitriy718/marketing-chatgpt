# Development Site Information

## URL
**https://development.carolinagrowth.co**

## Access Credentials

### Basic Auth (Nginx)
- **Username**: `admin`
- **Password**: `Admin7188!`

This is required to access the development site. The site is protected with HTTP Basic Authentication.

### Admin/CRM Login
- **Email**: `admin@carolinagrowth.co`
- **Password**: `Admin7188!`

Use these credentials to log into:
- CRM Dashboard (`/crm`)
- Client Portal (`/portal`)
- Any admin features

## Navigation Differences

### Development Site (development.carolinagrowth.co)
- Uses **SiteHeaderDev** component
- Features:
  - Accent border (2px) and shadow
  - "DEV" badge indicator next to logo
  - Rounded buttons (rounded-lg) instead of rounded-full
  - Hover backgrounds on navigation items
  - Different visual styling for experimentation

### Production Site (carolinagrowth.co)
- Uses **SiteHeader** component
- Standard production navigation styling

## Important Notes

⚠️ **DO NOT CONFUSE THE TWO NAVIGATIONS**
- Development site navigation is in `apps/web/src/components/SiteHeaderDev.tsx`
- Production site navigation is in `apps/web/src/components/SiteHeader.tsx`
- The `HeaderSelector` component automatically chooses the correct header based on domain
- Always test navigation changes on the dev site first before deploying to production

## Deployment

The development site uses the staging Docker Compose configuration:
```bash
docker compose -f docker-compose.staging.yml up -d web_staging
```

The site runs on port 3002 internally and is proxied by Nginx to development.carolinagrowth.co

## Current Status

✅ **Development server is running the latest code**
- All new features (Backlink Analyzer, A/B Testing, Keyword Research) are deployed
- API and Web containers are up to date
- Environment variables (OpenAI, PostHog) are configured

## Quick Commands

### Update Development Server
```bash
# SSH to VPS
ssh root@74.208.153.193

# Navigate to project
cd /opt/marketing

# Pull latest code
git pull origin main

# Rebuild and restart staging containers
docker compose -f docker-compose.staging.yml build api_staging web_staging
docker compose -f docker-compose.staging.yml up -d api_staging web_staging
```

### Check Container Status
```bash
docker compose -f docker-compose.staging.yml ps
```

### View Logs
```bash
# API logs
docker compose -f docker-compose.staging.yml logs -f api_staging

# Web logs
docker compose -f docker-compose.staging.yml logs -f web_staging
```

## Last Updated
2026-01-13
