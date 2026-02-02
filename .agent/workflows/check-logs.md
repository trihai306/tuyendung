---
description: Check logs and find bugs in the Recruitment application
---

# Check Logs Workflow

## Step 1: Determine Running Environment

Ask: Is the application running via Docker or locally?

### If Docker:

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose ps
```

### If Local:

// turbo
```bash
# Check if dev servers are running
ps aux | grep -E "artisan serve|vite|npm" | grep -v grep
```

## Step 2: Check Backend Logs

### Laravel Logs (Most Recent)

// turbo
```bash
tail -200 /Users/hainc/duan/app-tts/tuyendung/backend/storage/logs/laravel.log
```

### Docker Backend Logs

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose logs --tail=100 app
```

### Filter by Error Level

// turbo
```bash
grep -E "(ERROR|CRITICAL|Exception)" /Users/hainc/duan/app-tts/tuyendung/backend/storage/logs/laravel.log | tail -50
```

## Step 3: Check Queue Worker Logs

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose logs --tail=100 queue
```

## Step 4: Check Nginx Logs

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose logs --tail=100 nginx
```

## Step 5: Check Zalo Service Logs

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose logs --tail=100 zalo-daemon
```

## Step 6: Check Database Logs

// turbo
```bash
cd /Users/hainc/duan/app-tts/tuyendung && docker compose logs --tail=50 mysql
```

## Step 7: Real-time Log Monitoring

Follow logs in real-time:

```bash
# All services
cd /Users/hainc/duan/app-tts/tuyendung && docker compose logs -f

# Specific service
docker compose logs -f app queue nginx
```

## Common Error Patterns

### 1. Database Connection Error
```
SQLSTATE[HY000] [2002] Connection refused
```
**Fix**: Check MySQL container is running, verify DB_HOST=mysql in .env

### 2. Permission Denied
```
file_put_contents(): Failed to open stream: Permission denied
```
**Fix**: Run `docker compose exec app chown -R www-data:www-data storage`

### 3. Class Not Found
```
Class 'App\Services\XxxService' not found
```
**Fix**: Run `docker compose exec app composer dump-autoload`

### 4. Queue Failed Jobs
```bash
# Check failed jobs
docker compose exec app php artisan queue:failed
```

## Step 8: Report Findings

Summarize:
- Which logs were checked
- Errors found (with timestamps)
- Recommended fixes
