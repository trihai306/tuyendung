# Zalo Service (zca-js)

Standalone Node.js service for Zalo personal account integration using [zca-js](https://tdung.gitbook.io/zca-js).

## ⚠️ Warning

This uses an **unofficial Zalo API**. Using this may violate Zalo's terms of service and could result in your account being disabled.

## Installation

```bash
cd zalo-service
npm install
```

## Running

```bash
# Production
npm start

# Development (with auto-reload)
npm run dev
```

Server runs on port **3001** by default.

## API Endpoints

### Health Check
```bash
GET /health
```

### List Accounts
```bash
GET /api/accounts
```

### QR Login
```bash
POST /api/login

# Response:
{
  "success": true,
  "qrCode": "data:image/png;base64,...",
  "message": "Scan QR code with Zalo app"
}
```

Open the base64 QR in browser, scan with Zalo app, then check `/api/accounts`.

### Cookie Login (for saved accounts)
```bash
POST /api/login-cookie
Content-Type: application/json

{
  "ownId": "123456789"
}
```

### Get Account Info
```bash
GET /api/accounts/:ownId
```

### Get Groups
```bash
GET /api/accounts/:ownId/groups
```

### Get Friends
```bash
GET /api/accounts/:ownId/friends
```

### Send Message
```bash
POST /api/send-message
Content-Type: application/json

{
  "ownId": "123456789",
  "threadId": "user_or_group_id",
  "message": "Hello!",
  "type": "user"  // or "group"
}
```

### Find User by Phone
```bash
POST /api/find-user
Content-Type: application/json

{
  "ownId": "123456789",
  "phone": "0912345678"
}
```

### List Saved Accounts
```bash
GET /api/saved-accounts
```

## Data Storage

- Cookies are saved in `./data/cookies/cred_<ownId>.json`
- QR images are saved in `./data/qr.png`

## Features

- ✅ QR Code login (returns base64 immediately)
- ✅ Cookie login (for persistent sessions)
- ✅ Auto-login saved accounts on startup
- ✅ Get account info
- ✅ Get all groups
- ✅ Get all friends
- ✅ Send messages (to users/groups)
- ✅ Find user by phone
- ✅ Event listeners (message, group_event, reaction)

## Event Listeners

The service automatically listens for:
- `message` - New messages
- `group_event` - Group changes
- `reaction` - Reactions on messages

Events are logged to console. TODO: Forward to webhook.

## Integration with Laravel

This service is designed to work with the Laravel backend:

1. Laravel calls `POST /api/login` → gets QR code
2. User scans QR with Zalo
3. Account is saved with cookies
4. Laravel calls other APIs using `ownId`
5. Events can be forwarded to Laravel webhook

## Docker

Build and run with Docker Compose:

```yaml
zalo:
  build:
    context: ./zalo-service
    dockerfile: Dockerfile
  ports:
    - "3001:3001"
  volumes:
    - ./zalo-service/data:/app/data
```
