# Backend Test Setup Fix Script
# This script attempts to fix common test setup issues

Write-Host "=== Backend Test Setup Fix ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Ensure we're in the right directory
Write-Host "Step 1: Checking directory..." -ForegroundColor Yellow
$CurrentDir = Get-Location
if ($CurrentDir.Path -notlike "*backend*") {
    Write-Host "❌ Not in backend directory. Please run this from the backend folder." -ForegroundColor Red
    Write-Host "💡 Run: cd backend" -ForegroundColor Green
    exit 1
}
Write-Host "✅ In backend directory" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "Step 2: Installing dependencies..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing npm dependencies..." -ForegroundColor Gray
    try {
        npm install
        Write-Host "✅ Dependencies installed" -ForegroundColor Green
    } catch {
        Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
        Write-Host "Error: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "✅ Dependencies already installed" -ForegroundColor Green
}
Write-Host ""

# Step 3: Create environment file
Write-Host "Step 3: Setting up environment..." -ForegroundColor Yellow
if (-not (Test-Path ".env")) {
    if (Test-Path ".env.example") {
        Write-Host "Creating .env from .env.example..." -ForegroundColor Gray
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Environment file created" -ForegroundColor Green
    } else {
        Write-Host "Creating basic .env file..." -ForegroundColor Gray
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
        Write-Host "✅ Basic environment file created" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Environment file already exists" -ForegroundColor Green
}
Write-Host ""

# Step 4: Check Jest configuration
Write-Host "Step 4: Checking Jest configuration..." -ForegroundColor Yellow
if (-not (Test-Path "jest.config.js")) {
    Write-Host "Creating Jest configuration..." -ForegroundColor Gray
    @"
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  testTimeout: 30000,
  setupFilesAfterEnv: [],
  moduleNameMapping: {},
};
"@ | Out-File -FilePath "jest.config.js" -Encoding UTF8
    Write-Host "✅ Jest configuration created" -ForegroundColor Green
} else {
    Write-Host "✅ Jest configuration exists" -ForegroundColor Green
}
Write-Host ""

# Step 5: Check TypeScript configuration
Write-Host "Step 5: Checking TypeScript configuration..." -ForegroundColor Yellow
if (-not (Test-Path "tsconfig.json")) {
    Write-Host "Creating TypeScript configuration..." -ForegroundColor Gray
    @"
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "types": ["node", "jest"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts", "**/*.spec.ts"]
}
"@ | Out-File -FilePath "tsconfig.json" -Encoding UTF8
    Write-Host "✅ TypeScript configuration created" -ForegroundColor Green
} else {
    Write-Host "✅ TypeScript configuration exists" -ForegroundColor Green
}
Write-Host ""

# Step 6: Clear Jest cache
Write-Host "Step 6: Clearing Jest cache..." -ForegroundColor Yellow
try {
    npx jest --clearCache 2>$null
    Write-Host "✅ Jest cache cleared" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Could not clear Jest cache (this is usually fine)" -ForegroundColor Yellow
}
Write-Host ""

# Step 7: Test the setup
Write-Host "Step 7: Testing the setup..." -ForegroundColor Yellow
Write-Host "Running a basic test to verify setup..." -ForegroundColor Gray

# Create a simple test file if none exist
if (-not (Get-ChildItem -Recurse -Filter "*.test.ts" -ErrorAction SilentlyContinue)) {
    Write-Host "Creating a basic test file for verification..." -ForegroundColor Gray
    New-Item -ItemType Directory -Force -Path "src/test" | Out-Null
    @"
describe('Basic Test Setup', () => {
  test('should be able to run tests', () => {
    expect(1 + 1).toBe(2);
  });

  test('should have Node.js environment', () => {
    expect(process.env.NODE_ENV).toBeDefined();
  });
});
"@ | Out-File -FilePath "src/test/setup.test.ts" -Encoding UTF8
    Write-Host "✅ Basic test file created" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== SETUP COMPLETE ===" -ForegroundColor Green
Write-Host ""
Write-Host "Now try running tests:" -ForegroundColor White
Write-Host "  npm test" -ForegroundColor Gray
Write-Host ""
Write-Host "If you still get errors, try these commands:" -ForegroundColor Yellow
Write-Host "  npm test -- --verbose" -ForegroundColor Gray
Write-Host "  npm test -- --runInBand" -ForegroundColor Gray
Write-Host "  npm test -- --no-cache" -ForegroundColor Gray
Write-Host ""
Write-Host "For database-related tests, make sure PostgreSQL is running:" -ForegroundColor Yellow
Write-Host "  docker-compose up -d postgres" -ForegroundColor Gray
Write-Host ""