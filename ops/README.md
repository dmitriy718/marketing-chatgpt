# Production Ops (IONOS VPS)

This folder contains production deployment assets for an Ubuntu 22.04 VPS.

## 1) Server prerequisites
- Install Docker and Docker Compose plugin
- Ensure ports 80/443 are open in the VPS firewall

Recommended packages:
```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg

echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo $VERSION_CODENAME) stable" | \
  sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
```

## 2) Deploy the production stack
```bash
sudo mkdir -p /opt/marketing
sudo chown $USER:$USER /opt/marketing
cd /opt/marketing

git clone https://github.com/dmitriy718/marketingagency.git .
cp .env.prod.example .env.prod
```

Update `.env.prod` with real values:
- `APP_URL`, `API_URL`, `NEXT_PUBLIC_SITE_URL`, `CORS_ORIGINS` (`https://carolinagrowth.co`)
- `JWT_SECRET`, `SESSION_SECRET`, Stripe keys, PostHog keys
- `DATABASE_URL` and Postgres creds

Start the stack:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
```

Run migrations and seed:
```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api alembic upgrade head
docker compose -f docker-compose.prod.yml --env-file .env.prod exec api python3 /scripts/seed_data.py
```

## 3) Nginx reverse proxy + SSL
Copy the nginx config:
```bash
sudo cp /opt/marketing/ops/nginx/marketing.conf /etc/nginx/sites-available/marketing.conf
sudo ln -s /etc/nginx/sites-available/marketing.conf /etc/nginx/sites-enabled/marketing.conf
sudo rm -f /etc/nginx/sites-enabled/default
```

Install certbot and request certificates:
```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d carolinagrowth.co
```

Reload nginx:
```bash
sudo nginx -t
sudo systemctl reload nginx
```

## 4) Staging stack (development subdomain)
```bash
cp .env.staging.example .env.staging
docker compose -f docker-compose.staging.yml --env-file .env.staging up -d --build
```

Issue staging SSL:
```bash
sudo certbot --nginx -d development.carolinagrowth.co
```

## 5) Systemd service (optional)
```bash
sudo cp /opt/marketing/ops/systemd/marketing-compose.service /etc/systemd/system/marketing-compose.service
sudo systemctl daemon-reload
sudo systemctl enable marketing-compose.service
sudo systemctl start marketing-compose.service
```

## 6) Backups
```bash
./scripts/db_backup.sh .env.prod ./backups
```

## 7) Decap CMS (GitHub backend)
Decap CMS with the GitHub backend requires an OAuth provider. Options:
- Run a lightweight OAuth service (decap-oauth) on the VPS
- Use an external GitHub OAuth app with a compatible gateway

This repo is configured to use a self-hosted OAuth endpoint:
- `apps/web/public/admin/config.yml` uses `base_url` + `auth_endpoint`.

Create a GitHub OAuth App:
- Homepage URL: `https://carolinagrowth.co`
- Authorization callback URL: `https://development.carolinagrowth.co/auth/callback`

Set in `.env.prod`:
- `GITHUB_CLIENT_ID`
- `GITHUB_CLIENT_SECRET`
- `OAUTH_ORIGIN=https://carolinagrowth.co`

OAuth service is now included via `apps/oauth` and is exposed on `/auth`.
