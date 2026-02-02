---
description: Build and run Docker containers for the Recruitment project
---

# Docker Build Workflow

## Prerequisites Check

// turbo
```bash
# Check Docker is running
docker info > /dev/null 2>&1 && echo "Docker is running" || echo "Docker is not running"
```

## Step 1: Build All Services

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose build --no-cache
```

## Step 2: Start All Containers

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose up -d
```

## Step 3: Check Container Status

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose ps
```

## Step 4: Run Database Migrations

```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose exec app php artisan migrate
```

## Step 5: Verify Services

Check each service is running:

// turbo
```bash
# Backend API
curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/api/health || echo "Backend not ready"
```

// turbo
```bash
# Frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "Frontend not ready"
```

## Step 6: View Logs if Issues

```bash
# All logs
cd /Users/hainc/duan/app-tts/tuyendung && docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f nginx
docker compose logs -f mysql
```

## Quick Commands Reference

| Action | Command |
|--------|---------|
| Start all | `docker compose up -d` |
| Stop all | `docker compose down` |
| Rebuild single | `docker compose build app --no-cache` |
| Restart single | `docker compose restart queue` |
| View logs | `docker compose logs -f app` |
| Shell into container | `docker compose exec app bash` |
| Clear with volumes | `docker compose down -v` |

## Common Issues

### Container won't start
```bash
# Check detailed logs
docker compose logs app

# Check if port is already in use
lsof -i :8000
lsof -i :3000
```

### Database connection error
```bash
# Ensure MySQL is ready
docker compose exec mysql mysqladmin ping -h localhost
```

### Permission issues
```bash
# Fix Laravel storage permissions
docker compose exec app chown -R www-data:www-data storage bootstrap/cache
```
