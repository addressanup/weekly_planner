# Deployment Guide

This guide covers deployment options for the Weekly Planner application, from local development to production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Production Deployment](#production-deployment)
6. [Docker Deployment](#docker-deployment)
7. [Security Considerations](#security-considerations)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring and Maintenance](#monitoring-and-maintenance)

---

## Prerequisites

### Required Software

- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **PostgreSQL**: v14 or higher
- **Git**: Latest version

### Optional (for production)

- **Docker**: v24.x or higher (for containerized deployment)
- **Docker Compose**: v2.x or higher
- **Nginx**: Latest version (for reverse proxy)

### System Requirements

**Development:**
- 4GB RAM minimum
- 2GB free disk space

**Production:**
- 8GB RAM minimum
- 10GB free disk space
- 2+ CPU cores

---

## Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/weekly_planner.git
cd weekly_planner
```

### 2. Install Dependencies

```bash
# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Set Up Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
```

Edit `backend/.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/weekly_planner_dev"

# JWT Authentication
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
JWT_EXPIRATION="7d"

# Server
PORT=3000
NODE_ENV=development

# CORS (for development)
CORS_ORIGIN="http://localhost:5173"
```

**Frontend (.env):**
```bash
cd frontend
cp .env.example .env
```

Edit `frontend/.env`:
```env
VITE_API_URL=http://localhost:3000
```

### 4. Set Up Database

```bash
# Start PostgreSQL (if not running)
# macOS with Homebrew:
brew services start postgresql

# Linux:
sudo systemctl start postgresql

# Create database
createdb weekly_planner_dev

# Run migrations
cd backend
npx prisma migrate dev
```

### 5. Run Development Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
# Backend runs on http://localhost:3000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
# Frontend runs on http://localhost:5173
```

### 6. Verify Setup

Open http://localhost:5173 in your browser. You should see:
- ✅ Loading spinner briefly
- ✅ Login/Register modal
- ✅ Ability to register a new account
- ✅ After login, see the weekly planner interface

---

## Environment Configuration

### Backend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - | `postgresql://user:pass@localhost:5432/db` |
| `JWT_SECRET` | Secret key for JWT signing | Yes | - | `super-secret-key-min-32-chars` |
| `JWT_EXPIRATION` | JWT token expiration time | No | `7d` | `7d`, `24h`, `30m` |
| `PORT` | Server port | No | `3000` | `3000` |
| `NODE_ENV` | Environment mode | No | `development` | `development`, `production` |
| `CORS_ORIGIN` | Allowed CORS origins | No | `*` | `http://localhost:5173` |

### Frontend Environment Variables

| Variable | Description | Required | Default | Example |
|----------|-------------|----------|---------|---------|
| `VITE_API_URL` | Backend API base URL | No | `http://localhost:3000` | `https://api.example.com` |

### Generating Secure JWT Secret

```bash
# Generate a secure random key
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Database Setup

### Initial Setup

```bash
cd backend

# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# (Optional) Seed database with sample data
npx prisma db seed
```

### Database Migrations

**Create a new migration:**
```bash
npx prisma migrate dev --name description_of_change
```

**Apply migrations in production:**
```bash
npx prisma migrate deploy
```

**Reset database (development only):**
```bash
npx prisma migrate reset
```

### Database Backup

**Backup:**
```bash
pg_dump weekly_planner_prod > backup_$(date +%Y%m%d_%H%M%S).sql
```

**Restore:**
```bash
psql weekly_planner_prod < backup_20251114_120000.sql
```

---

## Production Deployment

### Option 1: Traditional Server Deployment

#### 1. Server Setup

**Update system packages:**
```bash
sudo apt update && sudo apt upgrade -y
```

**Install Node.js:**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

**Install PostgreSQL:**
```bash
sudo apt install -y postgresql postgresql-contrib
```

**Install Nginx:**
```bash
sudo apt install -y nginx
```

#### 2. Clone and Build

```bash
# Clone repository
cd /var/www
sudo git clone https://github.com/yourusername/weekly_planner.git
cd weekly_planner

# Install dependencies
cd backend && npm ci --production
cd ../frontend && npm ci

# Build frontend
npm run build
```

#### 3. Configure Production Environment

**Backend (.env):**
```env
DATABASE_URL="postgresql://planner_user:secure_password@localhost:5432/weekly_planner_prod"
JWT_SECRET="generated-secret-key-from-crypto-randomBytes"
JWT_EXPIRATION="7d"
PORT=3000
NODE_ENV=production
CORS_ORIGIN="https://yourdomain.com"
```

**Frontend (.env.production):**
```env
VITE_API_URL=https://api.yourdomain.com
```

#### 4. Set Up Database

```bash
sudo -u postgres psql

-- Create database and user
CREATE DATABASE weekly_planner_prod;
CREATE USER planner_user WITH ENCRYPTED PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE weekly_planner_prod TO planner_user;
\q

# Run migrations
cd /var/www/weekly_planner/backend
npx prisma migrate deploy
```

#### 5. Set Up Process Manager (PM2)

```bash
# Install PM2 globally
sudo npm install -g pm2

# Start backend
cd /var/www/weekly_planner/backend
pm2 start npm --name "weekly-planner-api" -- run start:prod

# Save PM2 configuration
pm2 save

# Set up PM2 to start on system boot
pm2 startup systemd
```

#### 6. Configure Nginx

Create `/etc/nginx/sites-available/weekly-planner`:

```nginx
# Frontend
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    root /var/www/weekly_planner/frontend/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json image/svg+xml;
    gzip_min_length 1000;

    # Static files with cache
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
}

# Backend API
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the configuration:
```bash
sudo ln -s /etc/nginx/sites-available/weekly-planner /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 7. Set Up SSL (Let's Encrypt)

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain certificates
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
sudo certbot --nginx -d api.yourdomain.com

# Auto-renewal (certbot sets this up automatically)
sudo systemctl status certbot.timer
```

---

## Docker Deployment

### Docker Compose Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: weekly-planner-db
    environment:
      POSTGRES_DB: weekly_planner_prod
      POSTGRES_USER: planner_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U planner_user"]
      interval: 10s
      timeout: 5s
      retries: 5

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: weekly-planner-api
    environment:
      DATABASE_URL: postgresql://planner_user:${DB_PASSWORD}@postgres:5432/weekly_planner_prod
      JWT_SECRET: ${JWT_SECRET}
      JWT_EXPIRATION: 7d
      PORT: 3000
      NODE_ENV: production
      CORS_ORIGIN: https://yourdomain.com
    ports:
      - "3000:3000"
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
      args:
        VITE_API_URL: https://api.yourdomain.com
    container_name: weekly-planner-web
    ports:
      - "80:80"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  postgres_data:
```

### Backend Dockerfile

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --only=production

COPY . .

RUN npx prisma generate
RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY package*.json ./

EXPOSE 3000

CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
```

### Frontend Dockerfile

Create `frontend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### Frontend nginx.conf

Create `frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### Deploy with Docker Compose

```bash
# Create .env file
cat > .env <<EOF
DB_PASSWORD=secure_database_password
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
EOF

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## Security Considerations

### 1. Environment Variables

- ✅ Never commit `.env` files to version control
- ✅ Use strong, randomly generated JWT secrets (min 32 characters)
- ✅ Rotate JWT secrets periodically
- ✅ Use different secrets for dev/staging/production

### 2. Database Security

- ✅ Use strong database passwords
- ✅ Limit database user permissions
- ✅ Enable PostgreSQL SSL connections in production
- ✅ Regular backups with encryption
- ✅ Keep PostgreSQL updated

### 3. API Security

- ✅ HTTPS only in production (use SSL certificates)
- ✅ Configure CORS properly (specific origins, not `*`)
- ✅ Rate limiting (implement in Nginx or NestJS)
- ✅ Input validation (already implemented with class-validator)
- ✅ SQL injection protection (Prisma provides this)

### 4. Authentication

- ✅ Password hashing with bcrypt (already implemented)
- ✅ Secure password requirements (min 8 chars, complexity)
- ✅ JWT token expiration
- ✅ Logout functionality
- ✅ Consider adding refresh tokens for longer sessions

### 5. Frontend Security

- ✅ Content Security Policy headers
- ✅ XSS protection headers
- ✅ HTTPS enforcement
- ✅ Secure cookie flags (if using cookies)

---

## Performance Optimization

### Backend Optimization

**1. Database Connection Pooling:**

Already configured in Prisma. Adjust in `schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Add connection pooling parameters
  // ?connection_limit=10&pool_timeout=20
}
```

**2. Query Optimization:**

```typescript
// Use select to fetch only needed fields
const tasks = await this.prisma.task.findMany({
  select: {
    id: true,
    title: true,
    category: true,
    // Exclude large fields if not needed
  },
});

// Use indexes on frequently queried fields (already done in schema)
```

**3. Caching:**

Consider adding Redis for caching:

```bash
npm install @nestjs/cache-manager cache-manager
```

### Frontend Optimization

**1. Code Splitting (already configured with Vite)**

Vite automatically splits code by route.

**2. Asset Optimization:**

```bash
# Images
npm install -D vite-imagetools
# Configure in vite.config.ts for automatic image optimization
```

**3. Bundle Analysis:**

```bash
npm run build -- --analyze
```

### Nginx Optimization

Add to nginx configuration:

```nginx
# Compression
gzip on;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Keep-alive
keepalive_timeout 65;

# Cache
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m use_temp_path=off;
```

---

## Monitoring and Maintenance

### Application Monitoring

**PM2 Monitoring:**

```bash
# View status
pm2 status

# View logs
pm2 logs weekly-planner-api

# Monitor resources
pm2 monit
```

**Set Up Application Monitoring:**

Consider using:
- **Sentry** for error tracking
- **New Relic** or **Datadog** for APM
- **Prometheus + Grafana** for metrics

### Database Monitoring

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# View active connections
sudo -u postgres psql -c "SELECT count(*) FROM pg_stat_activity;"

# View slow queries
sudo -u postgres psql -c "SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;"
```

### Log Management

**Backend Logs:**
```bash
# PM2 logs
pm2 logs --lines 100

# System logs
journalctl -u weekly-planner-api -f
```

**Nginx Logs:**
```bash
# Access logs
tail -f /var/log/nginx/access.log

# Error logs
tail -f /var/log/nginx/error.log
```

### Automated Backups

Create `/usr/local/bin/backup-weekly-planner.sh`:

```bash
#!/bin/bash
BACKUP_DIR="/var/backups/weekly-planner"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup database
pg_dump weekly_planner_prod | gzip > $BACKUP_DIR/db_$DATE.sql.gz

# Backup uploads (if any)
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/weekly_planner/uploads

# Keep only last 30 days
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
sudo crontab -e
# Add: 0 2 * * * /usr/local/bin/backup-weekly-planner.sh
```

### Health Checks

**Backend Health Endpoint:**

Already implemented at `GET /` returns `{ message: 'Weekly Planner API' }`

Add to monitoring:
```bash
# Simple health check script
curl -f http://localhost:3000/ || systemctl restart weekly-planner-api
```

---

## Troubleshooting

### Common Issues

**1. Database Connection Failed**

```bash
# Check PostgreSQL is running
sudo systemctl status postgresql

# Check connection string
# Verify DATABASE_URL in .env
# Test connection manually:
psql postgresql://user:pass@localhost:5432/dbname
```

**2. CORS Errors**

- Verify `CORS_ORIGIN` in backend `.env` matches frontend URL
- Check browser console for specific CORS error
- Ensure backend is running and accessible

**3. JWT Token Invalid**

- Verify `JWT_SECRET` hasn't changed
- Check token hasn't expired
- Clear localStorage and log in again

**4. Frontend Build Fails**

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

**5. PM2 Process Crashes**

```bash
# View error logs
pm2 logs weekly-planner-api --err

# Restart process
pm2 restart weekly-planner-api

# Check memory usage
pm2 monit
```

---

## Support and Resources

- **Documentation**: See [README.md](./README.md)
- **API Docs**: See [API_DOCUMENTATION.md](./backend/API_DOCUMENTATION.md)
- **Integration Guide**: See [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)
- **GitHub Issues**: Report bugs and request features

---

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
