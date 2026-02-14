# Deployment Guide - Indian Culture App

This guide provides comprehensive instructions for deploying the Indian Culture App in production environments.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Configuration](#environment-configuration)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Deployment](#frontend-deployment)
5. [Database Setup](#database-setup)
6. [Docker Deployment](#docker-deployment)
7. [Cloud Deployment Options](#cloud-deployment-options)
8. [Post-Deployment Verification](#post-deployment-verification)
9. [Troubleshooting](#troubleshooting)

## Prerequisites

### System Requirements

- **Node.js**: 18.x or higher
- **PostgreSQL**: 15.x or higher
- **Docker**: 20.x or higher (for containerized deployment)
- **Docker Compose**: 2.x or higher
- **Memory**: Minimum 2GB RAM (4GB recommended)
- **Storage**: Minimum 10GB available disk space

### Required Accounts (Optional)

- AWS account (if using S3 for image storage)
- Cloudinary account (alternative to S3)
- Domain name and SSL certificate (for production)

## Environment Configuration

### 1. Create Production Environment File

Copy the example environment file:

```bash
cp .env.production.example .env.production
```

### 2. Configure Environment Variables

Edit `.env.production` with your production values:

```bash
# Database Configuration
DB_HOST=postgres
DB_PORT=5432
DB_NAME=indian_culture_prod
DB_USER=indian_culture_user
DB_PASSWORD=<STRONG_PASSWORD_HERE>

# Backend Configuration
NODE_ENV=production
PORT=3000
CORS_ORIGIN=https://yourdomain.com

# Cache Configuration
CACHE_TTL=900

# Image Storage Configuration
IMAGE_STORAGE_PROVIDER=s3  # or 'cloudinary' or 'local'
IMAGE_BASE_URL=https://cdn.yourdomain.com

# AWS S3 Configuration (if using S3)
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=<YOUR_ACCESS_KEY>
AWS_SECRET_ACCESS_KEY=<YOUR_SECRET_KEY>
S3_BUCKET_NAME=indian-culture-images-prod

# Frontend Configuration
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
FRONTEND_PORT=80
```

### 3. Security Considerations

- **Never commit** `.env.production` to version control
- Use **strong passwords** for database credentials
- Rotate credentials regularly
- Use **environment-specific** API keys
- Enable **SSL/TLS** for all production traffic

## Backend Deployment

### Option 1: Docker Deployment (Recommended)

See [Docker Deployment](#docker-deployment) section below.

### Option 2: Manual Deployment

#### Step 1: Install Dependencies

```bash
cd backend
npm ci --only=production
```

#### Step 2: Build Application

```bash
npm run build
```

#### Step 3: Set Environment Variables

```bash
export NODE_ENV=production
export PORT=3000
export DB_HOST=your-db-host
export DB_PORT=5432
export DB_NAME=indian_culture_prod
export DB_USER=your-db-user
export DB_PASSWORD=your-db-password
export CORS_ORIGIN=https://yourdomain.com
```

#### Step 4: Run Database Migrations

```bash
npm run db:init
```

#### Step 5: Seed Database (First Time Only)

```bash
npm run db:seed
```

#### Step 6: Start Application

```bash
npm start
```

#### Step 7: Use Process Manager (Recommended)

Install PM2:

```bash
npm install -g pm2
```

Start with PM2:

```bash
pm2 start dist/index.js --name indian-culture-backend
pm2 save
pm2 startup
```

## Frontend Deployment

### Option 1: Docker Deployment (Recommended)

See [Docker Deployment](#docker-deployment) section below.

### Option 2: Manual Deployment

#### Step 1: Install Dependencies

```bash
cd frontend
npm ci --only=production
```

#### Step 2: Configure Build Environment

Create `.env.production`:

```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_NODE_ENV=production
VITE_ENABLE_DEVTOOLS=false
```

#### Step 3: Build Application

```bash
npm run build
```

#### Step 4: Deploy to Web Server

**Using Nginx:**

1. Copy build files:
```bash
sudo cp -r dist/* /var/www/indian-culture-app/
```

2. Configure Nginx:
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/indian-culture-app;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA routing
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

3. Restart Nginx:
```bash
sudo systemctl restart nginx
```

**Using Apache:**

1. Copy build files:
```bash
sudo cp -r dist/* /var/www/html/indian-culture-app/
```

2. Create `.htaccess`:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

## Database Setup

### Initial Setup

#### 1. Create Database

```sql
CREATE DATABASE indian_culture_prod;
CREATE USER indian_culture_user WITH ENCRYPTED PASSWORD 'your_strong_password';
GRANT ALL PRIVILEGES ON DATABASE indian_culture_prod TO indian_culture_user;
```

#### 2. Run Migrations

Migrations are automatically run when using Docker. For manual setup:

```bash
cd backend
psql -h localhost -U indian_culture_user -d indian_culture_prod -f migrations/001_create_languages_table.sql
psql -h localhost -U indian_culture_user -d indian_culture_prod -f migrations/002_create_cities_table.sql
psql -h localhost -U indian_culture_user -d indian_culture_prod -f migrations/003_create_heritage_items_table.sql
psql -h localhost -U indian_culture_user -d indian_culture_prod -f migrations/004_create_translations_table.sql
psql -h localhost -U indian_culture_user -d indian_culture_prod -f migrations/005_create_images_table.sql
psql -h localhost -U indian_culture_user -d indian_culture_prod -f migrations/006_enhance_images_table.sql
```

Or use the migration script:

```bash
npm run db:init
```

#### 3. Seed Database

```bash
cd backend
npm run db:seed
```

### Database Backup

#### Create Backup

```bash
pg_dump -h localhost -U indian_culture_user -d indian_culture_prod -F c -f backup_$(date +%Y%m%d_%H%M%S).dump
```

#### Restore Backup

```bash
pg_restore -h localhost -U indian_culture_user -d indian_culture_prod -c backup_20240213_120000.dump
```

### Database Maintenance

#### Vacuum Database

```bash
psql -h localhost -U indian_culture_user -d indian_culture_prod -c "VACUUM ANALYZE;"
```

#### Reindex Database

```bash
psql -h localhost -U indian_culture_user -d indian_culture_prod -c "REINDEX DATABASE indian_culture_prod;"
```

## Docker Deployment

### Development Environment

#### 1. Start All Services

```bash
docker-compose up -d
```

#### 2. View Logs

```bash
docker-compose logs -f
```

#### 3. Stop Services

```bash
docker-compose down
```

### Production Environment

#### 1. Build Images

```bash
docker-compose -f docker-compose.prod.yml build
```

#### 2. Start Services

```bash
docker-compose -f docker-compose.prod.yml up -d
```

#### 3. Check Service Health

```bash
docker-compose -f docker-compose.prod.yml ps
```

#### 4. View Logs

```bash
docker-compose -f docker-compose.prod.yml logs -f backend
docker-compose -f docker-compose.prod.yml logs -f frontend
```

#### 5. Scale Services (if needed)

```bash
docker-compose -f docker-compose.prod.yml up -d --scale backend=3
```

### Docker Commands Reference

```bash
# Rebuild specific service
docker-compose build backend

# Restart specific service
docker-compose restart backend

# Execute command in container
docker-compose exec backend npm run db:seed

# View container stats
docker stats

# Clean up unused resources
docker system prune -a
```

## Cloud Deployment Options

### AWS Deployment

#### Using ECS (Elastic Container Service)

1. **Push Images to ECR:**
```bash
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag indian-culture-backend:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/indian-culture-backend:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/indian-culture-backend:latest
```

2. **Create ECS Task Definition**
3. **Create ECS Service**
4. **Configure Load Balancer**
5. **Set up RDS for PostgreSQL**

#### Using EC2

1. **Launch EC2 Instance** (t3.medium or larger)
2. **Install Docker and Docker Compose**
3. **Clone Repository**
4. **Configure Environment Variables**
5. **Run Docker Compose**

### Google Cloud Platform

#### Using Cloud Run

1. **Build and Push Images:**
```bash
gcloud builds submit --tag gcr.io/PROJECT_ID/indian-culture-backend
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy indian-culture-backend \
  --image gcr.io/PROJECT_ID/indian-culture-backend \
  --platform managed \
  --region us-central1
```

3. **Set up Cloud SQL for PostgreSQL**

### Azure Deployment

#### Using Azure Container Instances

1. **Create Container Registry**
2. **Push Images**
3. **Create Container Group**
4. **Set up Azure Database for PostgreSQL**

### DigitalOcean

#### Using App Platform

1. **Connect GitHub Repository**
2. **Configure Build Settings**
3. **Add Database Component**
4. **Deploy**

## Post-Deployment Verification

### 1. Health Checks

#### Backend Health Check

```bash
curl https://api.yourdomain.com/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-02-13T12:00:00.000Z",
  "database": {
    "connected": true,
    "pool": {
      "total": 10,
      "idle": 8,
      "waiting": 0
    }
  }
}
```

#### Frontend Health Check

```bash
curl https://yourdomain.com/health
```

Expected response:
```
healthy
```

### 2. API Endpoint Tests

#### Test Cities Endpoint

```bash
curl https://api.yourdomain.com/api/v1/cities?language=en
```

#### Test Heritage Endpoint

```bash
curl https://api.yourdomain.com/api/v1/cities/{cityId}/heritage?language=en
```

#### Test Languages Endpoint

```bash
curl https://api.yourdomain.com/api/v1/languages
```

### 3. Performance Tests

#### Load Testing with Apache Bench

```bash
ab -n 1000 -c 10 https://api.yourdomain.com/api/v1/cities?language=en
```

#### Load Testing with wrk

```bash
wrk -t12 -c400 -d30s https://api.yourdomain.com/api/v1/cities?language=en
```

### 4. Monitoring Setup

#### Application Monitoring

- Set up application performance monitoring (APM)
- Configure error tracking (e.g., Sentry)
- Set up log aggregation (e.g., ELK stack, CloudWatch)

#### Infrastructure Monitoring

- Monitor CPU, memory, disk usage
- Set up alerts for service failures
- Monitor database performance

## Troubleshooting

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for detailed troubleshooting guide.

### Quick Fixes

#### Backend Not Starting

1. Check environment variables
2. Verify database connection
3. Check logs: `docker-compose logs backend`
4. Verify port availability

#### Frontend Not Loading

1. Check API URL configuration
2. Verify CORS settings
3. Check nginx configuration
4. Clear browser cache

#### Database Connection Issues

1. Verify database credentials
2. Check network connectivity
3. Verify database is running
4. Check firewall rules

#### Performance Issues

1. Check database query performance
2. Verify cache is working
3. Check CDN configuration
4. Monitor resource usage

## Security Checklist

- [ ] SSL/TLS certificates installed
- [ ] Environment variables secured
- [ ] Database credentials rotated
- [ ] CORS properly configured
- [ ] Security headers enabled
- [ ] Rate limiting configured
- [ ] Firewall rules configured
- [ ] Regular security updates applied
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting configured

## Maintenance

### Regular Tasks

- **Daily**: Monitor logs and metrics
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Disaster recovery test

### Update Procedure

1. Test updates in staging environment
2. Create database backup
3. Deploy updates during low-traffic period
4. Monitor for issues
5. Rollback if necessary

## Support

For deployment issues or questions:
- Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md)
- Review application logs
- Contact development team
