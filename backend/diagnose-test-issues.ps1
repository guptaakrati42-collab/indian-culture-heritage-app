# Backend Test Diagnostics Script
# Run this to identify and fix common test issues

Write-Host "=== Backend Test Diagnostics ===" -ForegroundColor Cyan
Write-Host ""

$ErrorCount = 0

# Check 1: Current Directory
Write-Host "1. Checking current directory..." -ForegroundColor Yellow
$CurrentDir = Get-Location
Write-Host "   Current directory: $CurrentDir"
if ($CurrentDir.Path -notlike "*backend*") {
    Write-Host "   ❌ You might not be in the backend directory" -ForegroundColor Red
    Write-Host "   💡 Solution: cd backend" -ForegroundColor Green
    $ErrorCount++
} else {
    Write-Host "   ✅ In backend directory" -ForegroundColor Green
}
Write-Host ""

# Check 2: Node.js and npm
Write-Host "2. Checking Node.js and npm..." -ForegroundColor Yellow
try {
    $NodeVersion = node --version 2>$null
    if ($NodeVersion) {
        Write-Host "   ✅ Node.js: $NodeVersion" -ForegroundColor Green
    } else {
        throw "Node.js not found"
    }
} catch {
    Write-Host "   ❌ Node.js not installed or not in PATH" -ForegroundColor Red
    Write-Host "   💡 Solution: Install Node.js from https://nodejs.org/" -ForegroundColor Green
    $ErrorCount++
}

try {
    $NpmVersion = npm --version 2>$null
    if ($NpmVersion) {
        Write-Host "   ✅ npm: $NpmVersion" -ForegroundColor Green
    } else {
        throw "npm not found"
    }
} catch {
    Write-Host "   ❌ npm not found" -ForegroundColor Red
    Write-Host "   💡 Solution: Reinstall Node.js" -ForegroundColor Green
    $ErrorCount++
}
Write-Host ""

# Check 3: Package.json
Write-Host "3. Checking package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "   ✅ package.json exists" -ForegroundColor Green
    
    # Check test script
    $PackageJson = Get-Content "package.json" | ConvertFrom-Json
    if ($PackageJson.scripts.test) {
        Write-Host "   ✅ Test script defined: $($PackageJson.scripts.test)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ No test script in package.json" -ForegroundColor Red
        $ErrorCount++
    }
} else {
    Write-Host "   ❌ package.json not found" -ForegroundColor Red
    Write-Host "   💡 Solution: Make sure you're in the backend directory" -ForegroundColor Green
    $ErrorCount++
}
Write-Host ""

# Check 4: Dependencies
Write-Host "4. Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "   ✅ node_modules directory exists" -ForegroundColor Green
    
    # Check key dependencies
    $KeyDeps = @("jest", "ts-jest", "@types/jest", "typescript")
    foreach ($dep in $KeyDeps) {
        if (Test-Path "node_modules/$dep") {
            Write-Host "   ✅ $dep installed" -ForegroundColor Green
        } else {
            Write-Host "   ❌ $dep missing" -ForegroundColor Red
            $ErrorCount++
        }
    }
} else {
    Write-Host "   ❌ node_modules not found" -ForegroundColor Red
    Write-Host "   💡 Solution: Run 'npm install'" -ForegroundColor Green
    $ErrorCount++
}
Write-Host ""

# Check 5: Jest Configuration
Write-Host "5. Checking Jest configuration..." -ForegroundColor Yellow
if (Test-Path "jest.config.js") {
    Write-Host "   ✅ jest.config.js exists" -ForegroundColor Green
} elseif (Test-Path "jest.config.json") {
    Write-Host "   ✅ jest.config.json exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ Jest configuration not found" -ForegroundColor Red
    Write-Host "   💡 This might cause issues with TypeScript tests" -ForegroundColor Yellow
}
Write-Host ""

# Check 6: TypeScript Configuration
Write-Host "6. Checking TypeScript configuration..." -ForegroundColor Yellow
if (Test-Path "tsconfig.json") {
    Write-Host "   ✅ tsconfig.json exists" -ForegroundColor Green
} else {
    Write-Host "   ❌ tsconfig.json not found" -ForegroundColor Red
    Write-Host "   💡 TypeScript tests may fail" -ForegroundColor Yellow
    $ErrorCount++
}
Write-Host ""

# Check 7: Test Files
Write-Host "7. Checking test files..." -ForegroundColor Yellow
$TestFiles = Get-ChildItem -Recurse -Filter "*.test.ts" -ErrorAction SilentlyContinue
if ($TestFiles.Count -gt 0) {
    Write-Host "   ✅ Found $($TestFiles.Count) test files" -ForegroundColor Green
    foreach ($file in $TestFiles | Select-Object -First 5) {
        Write-Host "      - $($file.Name)" -ForegroundColor Gray
    }
    if ($TestFiles.Count -gt 5) {
        Write-Host "      ... and $($TestFiles.Count - 5) more" -ForegroundColor Gray
    }
} else {
    Write-Host "   ❌ No test files found" -ForegroundColor Red
    Write-Host "   💡 Looking for *.test.ts files in src/" -ForegroundColor Yellow
}
Write-Host ""

