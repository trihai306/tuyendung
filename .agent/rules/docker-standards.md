---
trigger: always_on
glob: "{docker-compose.yml,**/Dockerfile,docker/**/*}"
description: Quy tắc Docker và container configuration cho dự án
---

# Rules: Docker Standards

## 1. Docker Compose Configuration

### Service Naming Convention
```yaml
services:
  app:              # Main PHP-FPM application
  nginx:            # Web server
  mysql:            # Database
  redis:            # Cache/Queue
  soketi:           # WebSocket server
  queue:            # Queue worker
  scheduler:        # Cron scheduler
  frontend:         # React SPA
```

### Container Naming
```yaml
# Pattern: {project}_{service}
container_name: recruitment_app
container_name: recruitment_nginx
container_name: recruitment_mysql
```

### Network Configuration
```yaml
networks:
  recruitment_network:
    driver: bridge

# All services MUST use the network
services:
  app:
    networks:
      - recruitment_network
```

## 2. Dockerfile Best Practices

### Multi-Stage Builds (Frontend)
```dockerfile
# Build stage
FROM node:22-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### PHP Application
```dockerfile
FROM php:8.4-fpm

# Install dependencies in single RUN to reduce layers
RUN apt-get update && apt-get install -y \
    git curl libpng-dev libonig-dev libxml2-dev \
    zip unzip libzip-dev libpq-dev libicu-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd zip intl \
    && rm -rf /var/lib/apt/lists/*

# Copy composer từ official image
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

# Copy composer files trước để cache layers
COPY composer.json composer.lock ./
RUN composer install --no-dev --optimize-autoloader --no-scripts

COPY . .
RUN chown -R www-data:www-data storage bootstrap/cache
```

## 3. Volume Management

### Persistent Data
```yaml
volumes:
  mysql_data:       # Database persistent
  redis_data:       # Cache persistent

services:
  mysql:
    volumes:
      - mysql_data:/var/lib/mysql
```

### Code Mounting (Development)
```yaml
services:
  app:
    volumes:
      - ./backend:/var/www/html
      # Exclude vendor for performance
      - /var/www/html/vendor
```

## 4. Environment Variables

### .env Files
```yaml
services:
  app:
    env_file:
      - ./backend/.env
    environment:
      # Override specific vars
      - APP_ENV=production
      - DB_HOST=mysql
      - REDIS_HOST=redis
```

### Secret Management
```yaml
# KHÔNG commit secrets vào git
# Sử dụng .env.example làm template
# Production: Sử dụng Docker secrets hoặc vault
```

## 5. Health Checks

```yaml
services:
  mysql:
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 3

  app:
    healthcheck:
      test: ["CMD", "php-fpm-healthcheck"]
      interval: 30s
      timeout: 10s
      retries: 3
    depends_on:
      mysql:
        condition: service_healthy
```

## 6. Logging

```yaml
services:
  app:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
```

## 7. Commands Reference

```bash
# Build và start
docker compose up -d --build

# Rebuild specific service
docker compose build app --no-cache
docker compose up -d app

# View logs
docker compose logs -f app
docker compose logs --tail=100 nginx

# Execute commands
docker compose exec app php artisan migrate
docker compose exec app composer install

# Stop và remove
docker compose down
docker compose down -v  # Remove volumes too

# Restart specific service
docker compose restart queue
```

## 8. Checklist

```
[ ] Multi-stage builds cho frontend (giảm image size)
[ ] Single RUN command để giảm layers
[ ] .dockerignore để exclude node_modules, vendor, .git
[ ] Health checks cho critical services
[ ] Proper volume mounts cho persistent data
[ ] Network isolation với bridge network
[ ] Log rotation configuration
[ ] Environment variables không hardcode secrets
```

## 9. .dockerignore Template

```
# Git
.git
.gitignore

# Dependencies
node_modules
vendor

# Build artifacts
dist
build

# IDE
.idea
.vscode

# Logs
*.log
storage/logs/*

# Environment
.env
.env.local
```
