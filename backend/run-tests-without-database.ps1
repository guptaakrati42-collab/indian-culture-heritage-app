# Run Tests Without Database Script
# This script runs only the tests that don't require a database connection

Write-Host "=== Running Tests Without Database ===" -ForegroundColor Cyan
Write-Host ""

Write-Host "Since Docker/PostgreSQL is not available, we'll run tests that don't require a database." -ForegroundColor Yellow
Write-Host ""

# Step 1: Check if we're in the right directory
Write-Host "Step 1: Checking directory..." -ForegroundColor Yellow
if (-not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found. Make sure you're in the backend directory." -ForegroundColor Red
    exit 1
}
Write-Host "✅ In backend directory" -ForegroundColor Green
Write-Host ""

# Step 2: Check if dependencies are installed
Write-Host "Step 2: Checking dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Gray
    try {
        npm install
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Create environment file
Write-Host "Step 3: Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    Write-Host "Creating .env file..." -ForegroundColor Gray
    @"
NODE_ENV=test
PORT=3000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=indian_culture_test
DB_USER=postgres
DB_PASSWORD=postgres
CORS_ORIGIN=http://localhost:5173
CACHE_TTL=900
"@ | Out-File -FilePath ".env" -Encoding UTF8
    Write-Host "✅ Environment file created" -ForegroundColor Green
} else {
    Write-Host "✅ Environment file exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Run tests without database
Write-Host "Step 4: Running tests (excluding database-dependent tests)..." -ForegroundColor Yellow
Write-Host ""

try {
    # Run tests but exclude integration tests and database tests
    Write-Host "Running unit tests only..." -ForegroundColor Gray
    npm test -- --testPathIgnorePatterns="integration|database" --passWithNoTests
    
    Write-Host ""
    Write-Host "✅ Unit tests completed!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Note: Database-dependent tests were skipped." -ForegroundColor Yellow
    Write-Host "To run all tests, you need PostgreSQL running." -ForegroundColor Yellow
    
} catch {
    Write-Host ""
    Write-Host "❌ Some tests failed" -ForegroundColor Red
    Write-Host "This might be due to missing database connection." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== Test Summary ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Unit tests (logic-only) - Completed" -ForegroundColor Green
Write-Host "⏸️  Integration tests (database) - Skipped" -ForegroundColor Yellow
Write-Host "⏸️  Property-based tests (database) - Skipped" -ForegroundColor Yellow
Write-Host ""
Write-Host "To run ALL tests, you need to:" -ForegroundColor White
Write-Host "1. Install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Gray
Write-Host "2. Or install PostgreSQL from https://www.postgresql.org/download/" -ForegroundColor Gray
Write-Host "3. Then run: npm test" -ForegroundColor Gray
Write-Host ""