# Check 8: Environment Variables
Write-Host "8. Checking environment configuration..." -ForegroundColor Yellow
if (Test-Path ".env") {
    Write-Host "   ✅ .env file exists" -ForegroundColor Green
} elseif (Test-Path ".env.example") {
    Write-Host "   ⚠️  .env.example exists but no .env file" -ForegroundColor Yellow
    Write-Host "   💡 Solution: Copy .env.example to .env" -ForegroundColor Green
} else {
    Write-Host "   ❌ No environment files found" -ForegroundColor Red
    Write-Host "   💡 Tests may fail due to missing environment variables" -ForegroundColor Yellow
}
Write-Host ""

# Check 9: Database (if needed)
Write-Host "9. Checking database requirements..." -ForegroundColor Yellow
try {
    # Check if PostgreSQL is running (common port)
    $PgConnection = Test-NetConnection -ComputerName localhost -Port 5432 -WarningAction SilentlyContinue -ErrorAction SilentlyContinue
    if ($PgConnection.TcpTestSucceeded) {
        Write-Host "   ✅ PostgreSQL appears to be running on port 5432" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  PostgreSQL not detected on port 5432" -ForegroundColor Yellow
        Write-Host "   💡 Integration tests may fail without database" -ForegroundColor Yellow
        Write-Host "   💡 Solution: docker-compose up -d postgres" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Could not check PostgreSQL status" -ForegroundColor Yellow
}
Write-Host ""

# Check 10: Port Conflicts
Write-Host "10. Checking for port conflicts..." -ForegroundColor Yellow
try {
    $Port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
    if ($Port3000) {
        Write-Host "   ⚠️  Port 3000 is in use" -ForegroundColor Yellow
        Write-Host "   💡 This might cause test conflicts" -ForegroundColor Yellow
        Write-Host "   💡 Solution: Stop the process or change test port" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Port 3000 is available" -ForegroundColor Green
    }
} catch {
    Write-Host "   ✅ Port 3000 appears to be available" -ForegroundColor Green
}
Write-Host ""

# Summary and Recommendations
Write-Host "=== SUMMARY ===" -ForegroundColor Cyan
Write-Host ""

if ($ErrorCount -eq 0) {
    Write-Host "✅ All checks passed! Your environment looks good." -ForegroundColor Green
    Write-Host ""
    Write-Host "Try running tests with:" -ForegroundColor White
    Write-Host "  npm test" -ForegroundColor Gray
    Write-Host ""
} else {
    Write-Host "❌ Found $ErrorCount potential issues." -ForegroundColor Red
    Write-Host ""
    Write-Host "🔧 QUICK FIXES:" -ForegroundColor Yellow
    Write-Host ""
    
    if (-not (Test-Path "node_modules")) {
        Write-Host "1. Install dependencies:" -ForegroundColor White
        Write-Host "   npm install" -ForegroundColor Gray
        Write-Host ""
    }
    
    if (-not (Test-Path ".env") -and (Test-Path ".env.example")) {
        Write-Host "2. Create environment file:" -ForegroundColor White
        Write-Host "   copy .env.example .env" -ForegroundColor Gray
        Write-Host ""
    }
    
    Write-Host "3. Try running tests:" -ForegroundColor White
    Write-Host "   npm test" -ForegroundColor Gray
    Write-Host ""
    
    Write-Host "4. If database tests fail:" -ForegroundColor White
    Write-Host "   docker-compose up -d postgres" -ForegroundColor Gray
    Write-Host ""
}

Write-Host "=== COMMON TEST COMMANDS ===" -ForegroundColor Cyan
Write-Host ""
Write-Host "Basic test run:" -ForegroundColor White
Write-Host "  npm test" -ForegroundColor Gray
Write-Host ""
Write-Host "Run tests without database:" -ForegroundColor White
Write-Host "  npm test -- --testPathIgnorePatterns=integration" -ForegroundColor Gray
Write-Host ""
Write-Host "Run specific test file:" -ForegroundColor White
Write-Host "  npm test -- TranslationService.test.ts" -ForegroundColor Gray
Write-Host ""
Write-Host "Clear cache and run:" -ForegroundColor White
Write-Host "  npm test -- --clearCache && npm test" -ForegroundColor Gray
Write-Host ""
Write-Host "Verbose output:" -ForegroundColor White
Write-Host "  npm test -- --verbose" -ForegroundColor Gray
Write-Host ""

Write-Host "If you're still getting errors, please share the exact error message!" -ForegroundColor Yellow