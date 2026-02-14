# Quick Start Deployment Guide

Get the Indian Culture App running in production in under 30 minutes.

## Prerequisites

- Docker and Docker Compose installed
- Domain name (optional, for production)
- 2GB RAM minimum
- 10GB disk space

## 5-Minute Local Deployment

### Step 1: Clone and Configure

```bash
# Clone repository
git clone <repository-url>
cd indian-culture-app

# Copy environment files
cp .env.production.example .env.production
```

### Step 2: Edit Configuration

Edit `.env.production`:

```bash
# Minimum required changes
DB_PASSWORD=your_secure_password_here
CORS_ORIGIN=http://localhost
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Step 3: Start Services

```bash
# Build and start all services
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be healthy (30-60 seconds)
docker-compose -f docker-compose.prod.yml ps
```

### Step 4: Verify

```bash
# Check backend health
curl http://localhost:3000/health

# Check frontend
curl http://localhost/health

# Test API
curl http://localhost:3000/api/v1/cities?language=en
```

### Step 5: Access Application

Open browser: `http://localhost`

## 15-Minute Production Deployment

### Option A: AWS EC2

#### 1. Launch EC2 Instance

```bash
# Instance type: t3.medium or larger
# OS: Ubuntu 22.04 LTS
# Security groups: Allow ports 80, 443, 22
```

#### 2. Connect and Install Docker

```bash
ssh -i your-key.pem ubuntu@your-instance-ip

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again
exit
ssh -i your-key.pem ubuntu@your-instance-ip
```

#### 3. Deploy Application

```bash
# Clone repository
git clone <repository-url>
cd indian-culture-app

# Configure environment
cp .env.production.example .env.production
nano .env.production

# Update these values:
# DB_PASSWORD=strong_password
# CORS_ORIGIN=https://yourdomain.com
# VITE_API_BASE_URL=https://yourdomain.com/api/v1
# IMAGE_STORAGE_PROVIDER=s3
# AWS credentials (if using S3)

# Start services
docker-compose -f docker-compose.prod.yml up -d
```

#### 4. Configure Domain (Optional)

```bash
# Point your domain to EC2 instance IP
# Update CORS_ORIGIN and VITE_API_BASE_URL with your domain

# Install Nginx for SSL
sudo apt update
sudo apt install nginx certbot python3-certbot-nginx

# Configure Nginx
sudo nano /etc/nginx/sites-available/indian-culture-app

# Add configuration:
server {
    listen 80;
    server_name yourdomain.com;

    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:80/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/indian-culture-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Get SSL certificate
sudo certbot --nginx -d yourdomain.com
```

### Option B: DigitalOcean Droplet

#### 1. Create Droplet

```bash
# Size: 2GB RAM / 1 CPU minimum
# OS: Ubuntu 22.04 LTS
# Add SSH key
```

#### 2. Follow Same Steps as AWS EC2

Same as AWS EC2 steps 2-4 above.

### Option C: Google Cloud Run

#### 1. Install gcloud CLI

```bash
# Follow: https://cloud.google.com/sdk/docs/install
```

#### 2. Build and Push Images

```bash
# Authenticate
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Build backend
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/indian-culture-backend

# Build frontend
cd ../frontend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/indian-culture-frontend
```

#### 3. Deploy Services

```bash
# Deploy backend
gcloud run deploy indian-culture-backend \
  --image gcr.io/YOUR_PROJECT_ID/indian-culture-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NODE_ENV=production,DB_HOST=YOUR_DB_HOST,DB_PASSWORD=YOUR_DB_PASSWORD

# Deploy frontend
gcloud run deploy indian-culture-frontend \
  --image gcr.io/YOUR_PROJECT_ID/indian-culture-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## Database Setup

### Option 1: Docker (Included)

Database is automatically set up with Docker Compose.

### Option 2: Managed Database

#### AWS RDS

```bash
# Create PostgreSQL RDS instance
# Version: PostgreSQL 15
# Instance: db.t3.micro or larger
# Storage: 20GB minimum

# Update .env.production:
DB_HOST=your-rds-endpoint.rds.amazonaws.com
DB_PORT=5432
DB_NAME=indian_culture_prod
DB_USER=postgres
DB_PASSWORD=your_password
```

#### DigitalOcean Managed Database

```bash
# Create PostgreSQL database
# Version: PostgreSQL 15
# Plan: Basic or higher

# Update .env.production with connection details
```

### Run Migrations

```bash
# If using Docker
docker-compose exec backend npm run db:init
docker-compose exec backend npm run db:seed

