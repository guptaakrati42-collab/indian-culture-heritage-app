# Environment Variables Reference

This document provides a comprehensive reference for all environment variables used in the Indian Culture App.

## Table of Contents

1. [Backend Environment Variables](#backend-environment-variables)
2. [Frontend Environment Variables](#frontend-environment-variables)
3. [Docker Environment Variables](#docker-environment-variables)
4. [Environment-Specific Configurations](#environment-specific-configurations)

## Backend Environment Variables

### Server Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `NODE_ENV` | string | No | `development` | Application environment (`development`, `production`, `test`) |
| `PORT` | number | No | `3000` | Port number for the backend server |

**Example:**
```bash
NODE_ENV=production
PORT=3000
```

### Database Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `DB_HOST` | string | Yes | `localhost` | PostgreSQL database host |
| `DB_PORT` | number | No | `5432` | PostgreSQL database port |
| `DB_NAME` | string | Yes | `indian_culture` | Database name |
| `DB_USER` | string | Yes | `postgres` | Database username |
| `DB_PASSWORD` | string | Yes | `postgres` | Database password |

**Example:**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture_prod
DB_USER=indian_culture_user
DB_PASSWORD=your_secure_password
```

**Security Notes:**
- Use strong passwords in production
- Never commit passwords to version control
- Rotate credentials regularly
- Use environment-specific credentials

### CORS Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `CORS_ORIGIN` | string | No | `http://localhost:5173` | Allowed CORS origin(s) |

**Example:**
```bash
# Single origin
CORS_ORIGIN=https://yourdomain.com

# Multiple origins (comma-separated)
CORS_ORIGIN=https://yourdomain.com,https://www.yourdomain.com
```

### Cache Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `CACHE_TTL` | number | No | `900` | Cache time-to-live in seconds (15 minutes) |

**Example:**
```bash
CACHE_TTL=900  # 15 minutes
```

### Image Storage Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `IMAGE_STORAGE_PROVIDER` | string | No | `local` | Image storage provider (`local`, `s3`, `cloudinary`) |
| `IMAGE_BASE_URL` | string | No | `http://localhost:3000/images` | Base URL for image access |

**Example:**
```bash
IMAGE_STORAGE_PROVIDER=s3
IMAGE_BASE_URL=https://cdn.yourdomain.com
```

### AWS S3 Configuration

Required when `IMAGE_STORAGE_PROVIDER=s3`

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `AWS_REGION` | string | Conditional | - | AWS region (e.g., `us-east-1`) |
| `AWS_ACCESS_KEY_ID` | string | Conditional | - | AWS access key ID |
| `AWS_SECRET_ACCESS_KEY` | string | Conditional | - | AWS secret access key |
| `S3_BUCKET_NAME` | string | Conditional | - | S3 bucket name for image storage |

**Example:**
```bash
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
S3_BUCKET_NAME=indian-culture-images-prod
```

**Security Notes:**
- Use IAM roles when possible (EC2, ECS)
- Limit IAM permissions to minimum required
- Never commit AWS credentials to version control
- Use AWS Secrets Manager for credential management

### Cloudinary Configuration

Required when `IMAGE_STORAGE_PROVIDER=cloudinary`

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `CLOUDINARY_CLOUD_NAME` | string | Conditional | - | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | string | Conditional | - | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | string | Conditional | - | Cloudinary API secret |

**Example:**
```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcdefghijklmnopqrstuvwxyz123456
```

## Frontend Environment Variables

All frontend environment variables must be prefixed with `VITE_` to be accessible in the application.

### API Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `VITE_API_BASE_URL` | string | Yes | `http://localhost:3000/api/v1` | Backend API base URL |

**Example:**
```bash
# Development
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Production
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
```

### Application Configuration

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `VITE_NODE_ENV` | string | No | `development` | Application environment |
| `VITE_ENABLE_DEVTOOLS` | boolean | No | `true` | Enable React Query DevTools |

**Example:**
```bash
# Development
VITE_NODE_ENV=development
VITE_ENABLE_DEVTOOLS=true

# Production
VITE_NODE_ENV=production
VITE_ENABLE_DEVTOOLS=false
```

## Docker Environment Variables

### Docker Compose Variables

| Variable | Type | Required | Default | Description |
|----------|------|----------|---------|-------------|
| `DB_USER` | string | No | `postgres` | Database username |
| `DB_PASSWORD` | string | No | `postgres` | Database password |
| `DB_NAME` | string | No | `indian_culture` | Database name |
| `DB_PORT` | number | No | `5432` | Database port (host mapping) |
| `PORT` | number | No | `3000` | Backend port (host mapping) |
| `FRONTEND_PORT` | number | No | `80` | Frontend port (host mapping) |

**Example (.env for docker-compose):**
```bash
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=indian_culture
DB_PORT=5432
PORT=3000
FRONTEND_PORT=80
```

## Environment-Specific Configurations

### Development Environment

**Backend (.env):**
```bash
NODE_ENV=development
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:5173
CACHE_TTL=900
IMAGE_STORAGE_PROVIDER=local
IMAGE_BASE_URL=http://localhost:3000/images
```

**Frontend (.env):**
```bash
VITE_API_BASE_URL=http://localhost:3000/api/v1
VITE_NODE_ENV=development
VITE_ENABLE_DEVTOOLS=true
```

### Production Environment

**Backend (.env.production):**
```bash
NODE_ENV=production
PORT=3000
DB_HOST=your-db-host.rds.amazonaws.com
DB_PORT=5432
DB_NAME=indian_culture_prod
DB_USER=indian_culture_user
DB_PASSWORD=your_strong_password_here
CORS_ORIGIN=https://yourdomain.com
CACHE_TTL=900
IMAGE_STORAGE_PROVIDER=s3
IMAGE_BASE_URL=https://cdn.yourdomain.com
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
S3_BUCKET_NAME=indian-culture-images-prod
```

**Frontend (.env.production):**
```bash
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_NODE_ENV=production
VITE_ENABLE_DEVTOOLS=false
```

### Testing Environment

**Backend (.env.test):**
```bash
NODE_ENV=test
PORT=3001
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture_test
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:5173
CACHE_TTL=60
IMAGE_STORAGE_PROVIDER=local
IMAGE_BASE_URL=http://localhost:3001/images
```

**Frontend (.env.test):**
```bash
VITE_API_BASE_URL=http://localhost:3001/api/v1
VITE_NODE_ENV=test
VITE_ENABLE_DEVTOOLS=false
```

## Environment File Priority

The application loads environment variables in the following order (later files override earlier ones):

1. System environment variables
2. `.env` (default)
3. `.env.local` (local overrides, not committed)
4. `.env.[NODE_ENV]` (environment-specific)
5. `.env.[NODE_ENV].local` (local environment-specific, not committed)

## Best Practices

### Security

1. **Never commit sensitive data:**
   - Add `.env*` to `.gitignore` (except `.env.example`)
   - Use `.env.example` files as templates
   - Document all required variables

2. **Use strong credentials:**
   - Generate strong passwords (minimum 16 characters)
   - Use different credentials per environment
   - Rotate credentials regularly

3. **Limit access:**
   - Use principle of least privilege
   - Restrict database access by IP
   - Use IAM roles when possible

### Organization

1. **Use consistent naming:**
   - Use UPPER_SNAKE_CASE for all variables
   - Prefix frontend variables with `VITE_`
   - Group related variables together

2. **Document all variables:**
   - Provide clear descriptions
   - Include examples
   - Note required vs optional

3. **Validate on startup:**
   - Check required variables exist
   - Validate variable formats
   - Fail fast with clear error messages

### Deployment

1. **Use environment-specific files:**
   - `.env.development` for local development
   - `.env.production` for production
   - `.env.test` for testing

2. **Use secret management:**
   - AWS Secrets Manager
   - Azure Key Vault
   - HashiCorp Vault
   - Kubernetes Secrets

3. **Automate configuration:**
   - Use CI/CD pipelines
   - Template environment files
   - Validate before deployment

## Troubleshooting

### Variable Not Loading

1. Check file name matches environment
2. Verify variable name is correct
3. Restart application after changes
4. Check for syntax errors in .env file

### Frontend Variable Not Accessible

1. Ensure variable is prefixed with `VITE_`
2. Rebuild application after adding variable
3. Check browser console for errors

### Database Connection Failed

1. Verify all DB_* variables are set
2. Check database is running
3. Verify network connectivity
4. Check firewall rules

### CORS Errors

1. Verify CORS_ORIGIN matches frontend URL
2. Include protocol (http/https)
3. Check for trailing slashes
4. Test with multiple origins if needed

## Example Files

### .env.example (Backend)

```bash
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture
DB_USER=postgres
DB_PASSWORD=postgres

# CORS Configuration
CORS_ORIGIN=http://localhost:5173

# Cache Configuration
CACHE_TTL=900

# Image Storage
IMAGE_STORAGE_PROVIDER=local
IMAGE_BASE_URL=http://localhost:3000/images
```

### .env.example (Frontend)

```bash
# API Configuration
VITE_API_BASE_URL=http://localhost:3000/api/v1

# Development Configuration
VITE_NODE_ENV=development
VITE_ENABLE_DEVTOOLS=true
```

## Support

For questions about environment configuration:
- Review this documentation
- Check `.env.example` files
- Consult deployment guide
- Contact development team
