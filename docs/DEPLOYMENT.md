# Needled Deployment Guide

Production deployment for needled.app using Docker Compose with nginx-proxy.

## Architecture

- **Web/API**: Next.js application (container: `needled-app`)
- **Database**: PostgreSQL 15 (container: `needled-db`)
- **Proxy**: nginx-proxy (external, shared across sites)
- **SSL**: Let's Encrypt via acme-companion

## Prerequisites

1. Server with Docker and Docker Compose installed
2. nginx-proxy network running (shared proxy for multiple sites)
3. Domain DNS pointing to your server: `needled.app`

## Initial Server Setup

### 1. Create the Docker Network

```bash
docker network create needled-network
```

### 2. Create Project Directory

```bash
mkdir -p /opt/docker/needled
cd /opt/docker/needled
```

### 3. Clone Repository

```bash
git clone https://github.com/your-org/needled.git .
```

### 4. Create Environment File

```bash
cp .env.example .env
```

Edit `.env` with production values:

```bash
nano .env
```

Required variables:
- `DB_PASSWORD` - Strong database password
- `SENDGRID_API_KEY` - Your SendGrid API key
- `SENDGRID_FROM_EMAIL` - Verified sender email
- `UNSUBSCRIBE_SECRET` - Generate with `openssl rand -hex 32`
- `CRON_SECRET` - Generate with `openssl rand -hex 32`

### 5. Start Infrastructure (Database)

```bash
docker-compose -f docker-compose.infrastructure.yml up -d
```

Verify database is running:
```bash
docker logs needled-db
```

### 6. Build and Start Application

```bash
docker-compose -f docker-compose.app.yml up -d --build
```

### 7. Run Database Migrations

```bash
docker-compose -f docker-compose.app.yml exec app npx prisma migrate deploy
```

### 8. Verify Deployment

```bash
# Check container status
docker ps | grep needled

# Check application logs
docker logs needled-app

# Test endpoint
curl -I https://needled.app
```

## Updating the Application

### Code-Only Updates (No Schema Changes)

For updates that don't change the database schema:

```bash
cd /opt/docker/needled

# Pull latest code
git pull origin main

# Rebuild and restart the app
docker-compose -f docker-compose.app.yml up -d --build --force-recreate

# Verify
docker logs -f needled-app
```

### Updates with Database Schema Changes

For updates that include Prisma schema changes:

```bash
cd /opt/docker/needled

# Pull latest code
git pull origin main

# Rebuild the app
docker-compose -f docker-compose.app.yml up -d --build --force-recreate

# Run migrations
docker-compose -f docker-compose.app.yml exec app npx prisma migrate deploy

# Verify
docker logs -f needled-app
```

**Note**: Schema migrations are typically safe and additive. For destructive changes (dropping columns/tables), review the migration files first.

## Useful Commands

### View Logs

```bash
# Application logs
docker logs -f needled-app

# Database logs
docker logs -f needled-db
```

### Access Database

```bash
# Via Docker
docker exec -it needled-db psql -U needled -d needled

# Via external client (port 5467)
psql -h localhost -p 5467 -U needled -d needled
```

### Restart Services

```bash
# Restart app only
docker-compose -f docker-compose.app.yml restart

# Restart everything
docker-compose -f docker-compose.infrastructure.yml restart
docker-compose -f docker-compose.app.yml restart
```

### Stop Services

```bash
# Stop app (keeps database running)
docker-compose -f docker-compose.app.yml down

# Stop everything
docker-compose -f docker-compose.app.yml down
docker-compose -f docker-compose.infrastructure.yml down
```

## Backup and Restore

### Database Backup

```bash
# Create backup
docker exec needled-db pg_dump -U needled needled > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backup (add to cron)
0 2 * * * docker exec needled-db pg_dump -U needled needled > /opt/backups/needled/backup_$(date +\%Y\%m\%d).sql
```

### Database Restore

```bash
# Restore from backup
cat backup.sql | docker exec -i needled-db psql -U needled -d needled
```

## Cron Jobs (Notification System)

The app has a notification cron endpoint that should be called periodically. Set up a cron job on the server:

```bash
# Edit crontab
crontab -e

# Add this line (runs every 15 minutes)
*/15 * * * * curl -s -H "Authorization: Bearer YOUR_CRON_SECRET" https://needled.app/api/cron/notifications > /dev/null 2>&1
```

Replace `YOUR_CRON_SECRET` with the value from your `.env` file.

## Troubleshooting

### App Won't Start

```bash
# Check logs
docker logs needled-app

# Common issues:
# - Database not ready: wait for needled-db to be healthy
# - Missing env vars: verify .env file
# - Port conflict: ensure port 3000 is available internally
```

### Database Connection Failed

```bash
# Verify database is running
docker ps | grep needled-db

# Check network connectivity
docker network inspect needled-network

# Test connection from app container
docker exec needled-app nc -zv needled-db 5432
```

### SSL Certificate Issues

```bash
# Check nginx-proxy logs
docker logs nginx-proxy

# Check acme-companion logs
docker logs acme-companion

# Verify DNS is pointing to server
dig needled.app
```

### Migration Failed

```bash
# Check migration status
docker-compose -f docker-compose.app.yml exec app npx prisma migrate status

# View migration history
docker-compose -f docker-compose.app.yml exec app npx prisma migrate diff --help
```

## Environment Variables Reference

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DB_PASSWORD` | Yes | - | PostgreSQL password |
| `SENDGRID_API_KEY` | Yes | - | SendGrid API key for emails |
| `SENDGRID_FROM_EMAIL` | No | hello@needled.app | Sender email address |
| `NEXT_PUBLIC_APP_URL` | No | https://needled.app | Public app URL |
| `UNSUBSCRIBE_SECRET` | Yes | - | Secret for unsubscribe token generation |
| `CRON_SECRET` | Yes | - | Bearer token for cron endpoint auth |
| `PROD_DOMAIN` | No | needled.app | Domain for nginx-proxy |
| `LETSENCRYPT_EMAIL` | No | admin@needled.app | Email for Let's Encrypt notifications |
