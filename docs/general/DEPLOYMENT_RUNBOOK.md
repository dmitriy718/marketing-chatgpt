# Deployment Runbook
## Carolina Growth Platform
## Last Updated: 2026-01-11

This runbook provides step-by-step instructions for deploying the Carolina Growth platform to production and staging environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Pre-Deployment Checklist](#pre-deployment-checklist)
3. [Production Deployment](#production-deployment)
4. [Staging Deployment](#staging-deployment)
5. [Post-Deployment Verification](#post-deployment-verification)
6. [Rollback Procedures](#rollback-procedures)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Access
- SSH access to VPS (74.208.153.193)
- Root or sudo access on VPS
- GitHub repository access
- Docker and Docker Compose installed on VPS

### Required Files
- `.env.prod` file with all environment variables
- `docker-compose.prod.yml` for production
- `docker-compose.staging.yml` for staging
- Nginx configuration files in `ops/nginx/`

### Required Knowledge
- Basic Docker commands
- Git operations
- Nginx configuration
- PostgreSQL database management

## Pre-Deployment Checklist

### 1. Code Review
- [ ] All tests pass locally
- [ ] Code reviewed and approved
- [ ] No breaking changes without migration plan
- [ ] Documentation updated

### 2. Database Migrations
- [ ] All migrations tested locally
- [ ] Migration files present in `apps/api/migrations/versions/`
- [ ] Backup plan for database

### 3. Environment Variables
- [ ] All required variables in `.env.prod`
- [ ] API keys valid and active
- [ ] Database credentials correct
- [ ] Stripe keys configured
- [ ] PostHog keys configured

### 4. Dependencies
- [ ] `package.json` dependencies updated (if needed)
- [ ] `pyproject.toml` dependencies updated (if needed)
- [ ] No breaking dependency changes

## Production Deployment

### Step 1: Connect to VPS
```bash
sshpass -f vpspass.txt ssh -o StrictHostKeyChecking=no root@74.208.153.193
cd /opt/marketing
```

### Step 2: Backup Database
```bash
# Run backup script
./scripts/db_backup.sh .env.prod ./backups

# Verify backup exists
ls -lh ./backups/marketing_*.sql
```

### Step 3: Pull Latest Code
```bash
# Pull from main branch
git pull origin main

# Verify you're on correct branch
git branch
```

### Step 4: Run Database Migrations
```bash
# Enter API container
docker compose -f docker-compose.prod.yml exec api bash

# Run migrations
cd /app
alembic upgrade head

# Exit container
exit
```

### Step 5: Build and Deploy
```bash
# Build all services
docker compose -f docker-compose.prod.yml build

# Stop existing services
docker compose -f docker-compose.prod.yml down

# Start services
docker compose -f docker-compose.prod.yml up -d

# Verify containers are running
docker compose -f docker-compose.prod.yml ps
```

### Step 6: Verify Deployment
```bash
# Check API health
curl https://carolinagrowth.co/health

# Check API detailed health
curl https://carolinagrowth.co/health/detailed

# Check logs for errors
docker compose -f docker-compose.prod.yml logs api --tail 50
docker compose -f docker-compose.prod.yml logs web --tail 50
```

### Step 7: Test Critical Paths
- [ ] Homepage loads
- [ ] API health endpoint responds
- [ ] Login works (if applicable)
- [ ] Key features accessible
- [ ] Forms submit successfully

## Staging Deployment

### Step 1: Connect to VPS
```bash
sshpass -f vpspass.txt ssh -o StrictHostKeyChecking=no root@74.208.153.193
cd /opt/marketing
```

### Step 2: Pull Latest Code
```bash
git pull origin main
```

### Step 3: Build and Deploy Staging
```bash
# Build staging services
docker compose -f docker-compose.staging.yml build web_staging api_staging

# Restart staging services
docker compose -f docker-compose.staging.yml up -d web_staging api_staging

# Verify
docker compose -f docker-compose.staging.yml ps
```

### Step 4: Verify Staging
```bash
# Check staging site
curl https://development.carolinagrowth.co/health

# Check logs
docker compose -f docker-compose.staging.yml logs web_staging --tail 20
```

## Post-Deployment Verification

### Automated Checks
```bash
# Run health checks
curl https://carolinagrowth.co/health
curl https://carolinagrowth.co/health/detailed

# Check all containers
docker compose -f docker-compose.prod.yml ps

# Check resource usage
docker stats --no-stream
```

### Manual Verification Checklist
- [ ] Homepage loads correctly
- [ ] All navigation links work
- [ ] Forms submit successfully
- [ ] API endpoints respond
- [ ] Database connections working
- [ ] Email sending works (test)
- [ ] Stripe webhooks receiving events
- [ ] PostHog tracking working

### Performance Checks
- [ ] Page load times acceptable
- [ ] API response times < 500ms
- [ ] No memory leaks
- [ ] Database queries optimized

## Rollback Procedures

### Quick Rollback (Last Deployment)
```bash
# Stop current services
docker compose -f docker-compose.prod.yml down

# Checkout previous commit
git log --oneline -10  # Find previous commit
git checkout <previous-commit-hash>

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
```

### Database Rollback
```bash
# If migration caused issues, rollback migration
docker compose -f docker-compose.prod.yml exec api bash
cd /app
alembic downgrade -1  # Rollback one migration
exit

# Or restore from backup
./scripts/db_restore.sh backups/marketing_YYYYMMDD_HHMMSS.sql.gz
```

### Full System Rollback
```bash
# Restore database
./scripts/db_restore.sh <backup-file>

# Revert code
git checkout <previous-tag-or-commit>

# Rebuild and restart
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d
```

## Troubleshooting

### Container Won't Start
```bash
# Check logs
docker compose -f docker-compose.prod.yml logs <service-name>

# Check container status
docker compose -f docker-compose.prod.yml ps -a

# Restart specific service
docker compose -f docker-compose.prod.yml restart <service-name>
```

### Database Connection Issues
```bash
# Check database container
docker compose -f docker-compose.prod.yml ps postgres

# Test connection
docker compose -f docker-compose.prod.yml exec api python -c "from marketing_api.db.session import get_session; print('DB OK')"

# Check database logs
docker compose -f docker-compose.prod.yml logs postgres
```

### API Not Responding
```bash
# Check API container
docker compose -f docker-compose.prod.yml logs api --tail 100

# Check if API is listening
docker compose -f docker-compose.prod.yml exec api netstat -tlnp | grep 8001

# Restart API
docker compose -f docker-compose.prod.yml restart api
```

### Web Not Responding
```bash
# Check web container
docker compose -f docker-compose.prod.yml logs web --tail 100

# Check Nginx
sudo nginx -t
sudo systemctl status nginx

# Restart web
docker compose -f docker-compose.prod.yml restart web
```

### Nginx Issues
```bash
# Test configuration
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

### High Memory Usage
```bash
# Check container stats
docker stats

# Restart containers
docker compose -f docker-compose.prod.yml restart

# Check for memory leaks in logs
docker compose -f docker-compose.prod.yml logs | grep -i "memory\|oom"
```

## Emergency Contacts

- **VPS Access**: root@74.208.153.193
- **GitHub Repo**: Check repository for issues
- **Documentation**: See `docs/` directory

## Notes

- Always backup database before deployment
- Test in staging before production
- Monitor logs during and after deployment
- Keep deployment window during low-traffic periods if possible
- Document any issues encountered
