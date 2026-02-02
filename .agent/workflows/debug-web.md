---
description: Debug web issues - find bugs, check logs, fix UI/UX problems
---

# Debug Web Workflow

## Step 1: Identify the Issue

1. Ask user to describe the bug/issue
2. Get the URL or page where the issue occurs
3. Determine if it's: UI, API, or functional issue

## Step 2: Navigate to Page

// turbo
```bash
# Start dev server if not running
cd /Users/hainc/duan/app-tts/tuyendung/frontend && npm run dev
```

Use browser_subagent to navigate to the problematic page:
- URL: http://localhost:5173
- Take screenshot to see current state

## Step 3: Check Browser Console

1. Use browser DevTools to check:
   - JavaScript errors in Console
   - Network requests that failed (red items)
   - API response status codes

## Step 4: Check Backend Logs

// turbo
```bash
# Check Laravel logs
tail -100 /Users/hainc/duan/app-tts/tuyendung/backend/storage/logs/laravel.log
```

// turbo
```bash
# Check Docker logs if running in container
docker compose -f /Users/hainc/duan/app-tts/tuyendung/docker-compose.yml logs --tail=100 app
```

## Step 5: Reproduce the Bug

1. Follow user's steps to reproduce
2. Capture screenshot at each step
3. Document exact behavior

## Step 6: Fix and Verify

1. Identify root cause from logs/errors
2. Make the fix
3. Refresh browser and test again
4. Capture screenshot to confirm fix

## Step 7: Summary

Return:
- What was wrong
- What was fixed
- Screenshot proof of fix