# If using external database
cd backend
npm run db:init
npm run db:seed
```

## Image Storage Setup

### Option 1: Local Storage (Development Only)

```bash
IMAGE_STORAGE_PROVIDER=local
IMAGE_BASE_URL=http://localhost:3000/images
```

### Option 2: AWS S3 (Recommended)

```bash
# Create S3 bucket
aws s3 mb s3://indian-culture-images-prod

# Configure bucket policy for public read
aws s3api put-bucket-policy --bucket indian-culture-images-prod --policy file://bucket-policy.json

# Update .env.production:
IMAGE_STORAGE_PROVIDER=s3
IMAGE_BASE_URL=https://indian-culture-images-prod.s3.amazonaws.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
S3_BUCKET_NAME=indian-culture-images-prod
```

### Option 3: Cloudinary

```bash
# Sign up at cloudinary.com
# Get credentials from dashboard

# Update .env.production:
IMAGE_STORAGE_PROVIDER=cloudinary
IMAGE_BASE_URL=https://res.cloudinary.com/your-cloud-name
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## Monitoring Setup

### Basic Health Checks

```bash
# Add to crontab for monitoring
*/5 * * * * curl -f http://localhost:3000/health || echo "Backend down" | mail -s "Alert" admin@yourdomain.com
```

### Docker Stats

```bash
# Monitor resource usage
docker stats

# View logs
docker-compose logs -f --tail=100
```

### Application Logs

```bash
# Backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log

# Docker logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

## Backup Strategy

### Database Backup

```bash
# Create backup script
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose exec -T postgres pg_dump -U postgres indian_culture > backup_$DATE.sql
# Upload to S3 or other storage
aws s3 cp backup_$DATE.sql s3://your-backup-bucket/
# Keep only last 7 days
find . -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh

# Add to crontab (daily at 2 AM)
0 2 * * * /path/to/backup.sh
```

### Application Backup

```bash
# Backup configuration and data
tar -czf app-backup-$(date +%Y%m%d).tar.gz \
  .env.production \
  backend/logs \
  docker-compose.prod.yml

# Upload to storage
aws s3 cp app-backup-*.tar.gz s3://your-backup-bucket/
```

## Security Checklist

- [ ] Change default database password
- [ ] Configure firewall (allow only 80, 443, 22)
- [ ] Set up SSL/TLS certificates
- [ ] Configure CORS properly
- [ ] Use environment variables for secrets
- [ ] Enable database backups
- [ ] Set up monitoring and alerts
- [ ] Keep Docker images updated
- [ ] Use strong passwords
- [ ] Limit SSH access

## Performance Optimization

### Enable Caching

```bash
# Already configured in .env
CACHE_TTL=900  # 15 minutes
```

### Use CDN

```bash
# Configure CloudFront or similar CDN
# Point to your S3 bucket or origin server
# Update IMAGE_BASE_URL to CDN URL
```

### Database Optimization

```bash
# Run inside database
docker-compose exec postgres psql -U postgres -d indian_culture

# Create additional indexes if needed
CREATE INDEX idx_translations_search ON translations USING GIN(search_vector);

# Analyze tables
ANALYZE;
```

## Scaling

### Horizontal Scaling

```bash
# Scale backend instances
docker-compose -f docker-compose.prod.yml up -d --scale backend=3

# Add load balancer (Nginx, HAProxy, or cloud LB)
```

### Vertical Scaling

```bash
# Increase container resources in docker-compose.prod.yml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
```

## Troubleshooting

### Services Won't Start

```bash
# Check logs
docker-compose logs

# Check status
docker-compose ps

# Restart services
docker-compose restart
```

### Cannot Access Application

```bash
# Check if services are running
docker-compose ps

# Check ports
netstat -tulpn | grep -E '(80|3000|5432)'

# Check firewall
sudo ufw status
```

### Database Connection Failed

```bash
# Check database is running
docker-compose ps postgres

# Test connection
docker-compose exec postgres psql -U postgres -d indian_culture -c "SELECT 1"

# Check credentials in .env.production
```

## Next Steps

1. **Set up monitoring**: Use tools like Prometheus, Grafana, or cloud monitoring
2. **Configure backups**: Automate database and application backups
3. **Set up CI/CD**: Automate deployments with GitHub Actions or similar
4. **Load testing**: Test with expected traffic using tools like Apache Bench or k6
5. **Security audit**: Run security scans and penetration tests
6. **Documentation**: Document your specific deployment configuration

## Support

For detailed information, see:
- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md)
- [Environment Variables Reference](./ENVIRONMENT_VARIABLES.md)
- [Database Migration Guide](./DATABASE_MIGRATION_GUIDE.md)
- [Troubleshooting Guide](./TROUBLESHOOTING.md)

For issues:
- Check logs first
- Review troubleshooting guide
- Contact development team
