# Start Database and Run Tests Script
# This script starts PostgreSQL and runs the tests

Write-Host "=== Starting Database and Running Tests ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if Docker is available
Write-Host "Step 1: Checking Docker..." -ForegroundColor Yellow
try {
    $DockerVersion = docker --version 2>$null
    if ($DockerVersion) {
        Write-Host "✅ Docker available: $DockerVersion" -ForegroundColor Green
    } else {
        throw "Docker not found"
    }
} catch {
    Write-Host "❌ Docker not available" -ForegroundColor Red
    Write-Host "💡 Please install Docker Desktop or start PostgreSQL manually" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Manual PostgreSQL setup:" -ForegroundColor White
    Write-Host "1. Install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Gray
    Write-Host "2. Create database: createdb indian_culture" -ForegroundColor Gray
    Write-Host "3. Update .env with your PostgreSQL credentials" -ForegroundColor Gray
    Write-Host "4. Run: npm test" -ForegroundColor Gray
    exit 1
}

# Step 2: Start PostgreSQL with Docker Compose
Write-Host ""
Write-Host "Step 2: Starting PostgreSQL database..." -ForegroundColor Yellow

# Check if we're in the right directory (should have docker-compose.yml)
if (-not (Test-Path "../docker-compose.yml")) {
    Write-Host "❌ docker-compose.yml not found in parent directory" -ForegroundColor Red
    Write-Host "💡 Make sure you're running this from the backend directory" -ForegroundColor Yellow
    exit 1
}

try {
    # Start PostgreSQL service
    Write-Host "Starting PostgreSQL container..." -ForegroundColor Gray
    docker-compose -f ../docker-compose.yml up -d postgres
    
    Write-Host "✅ PostgreSQL container started" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to start PostgreSQL container" -ForegroundColor Red
    Write-Host "Error: $_" -ForegroundColor Red
    exit 1
}

# Step 3: Wait for PostgreSQL to be ready
Write-Host ""
Write-Host "Step 3: Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow

$MaxWaitTime = 30
$WaitTime = 0
$IsReady = $false

while ($WaitTime -lt $MaxWaitTime -and -not $IsReady) {
    try {
        # Try to connect to PostgreSQL
        $TestConnection = docker exec $(docker-compose -f ../docker-compose.yml ps -q postgres) pg_isready -U postgres 2>$null
        if ($TestConnection -like "*accepting connections*") {
            $IsReady = $true
            Write-Host "✅ PostgreSQL is ready!" -ForegroundColor Green
        } else {
            Write-Host "⏳ Waiting for PostgreSQL... ($WaitTime/$MaxWaitTime seconds)" -ForegroundColor Gray
            Start-Sleep -Seconds 2
            $WaitTime += 2
        }
    } catch {
        Write-Host "⏳ Waiting for PostgreSQL... ($WaitTime/$MaxWaitTime seconds)" -ForegroundColor Gray
        Start-Sleep -Seconds 2
        $WaitTime += 2
    }
}

if (-not $IsReady) {
    Write-Host "❌ PostgreSQL did not start within $MaxWaitTime seconds" -ForegroundColor Red
    Write-Host "💡 Try running: docker-compose -f ../docker-compose.yml logs postgres" -ForegroundColor Yellow
    exit 1
}

# Step 4: Initialize database (if needed)
Write-Host ""
Write-Host "Step 4: Initializing database..." -ForegroundColor Yellow

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Gray
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
    } else {
        @"
NODE_ENV=test
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:5173
CACHE_TTL=900
"@ | Out-File -FilePath ".env" -Encoding UTF8
    }
    Write-Host "✅ Environment file created" -ForegroundColor Green
}

# Try to initialize database
try {
    Write-Host "Running database initialization..." -ForegroundColor Gray
    npm run db:init 2>$null
    Write-Host "✅ Database initialized" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Database initialization failed (this might be normal if already initialized)" -ForegroundColor Yellow
}

# Step 5: Run tests
Write-Host ""
Write-Host "Step 5: Running tests..." -ForegroundColor Yellow
Write-Host ""

try {
    # Run tests
    npm test
    Write-Host ""
    Write-Host "✅ Tests completed!" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    Write-Host "This is normal if the database doesn't have test data yet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Try seeding the database:" -ForegroundColor White
    Write-Host "  npm run db:seed" -ForegroundColor Gray
    Write-Host "  npm test" -ForegroundColor Gray
}

Write-Host ""
Write-Host "=== Database and Test Setup Complete ===" -ForegroundColor Green
Write-Host ""
Write-Host "PostgreSQL is now running. You can:" -ForegroundColor White
Write-Host "• Run tests: npm test" -ForegroundColor Gray
Write-Host "• Seed database: npm run db:seed" -ForegroundColor Gray
Write-Host "• Start backend: npm run dev" -ForegroundColor Gray
Write-Host "• Stop database: docker-compose -f ../docker-compose.yml down" -ForegroundColor Gray
Write-Host ""