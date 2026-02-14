# Backend Test Commands

## Basic Test Commands

```bash
# Run all tests once (recommended)
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in band (sequentially, good for debugging)
npm test -- --runInBand

# Run specific test file
npm test -- TranslationService.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="should return translation"

# Run tests with verbose output
npm test -- --verbose

# Run tests without cache
npm test -- --no-cache
```

## Property-Based Test Commands

```bash
# Run all property tests
npm test -- property.test.ts

# Run specific property test
npm test -- TranslationService.property.test.ts

# Run property tests with more iterations
npm test -- --testTimeout=30000 property.test.ts
```

## Integration Test Commands

```bash
# Run integration tests (requires database)
npm test -- integration.test.ts

# Run route tests
npm test -- Routes.test.ts

# Run all tests except integration (if database not available)
npm test -- --testPathIgnorePatterns=integration
```

## Debugging Commands

```bash
# Run tests with debug output
npm test -- --verbose --no-coverage

# Run single test file with full output
npm test -- --runInBand --verbose TranslationService.test.ts

# Run tests with Node.js debugging
node --inspect-brk node_modules/.bin/jest --runInBand

# Clear Jest cache and run
npm test -- --clearCache && npm test
```

## Environment-Specific Commands

```bash
# Run tests with test environment
NODE_ENV=test npm test

# Run tests with specific database
DB_NAME=indian_culture_test npm test

# Run tests without database (unit tests only)
npm test -- --testPathIgnorePatterns="integration|database"
```

## Common Issues and Solutions

### Issue 1: Database Connection Failed
```bash
# Solution: Start database first
docker-compose up -d postgres
# Then run tests
npm test
```

### Issue 2: Environment Variables Missing
```bash
# Solution: Copy environment file
cp .env.example .env
# Then run tests
npm test
```

### Issue 3: TypeScript Compilation Errors
```bash
# Solution: Install dependencies and build
npm install
npm run build
npm test
```

### Issue 4: Port Already in Use
```bash
# Solution: Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Then run tests
npm test
```

### Issue 5: Jest Cache Issues
```bash
# Solution: Clear cache
npm test -- --clearCache
npm test
```

## Test Categories

### Unit Tests (Fast, No External Dependencies)
```bash
npm test -- --testPathIgnorePatterns="integration|property"
```

### Property-Based Tests (Medium Speed, Requires More Time)
```bash
npm test -- property.test.ts --testTimeout=30000
```

### Integration Tests (Slow, Requires Database)
```bash
# Make sure database is running first
docker-compose up -d postgres
npm test -- integration.test.ts
```

## Recommended Test Workflow

1. **First Time Setup:**
```bash
npm install
cp .env.example .env
docker-compose up -d postgres
```

2. **Run All Tests:**
```bash
npm test
```

3. **If Tests Fail:**
```bash
# Check specific failing test
npm test -- --verbose FailingTest.test.ts

# Clear cache and retry
npm test -- --clearCache
npm test
```

4. **For Development:**
```bash
# Watch mode for continuous testing
npm run test:watch
```

## Expected Test Results

When all tests pass, you should see:
```
Test Suites: X passed, X total
Tests: Y passed, Y total
Snapshots: 0 total
Time: Zs
```

If you see failures, check:
1. Database is running
2. Environment variables are set
3. Dependencies are installed
4. No port conflicts