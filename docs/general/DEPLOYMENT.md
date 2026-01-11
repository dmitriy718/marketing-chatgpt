# Deployment Guide

## VPS Deployment

### Prerequisites
- SSH access to VPS (74.208.153.193)
- Git repository access
- Docker and Docker Compose installed on VPS

### Deployment Steps

1. **Pull Latest Code**
   ```bash
   ssh <username>@74.208.153.193
   cd /opt/marketing
   git pull origin main
   ```
   **Note**: Use SSH key authentication or password file (never commit passwords to git)

2. **Restart Services**
   ```bash
   docker-compose -f docker-compose.prod.yml restart web api
   ```

3. **Run Migrations** (if needed)
   ```bash
   docker-compose -f docker-compose.prod.yml exec api alembic upgrade head
   ```

4. **Verify Deployment**
   - Check website: https://carolinagrowth.co
   - Check API health: https://carolinagrowth.co/health
   - Review logs: `docker-compose -f docker-compose.prod.yml logs -f`

### Environment Variables

Ensure all required environment variables are set in `.env` file on VPS:
- Database credentials
- Stripe keys
- JWT secrets
- Email settings
- Turnstile keys
- OpenAI API key (for AI features)

### Post-Deployment Checklist

- [ ] Website loads correctly
- [ ] API endpoints respond
- [ ] Database connections work
- [ ] Email sending works
- [ ] Stripe webhooks work
- [ ] All features functional
- [ ] E2E tests pass

## Local Development

### Setup
```bash
docker-compose up -d
```

### Running Tests
```bash
cd apps/web
npm run test:e2e
```

## Troubleshooting

### Services Won't Start
- Check Docker logs
- Verify environment variables
- Check port availability
- Review docker-compose configuration

### Database Issues
- Check database connection string
- Verify migrations ran
- Check database logs

### API Errors
- Check API logs
- Verify environment variables
- Test endpoints directly
