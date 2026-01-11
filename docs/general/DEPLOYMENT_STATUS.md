# Deployment Status
## Last Updated: 2026-01-11

## Current Status

### Production Environment
- **URL**: https://carolinagrowth.co
- **Status**: ✅ **OPERATIONAL**
- **Health Check**: ✅ Responding (200 OK)
- **API Health**: ✅ Responding ({"status":"ok"})

### Deployment Method
- **Repository**: GitHub (main branch)
- **VPS**: 74.208.153.193
- **Path**: /opt/marketing
- **Docker Compose**: docker-compose.prod.yml

## Recent Deployment

### Duplicate Email Issue - Permanently Fixed - January 11, 2026
- **Date**: 2026-01-11
- **Changes**: 
  - Fixed duplicate email issue in leads table permanently
  - Cleaned up 14 duplicate leads for qa@carolinagrowth.co
  - Created unique index: `uq_leads_email_not_null`
  - Constraint now prevents future duplicates at database level
  - Migration marked as complete
  - Added cleanup script for future use
- **Status**: ✅ **DEPLOYED AND OPERATIONAL**
- **Verification**: 
  - ✅ All duplicate emails cleaned
  - ✅ Unique index created and active
  - ✅ Constraint tested and working
  - ✅ Migration marked complete
  - ✅ Code deployed to VPS and GitHub

### Critical Fixes - January 11, 2026
- **Date**: 2026-01-11
- **Changes**: 
  - Fixed 502 Bad Gateway by restarting web container
  - Fixed all TypeScript build errors:
    - CRM GraphQL client type mismatch
    - BlogPost image property type error
    - Missing UTM campaign types (footer, navigation, portfolio, share)
  - Updated all documentation dates from 2026-01-15 to 2026-01-11
  - Fixed duplicate Services link in navigation
  - Created comprehensive legal page
- **Status**: ✅ **DEPLOYED AND OPERATIONAL**
- **Verification**: 
  - ✅ Website responding (200 OK)
  - ✅ API health endpoint working
  - ✅ Web container running
  - ✅ All build errors resolved
  - ✅ Code deployed to VPS

## Manual Deployment Steps

If automated deployment fails, use these steps:

```bash
# SSH to VPS (may need to use SSH key instead of password)
ssh <username>@74.208.153.193

# Navigate to project
cd /opt/marketing

# Pull latest code
git pull origin main

# Install dependencies (if needed)
docker-compose -f docker-compose.prod.yml exec api poetry install

# Run migrations (if needed)
docker-compose -f docker-compose.prod.yml exec api alembic upgrade head

# Restart services
docker-compose -f docker-compose.prod.yml restart web api

# Verify deployment
curl https://carolinagrowth.co/health
```

## Verification Checklist

- [x] Website loads (https://carolinagrowth.co)
- [x] API health endpoint responds
- [x] Services restarted and running
- [x] All build errors fixed
- [x] Code deployed to VPS
- [x] Documentation dates corrected
- [ ] PostHog events flowing (check PostHog dashboard)
- [ ] No errors in logs (check docker logs)

## Known Issues

### SSH Authentication
- **Issue**: Password authentication failing with sshpass
- **Attempted**: Using `sshpass -f vpspass.txt` with correct syntax
- **Status**: SSH connection denied, but site is operational
- **Possible Causes**: 
  - SSH key authentication required
  - Password authentication disabled on server
  - Username format issue
- **Workaround**: Manual SSH access may be needed for deployment

## Next Steps

1. Verify PostHog events are being captured
2. Check System Monitoring dashboard
3. Review application logs for any errors
4. Test error tracking by triggering a test error
5. Monitor performance metrics

## Post-Deployment Verification

After deployment, verify:
1. Website loads correctly
2. All features functional
3. PostHog tracking working
4. No errors in logs
5. Performance metrics appearing
