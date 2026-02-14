# Troubleshooting Guide - Indian Culture App

This guide provides solutions to common issues encountered when deploying and running the Indian Culture App.

## Table of Contents

1. [Backend Issues](#backend-issues)
2. [Frontend Issues](#frontend-issues)
3. [Database Issues](#database-issues)
4. [Docker Issues](#docker-issues)
5. [Performance Issues](#performance-issues)
6. [Network and CORS Issues](#network-and-cors-issues)
7. [Image Storage Issues](#image-storage-issues)
8. [Common Error Messages](#common-error-messages)

## Backend Issues

### Backend Server Won't Start

**Symptoms:**
- Server crashes on startup
- Port already in use error
- Cannot connect to database

**Diagnostic Steps:**

1. Check if port is already in use:
```bash
# Windows
netstat -ano | findstr :3000

# Linux/Mac
lsof -i :3000
```

2. Check environment variables:
```bash
# Verify all required variables are set
node -e "require('dotenv').config(); console.log(process.env)"
```

3. Check database connection:
```bash
# Test database connectivity
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1"
```

4. Check logs:
```bash
# View backend logs
tail -f backend/logs/combined.log
tail -f backend/logs/error.log
```

**Solutions:**

1. **Port in use:**
```bash
# Kill process using port 3000
# Windows
taskkill /PID <PID> /F

# Linux/Mac
kill -9 <PID>

# Or use different port
export PORT=3001
```

2. **Missing environment variables:**
```bash
# Copy example file
cp backend/.env.example backend/.env

# Edit with your values
nano backend/.env
```

3. **Database connection failed:**
```bash
# Verify database is running
docker-compose ps postgres

# Restart database
docker-compose restart postgres

# Check credentials
psql -h localhost -U postgres -d indian_culture
```

### API Endpoints Return 500 Errors

**Symptoms:**
- Internal server errors
- Unexpected crashes
- Database query errors

**Diagnostic Steps:**

1. Check error logs:
```bash
tail -f backend/logs/error.log
```

2. Test database queries:
```sql
-- Test translations query
SELECT * FROM translations LIMIT 1;

-- Test cities query
SELECT * FROM cities LIMIT 1;
```

3. Check database schema:
```sql
\dt  -- List tables
\d+ cities  -- Describe cities table
```

**Solutions:**

1. **Database schema mismatch:**
```bash
# Re-run migrations
npm run db:init
```

2. **Missing data:**
```bash
# Seed database
npm run db:seed
```

3. **Query errors:**
- Check logs for specific SQL errors
- Verify table structure matches queries
- Check for missing indexes

### Memory Leaks or High CPU Usage

**Symptoms:**
- Increasing memory usage over time
- High CPU usage
- Slow response times

**Diagnostic Steps:**

1. Monitor resource usage:
```bash
# Check process stats
top -p $(pgrep -f "node.*index.js")

# Or use htop
htop
```

2. Check for memory leaks:
```bash
# Use Node.js built-in profiler
node --inspect dist/index.js

# Connect Chrome DevTools to inspect memory
```

3. Check database connection pool:
```bash
# Query pool stats via health endpoint
curl http://localhost:3000/health
```

**Solutions:**

1. **Connection pool exhausted:**
```typescript
// Adjust pool size in database.ts
max: 20,  // Increase max connections
idleTimeoutMillis: 30000,
```

2. **Cache growing too large:**
```typescript
// Reduce cache TTL
CACHE_TTL=300  // 5 minutes instead of 15
```

3. **Restart service:**
```bash
# Using PM2
pm2 restart indian-culture-backend

# Using Docker
docker-compose restart backend
```

## Frontend Issues

### Frontend Won't Build

**Symptoms:**
- Build errors
- TypeScript errors
- Missing dependencies

**Diagnostic Steps:**

1. Check Node version:
```bash
node --version  # Should be 18.x or higher
```

2. Check for errors:
```bash
npm run build 2>&1 | tee build-error.log
```

3. Check dependencies:
```bash
npm list --depth=0
```

**Solutions:**

1. **Clear cache and reinstall:**
```bash
rm -rf node_modules package-lock.json
npm install
npm run build
```

2. **TypeScript errors:**
```bash
# Run type check
npm run type-check

# Fix errors or update tsconfig.json
```

3. **Missing dependencies:**
```bash
npm install
```

### Frontend Shows Blank Page

**Symptoms:**
- White screen
- No content displayed
- Console errors

**Diagnostic Steps:**

1. Check browser console:
```
F12 -> Console tab
```

2. Check network requests:
```
F12 -> Network tab
```

3. Check if API is accessible:
```bash
curl http://localhost:3000/api/v1/cities?language=en
```

**Solutions:**

1. **API URL misconfigured:**
```bash
# Check .env file
cat frontend/.env

# Should have correct API URL
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

2. **CORS errors:**
- See [Network and CORS Issues](#network-and-cors-issues)

3. **JavaScript errors:**
- Check console for specific errors
- Clear browser cache
- Try incognito mode

### Images Not Loading

**Symptoms:**
- Broken image icons
- 404 errors for images
- Placeholder images shown

**Diagnostic Steps:**

1. Check image URLs in network tab:
```
F12 -> Network tab -> Filter: Img
```

2. Check API response:
```bash
curl http://localhost:3000/api/v1/heritage/HERITAGE_ID/images
```

3. Check image storage configuration:
```bash
echo $IMAGE_STORAGE_PROVIDER
echo $IMAGE_BASE_URL
```

**Solutions:**

1. **Incorrect image URLs:**
- Verify IMAGE_BASE_URL in backend .env
- Check image URLs in database

2. **CORS issues with CDN:**
- Configure CORS on S3/Cloudinary
- Add CDN domain to CORS whitelist

3. **Missing images:**
- Verify images exist in storage
- Re-seed database if needed

## Database Issues

### Cannot Connect to Database

**Symptoms:**
- Connection refused
- Authentication failed
- Timeout errors

**Diagnostic Steps:**

1. Check if database is running:
```bash
# Docker
docker-compose ps postgres

# System service
systemctl status postgresql
```

2. Test connection:
```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME
```

3. Check network connectivity:
```bash
# Test port
telnet $DB_HOST $DB_PORT

# Or use nc
nc -zv $DB_HOST $DB_PORT
```

**Solutions:**

1. **Database not running:**
```bash
# Start with Docker
docker-compose up -d postgres

# Or start system service
sudo systemctl start postgresql
```

2. **Wrong credentials:**
```bash
# Verify credentials in .env
cat backend/.env | grep DB_

# Reset password if needed
psql -U postgres -c "ALTER USER indian_culture_user WITH PASSWORD 'new_password';"
```

3. **Firewall blocking:**
```bash
# Check firewall rules
sudo ufw status

# Allow PostgreSQL port
sudo ufw allow 5432/tcp
```

### Database Queries Are Slow

**Symptoms:**
- Long response times
- Timeouts
- High database CPU

**Diagnostic Steps:**

1. Check slow queries:
```sql
-- Enable slow query logging
ALTER DATABASE indian_culture SET log_min_duration_statement = 1000;

-- View slow queries
SELECT * FROM pg_stat_statements ORDER BY total_time DESC LIMIT 10;
```

2. Analyze query plans:
```sql
EXPLAIN ANALYZE SELECT * FROM translations WHERE entity_type = 'city';
```

3. Check database stats:
```sql
-- Table sizes
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan;
```

**Solutions:**

1. **Missing indexes:**
```sql
-- Add missing indexes
CREATE INDEX idx_translations_entity_lang ON translations(entity_type, entity_id, language_code);
```

2. **Outdated statistics:**
```sql
-- Update statistics
ANALYZE;

-- Or for specific table
ANALYZE translations;
```

3. **Too many connections:**
```sql
-- Check active connections
SELECT count(*) FROM pg_stat_activity;

-- Adjust max_connections in postgresql.conf
max_connections = 100
```

### Database Disk Space Full

**Symptoms:**
- Cannot write to database
- Disk full errors
- Application crashes

**Diagnostic Steps:**

1. Check disk usage:
```bash
df -h
```

2. Check database size:
```sql
SELECT pg_size_pretty(pg_database_size('indian_culture'));
```

3. Check table sizes:
```sql
SELECT schemaname, tablename, pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

**Solutions:**

1. **Clean up old data:**
```sql
-- Delete old logs (if applicable)
DELETE FROM logs WHERE created_at < NOW() - INTERVAL '30 days';

-- Vacuum to reclaim space
VACUUM FULL;
```

2. **Increase disk space:**
- Expand volume/partition
- Move database to larger disk

3. **Archive old data:**
- Export old data to archive
- Delete from production database

## Docker Issues

### Docker Containers Won't Start

**Symptoms:**
- Container exits immediately
- Health check failures
- Port conflicts

**Diagnostic Steps:**

1. Check container status:
```bash
docker-compose ps
```

2. Check container logs:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs postgres
```

3. Check for port conflicts:
```bash
docker-compose ps
netstat -ano | findstr :3000
```

**Solutions:**

1. **Container exits immediately:**
```bash
# Check logs for errors
docker-compose logs backend

# Rebuild container
docker-compose build backend
docker-compose up -d backend
```

2. **Port conflicts:**
```bash
# Change port in docker-compose.yml or .env
PORT=3001

# Or stop conflicting service
docker stop <container-name>
```

3. **Health check failures:**
```bash
# Check health endpoint manually
docker-compose exec backend curl http://localhost:3000/health

# Adjust health check in docker-compose.yml
```

### Docker Build Fails

**Symptoms:**
- Build errors
- Dependency installation fails
- Out of disk space

**Diagnostic Steps:**

1. Check build output:
```bash
docker-compose build --no-cache backend 2>&1 | tee build-error.log
```

2. Check disk space:
```bash
docker system df
```

3. Check Docker daemon:
```bash
docker info
```

**Solutions:**

1. **Clear Docker cache:**
```bash
docker system prune -a
docker volume prune
```

2. **Build without cache:**
```bash
docker-compose build --no-cache
```

3. **Increase Docker resources:**
- Docker Desktop -> Settings -> Resources
- Increase CPU, Memory, Disk

### Docker Volumes Not Persisting

**Symptoms:**
- Data lost after restart
- Database empty after restart
- Logs not saved

**Diagnostic Steps:**

1. Check volumes:
```bash
docker volume ls
docker volume inspect indian-culture-app_postgres_data
```

2. Check volume mounts:
```bash
docker-compose config | grep -A 5 volumes
```

**Solutions:**

1. **Recreate volumes:**
```bash
docker-compose down -v
docker-compose up -d
```

2. **Check volume permissions:**
```bash
docker-compose exec postgres ls -la /var/lib/postgresql/data
```

3. **Use named volumes:**
```yaml
volumes:
  postgres_data:
    name: indian-culture-postgres-data
```

## Performance Issues

### Slow API Response Times

**Symptoms:**
- Requests take > 2 seconds
- Timeouts
- Poor user experience

**Diagnostic Steps:**

1. Test API performance:
```bash
# Single request
time curl http://localhost:3000/api/v1/cities?language=en

# Load test
ab -n 100 -c 10 http://localhost:3000/api/v1/cities?language=en
```

2. Check cache hit rate:
```bash
# Add logging to cache.ts to track hits/misses
```

3. Profile database queries:
```sql
EXPLAIN ANALYZE SELECT * FROM cities;
```

**Solutions:**

1. **Enable caching:**
```bash
# Verify cache is enabled
echo $CACHE_TTL  # Should be 900

# Check cache is working
curl http://localhost:3000/api/v1/cities?language=en
# Second request should be faster
```

2. **Optimize queries:**
```sql
-- Add missing indexes
CREATE INDEX idx_translations_lookup ON translations(entity_type, entity_id, language_code, field_name);
```

3. **Increase cache TTL:**
```bash
CACHE_TTL=1800  # 30 minutes
```

### High Memory Usage

**Symptoms:**
- Memory usage grows over time
- Out of memory errors
- Container restarts

**Diagnostic Steps:**

1. Monitor memory:
```bash
docker stats
```

2. Check Node.js heap:
```bash
node --expose-gc --inspect dist/index.js
```

**Solutions:**

1. **Limit cache size:**
```typescript
// In cache.ts
const cache = new NodeCache({ 
  stdTTL: 900,
  maxKeys: 1000  // Limit number of cached items
});
```

2. **Increase container memory:**
```yaml
# In docker-compose.yml
services:
  backend:
    deploy:
      resources:
        limits:
          memory: 1G
```

3. **Restart periodically:**
```bash
# Using PM2
pm2 start dist/index.js --max-memory-restart 500M
```

## Network and CORS Issues

### CORS Errors in Browser

**Symptoms:**
- "Access-Control-Allow-Origin" errors
- Preflight request failures
- API requests blocked

**Diagnostic Steps:**

1. Check browser console:
```
F12 -> Console
```

2. Check CORS configuration:
```bash
cat backend/.env | grep CORS_ORIGIN
```

3. Test with curl:
```bash
curl -H "Origin: http://localhost:5173" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     http://localhost:3000/api/v1/cities
```

**Solutions:**

1. **Update CORS origin:**
```bash
# In backend/.env
CORS_ORIGIN=http://localhost:5173

# For multiple origins
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

2. **Check CORS middleware:**
```typescript
// In backend/src/config/cors.ts
export const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || 'http://localhost:5173',
  credentials: true,
};
```

3. **Restart backend:**
```bash
docker-compose restart backend
```

### Cannot Reach API from Frontend

**Symptoms:**
- Network errors
- Connection refused
- Timeout errors

**Diagnostic Steps:**

1. Check API URL:
```bash
cat frontend/.env | grep VITE_API_BASE_URL
```

2. Test API directly:
```bash
curl http://localhost:3000/api/v1/cities?language=en
```

3. Check network connectivity:
```bash
ping localhost
telnet localhost 3000
```

**Solutions:**

1. **Verify API URL:**
```bash
# In frontend/.env
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

2. **Check backend is running:**
```bash
docker-compose ps backend
curl http://localhost:3000/health
```

3. **Check firewall:**
```bash
# Allow port 3000
sudo ufw allow 3000/tcp
```

## Image Storage Issues

### S3 Upload Failures

**Symptoms:**
- Image upload errors
- 403 Forbidden errors
- Access denied

**Diagnostic Steps:**

1. Check AWS credentials:
```bash
echo $AWS_ACCESS_KEY_ID
echo $AWS_SECRET_ACCESS_KEY
echo $S3_BUCKET_NAME
```

2. Test AWS CLI:
```bash
aws s3 ls s3://$S3_BUCKET_NAME
```

3. Check IAM permissions:
```bash
aws iam get-user
```

**Solutions:**

1. **Verify credentials:**
```bash
# Update .env with correct credentials
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
```

2. **Check bucket policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-bucket/*"
    }
  ]
}
```

3. **Check CORS on bucket:**
```json
[
  {
    "AllowedHeaders": ["*"],
    "AllowedMethods": ["GET", "PUT", "POST"],
    "AllowedOrigins": ["*"],
    "ExposeHeaders": []
  }
]
```

### Cloudinary Upload Failures

**Symptoms:**
- Upload errors
- Invalid credentials
- Quota exceeded

**Diagnostic Steps:**

1. Check credentials:
```bash
echo $CLOUDINARY_CLOUD_NAME
echo $CLOUDINARY_API_KEY
```

2. Test Cloudinary API:
```bash
curl https://api.cloudinary.com/v1_1/$CLOUDINARY_CLOUD_NAME/image/upload
```

**Solutions:**

1. **Verify credentials:**
```bash
# Update .env
CLOUDINARY_CLOUD_NAME=your-cloud
CLOUDINARY_API_KEY=your-key
CLOUDINARY_API_SECRET=your-secret
```

2. **Check quota:**
- Log into Cloudinary dashboard
- Check usage limits
- Upgrade plan if needed

## Common Error Messages

### "ECONNREFUSED"

**Cause:** Cannot connect to service

**Solution:**
- Verify service is running
- Check host and port
- Check firewall rules

### "EADDRINUSE"

**Cause:** Port already in use

**Solution:**
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### "relation does not exist"

**Cause:** Database table missing

**Solution:**
```bash
# Run migrations
npm run db:init
```

### "column does not exist"

**Cause:** Database schema mismatch

**Solution:**
```bash
# Re-run migrations
npm run db:init
```

### "Out of memory"

**Cause:** Insufficient memory

**Solution:**
- Increase container memory
- Optimize queries
- Reduce cache size

### "Cannot find module"

**Cause:** Missing dependency

**Solution:**
```bash
npm install
npm run build
```

## Getting Help

If you cannot resolve an issue:

1. **Check logs:**
   - Backend: `backend/logs/`
   - Docker: `docker-compose logs`
   - Browser: F12 -> Console

2. **Search documentation:**
   - Review deployment guide
   - Check environment variables guide
   - Read database migration guide

3. **Contact support:**
   - Provide error messages
   - Include relevant logs
   - Describe steps to reproduce

4. **Create issue:**
   - Include system information
   - Attach logs
   - Describe expected vs actual behavior
