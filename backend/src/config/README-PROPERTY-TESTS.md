# Property-Based Tests for Database Schema

## Overview

This directory contains property-based tests for validating database schema integrity using fast-check.

## Property 14: Data Persistence Round-Trip

**File:** `database-schema.property.test.ts`

**Validates:** Requirements 5.1, 5.2, 5.3, 5.4, 8.1

### What it tests

This property test validates that data can be stored and retrieved correctly (round-trip) for all entity types:

1. **Cities** (Requirement 5.1, 8.1)
   - Stores city data with all fields
   - Retrieves and verifies data matches exactly

2. **Heritage Items** (Requirement 5.2, 8.1)
   - Stores heritage item data linked to cities
   - Verifies referential integrity with CASCADE delete

3. **Translations** (Requirement 5.3, 5.4, 8.1)
   - Stores translations for all 23 supported languages
   - Verifies unique constraint enforcement
   - Tests all entity types and field names

4. **Images** (Requirement 5.3, 8.1)
   - Stores image metadata linked to heritage items
   - Verifies referential integrity with CASCADE delete

### Running the tests

#### Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Ensure PostgreSQL is running and accessible

3. Set up test database environment variables in `.env`:
   ```
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=indian_culture_test
   DB_USER=postgres
   DB_PASSWORD=postgres
   ```

4. Run migrations on the test database:
   ```bash
   npm run db:init
   ```

#### Execute the property tests

Run all property tests:
```bash
npm test -- database-schema.property.test.ts
```

Run with coverage:
```bash
npm test -- database-schema.property.test.ts --coverage
```

### Test Configuration

- **Number of runs:** 100 iterations per property (50 for unique constraint test)
- **Timeout:** 30 seconds per test
- **Test database:** Separate from development database

### Expected Results

All tests should pass, validating:
- ✓ City data round-trip (100 iterations)
- ✓ Heritage item data round-trip with referential integrity (100 iterations)
- ✓ Translation data round-trip for all languages (100 iterations)
- ✓ Image data round-trip with referential integrity (100 iterations)
- ✓ Unique constraint enforcement on translations (50 iterations)

### Troubleshooting

**Database connection errors:**
- Verify PostgreSQL is running
- Check environment variables
- Ensure test database exists

**Timeout errors:**
- Increase timeout in test configuration
- Check database performance
- Verify network connectivity

**Unique constraint failures:**
- This is expected behavior - the test verifies constraints work correctly
- The test catches and validates the error code (23505)
