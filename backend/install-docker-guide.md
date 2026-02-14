# Docker Installation Guide for Windows

## The Issue
Your tests are failing because they need PostgreSQL database, but Docker/Docker Compose is not installed on your system.

## Quick Solutions

### Option 1: Run Tests Without Database (Immediate)
```powershell
# From the backend directory
.\run-tests-without-database.ps1
```
This will run only the unit tests that don't need a database.

### Option 2: Install Docker Desktop (Recommended)

#### Step 1: Download Docker Desktop
1. Go to https://www.docker.com/products/docker-desktop/
2. Click "Download for Windows"
3. Download the installer (Docker Desktop Installer.exe)

#### Step 2: Install Docker Desktop
1. Run the installer as Administrator
2. Follow the installation wizard
3. Enable WSL 2 integration if prompted
4. Restart your computer when prompted

#### Step 3: Start Docker Desktop
1. Launch Docker Desktop from Start Menu
2. Wait for it to start (you'll see a whale icon in system tray)
3. Accept the terms if prompted

#### Step 4: Verify Installation
```powershell
# Check Docker is working
docker --version
docker-compose --version
```

#### Step 5: Run Tests with Database
```powershell
# From the backend directory
docker-compose -f ../docker-compose.yml up -d postgres
npm test
```

### Option 3: Install PostgreSQL Directly (Alternative)

#### Step 1: Download PostgreSQL
1. Go to https://www.postgresql.org/download/windows/
2. Download the installer
3. Run the installer

#### Step 2: Configure PostgreSQL
1. Set password for postgres user
2. Remember the port (default: 5432)
3. Start PostgreSQL service

#### Step 3: Create Database
```sql
-- Connect to PostgreSQL and run:
CREATE DATABASE indian_culture;
```

#### Step 4: Update Environment
```powershell
# Edit .env file with your PostgreSQL settings
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture
DB_USER=postgres
DB_PASSWORD=your_password
```

#### Step 5: Run Tests
```powershell
npm run db:init
npm run db:seed
npm test
```

## What Each Option Does

### Option 1: Tests Without Database
- ✅ Runs immediately
- ✅ Tests code logic
- ❌ Skips database integration tests
- ❌ Skips property-based tests

### Option 2: Docker Desktop
- ✅ Complete testing environment
- ✅ Easy to start/stop database
- ✅ Matches production environment
- ❌ Requires installation

### Option 3: PostgreSQL Direct
- ✅ Complete testing environment
- ✅ Native Windows installation
- ❌ More configuration required
- ❌ Manual database management

## Recommended Approach

1. **Immediate**: Run `.\run-tests-without-database.ps1` to test what you can now
2. **Long-term**: Install Docker Desktop for the complete development experience

## After Installing Docker

Once Docker is installed, you can run the full test suite:

```powershell
# Start database
docker-compose -f ../docker-compose.yml up -d postgres

# Run all tests
npm test

# Stop database when done
docker-compose -f ../docker-compose.yml down
```

## Troubleshooting

### Docker Desktop Won't Start
- Make sure Hyper-V is enabled in Windows Features
- Enable WSL 2 if on Windows 10/11
- Restart computer after installation

### PostgreSQL Connection Issues
- Check if PostgreSQL service is running
- Verify credentials in .env file
- Check firewall settings

### Still Having Issues?
Run the diagnostic script:
```powershell
.\diagnose-test-issues.ps1
```

This will identify exactly what's missing and how to fix it.