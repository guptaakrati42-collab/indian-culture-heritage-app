# Database Migration Guide

This guide explains how to manage database schema changes and migrations for the Indian Culture App.

## Table of Contents

1. [Overview](#overview)
2. [Migration Files](#migration-files)
3. [Running Migrations](#running-migrations)
4. [Creating New Migrations](#creating-new-migrations)
5. [Rollback Procedures](#rollback-procedures)
6. [Best Practices](#best-practices)
7. [Troubleshooting](#troubleshooting)

## Overview

The Indian Culture App uses SQL-based migrations to manage database schema changes. Migrations are versioned and executed in order to ensure consistent database state across all environments.

### Migration Strategy

- **Sequential numbering**: Migrations are numbered (001, 002, 003, etc.)
- **Idempotent**: Migrations can be run multiple times safely
- **Forward-only**: No automatic rollback (manual rollback scripts provided)
- **Version control**: All migrations are committed to Git

## Migration Files

### Location

All migration files are located in:
```
backend/migrations/
```

### Current Migrations

| File | Description | Dependencies |
|------|-------------|--------------|
| `001_create_languages_table.sql` | Creates languages table and seeds 23 languages | None |
| `002_create_cities_table.sql` | Creates cities table with indexes | 001 |
| `003_create_heritage_items_table.sql` | Creates heritage_items table | 002 |
| `004_create_translations_table.sql` | Creates translations table with full-text search | 001, 002, 003 |
| `005_create_images_table.sql` | Creates images table | 003 |
| `006_enhance_images_table.sql` | Adds location and period fields to images | 005 |

### Migration File Structure

Each migration file follows this structure:

```sql
-- Migration: [Number]_[description]
-- Description: [Detailed description of changes]
-- Dependencies: [List of required migrations]
-- Date: [Creation date]

-- Check if already applied (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'table_name') THEN
        -- Migration code here
    END IF;
END $$;
```

## Running Migrations

### Automatic Migration (Docker)

When using Docker Compose, migrations run automatically on database initialization:

```bash
docker-compose up -d
```

The PostgreSQL container mounts the migrations directory to `/docker-entrypoint-initdb.d/`, which automatically executes all `.sql` files in alphabetical order.

### Manual Migration

#### Using npm Script

```bash
cd backend
npm run db:init
```

This runs the initialization script that executes all migrations in order.

#### Using psql Directly

```bash
# Set environment variables
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=indian_culture
export DB_USER=postgres
export DB_PASSWORD=postgres

# Run migrations in order
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/001_create_languages_table.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/002_create_cities_table.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/003_create_heritage_items_table.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/004_create_translations_table.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/005_create_images_table.sql
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/006_enhance_images_table.sql
```

#### Using Migration Script

```bash
cd backend/migrations
bash run-migrations.sh
```

### Verifying Migrations

Check which tables exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- `cities`
- `heritage_items`
- `images`
- `languages`
- `translations`

Check table structure:

```sql
\d+ cities
\d+ heritage_items
\d+ images
\d+ languages
\d+ translations
```

## Creating New Migrations

### Step 1: Determine Migration Number

Find the highest existing migration number and increment:

```bash
ls backend/migrations/ | grep -E '^[0-9]+' | sort -n | tail -1
```

### Step 2: Create Migration File

Create a new file with the next number:

```bash
touch backend/migrations/007_your_migration_name.sql
```

### Step 3: Write Migration

Follow this template:

```sql
-- Migration: 007_your_migration_name
-- Description: Detailed description of what this migration does
-- Dependencies: 001, 002, 003, 004, 005, 006
-- Date: 2024-02-13

-- Make migration idempotent
DO $$
BEGIN
    -- Check if change already applied
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'your_table' 
        AND column_name = 'your_column'
    ) THEN
        -- Apply changes
        ALTER TABLE your_table ADD COLUMN your_column VARCHAR(255);
        
        -- Create indexes if needed
        CREATE INDEX idx_your_table_your_column ON your_table(your_column);
        
        -- Add comments
        COMMENT ON COLUMN your_table.your_column IS 'Description of column';
    END IF;
END $$;
```

### Step 4: Test Migration

Test in development environment:

```bash
# Create test database
createdb indian_culture_test

# Run all migrations including new one
psql -d indian_culture_test -f migrations/001_create_languages_table.sql
# ... run all migrations
psql -d indian_culture_test -f migrations/007_your_migration_name.sql

# Verify changes
psql -d indian_culture_test -c "\d+ your_table"

# Test idempotency - run again
psql -d indian_culture_test -f migrations/007_your_migration_name.sql

# Clean up
dropdb indian_culture_test
```

### Step 5: Create Rollback Script

Create a corresponding rollback script:

```bash
touch backend/migrations/rollback/007_rollback_your_migration_name.sql
```

Rollback script template:

```sql
-- Rollback: 007_your_migration_name
-- Description: Reverts changes from migration 007
-- Date: 2024-02-13

BEGIN;

-- Revert changes in reverse order
DROP INDEX IF EXISTS idx_your_table_your_column;
ALTER TABLE your_table DROP COLUMN IF EXISTS your_column;

COMMIT;
```

### Step 6: Update Documentation

Update this guide and the migrations README:

```bash
# Edit backend/migrations/README.md
# Add entry for new migration
```

## Rollback Procedures

### Manual Rollback

Rollback scripts are located in `backend/migrations/rollback/`.

To rollback a specific migration:

```bash
psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f migrations/rollback/007_rollback_your_migration_name.sql
```

### Rollback Strategy

1. **Create database backup** before rollback
2. **Test rollback** in staging environment first
3. **Execute rollback** in production during maintenance window
4. **Verify data integrity** after rollback
5. **Restore from backup** if rollback fails

### Emergency Rollback

If a migration causes critical issues:

1. **Stop application** to prevent data corruption
2. **Create immediate backup**
3. **Restore from last known good backup**
4. **Investigate issue** in development environment
5. **Create fix migration** or corrected rollback
6. **Test thoroughly** before redeploying

## Best Practices

### Writing Migrations

1. **Make migrations idempotent**
   - Check if changes already exist
   - Use `IF NOT EXISTS` clauses
   - Safe to run multiple times

2. **Keep migrations small**
   - One logical change per migration
   - Easier to test and rollback
   - Clearer version history

3. **Use transactions**
   - Wrap changes in BEGIN/COMMIT
   - Automatic rollback on error
   - Maintains data consistency

4. **Add indexes carefully**
   - Create indexes CONCURRENTLY in production
   - Consider impact on write performance
   - Test with production-like data volume

5. **Document everything**
   - Clear description of changes
   - List dependencies
   - Explain reasoning

### Testing Migrations

1. **Test in development first**
   - Run on local database
   - Verify expected changes
   - Test rollback script

2. **Test with production-like data**
   - Use anonymized production data
   - Test performance impact
   - Verify data integrity

3. **Test idempotency**
   - Run migration multiple times
   - Verify no errors or duplicates
   - Check data consistency

4. **Test rollback**
   - Verify rollback script works
   - Check data is restored correctly
   - Test re-applying migration after rollback

### Deployment

1. **Backup before migration**
   ```bash
   pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME -F c -f backup_pre_migration.dump
   ```

2. **Run during maintenance window**
   - Schedule during low traffic
   - Notify users of maintenance
   - Have rollback plan ready

3. **Monitor during migration**
   - Watch for errors
   - Monitor database performance
   - Check application logs

4. **Verify after migration**
   - Run verification queries
   - Test application functionality
   - Monitor for issues

### Version Control

1. **Never modify existing migrations**
   - Create new migration to fix issues
   - Maintain migration history
   - Preserve reproducibility

2. **Commit migrations with code changes**
   - Keep schema and code in sync
   - Review migrations in pull requests
   - Tag releases with migration version

3. **Document breaking changes**
   - Note in migration file
   - Update API documentation
   - Communicate to team

## Troubleshooting

### Migration Failed to Apply

**Symptoms:**
- Error messages during migration
- Tables not created
- Application fails to start

**Solutions:**

1. Check error message:
```bash
psql -d $DB_NAME -f migrations/XXX_migration.sql 2>&1 | tee migration_error.log
```

2. Verify dependencies:
```sql
-- Check if required tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';
```

3. Check for syntax errors:
```bash
# Validate SQL syntax
psql -d $DB_NAME --single-transaction --set ON_ERROR_STOP=on -f migrations/XXX_migration.sql
```

4. Verify permissions:
```sql
-- Check user permissions
SELECT * FROM information_schema.role_table_grants WHERE grantee = 'your_user';
```

### Migration Applied Partially

**Symptoms:**
- Some changes applied, others not
- Inconsistent database state
- Application errors

**Solutions:**

1. Check what was applied:
```sql
-- Inspect table structure
\d+ table_name

-- Check for indexes
\di

-- Check for constraints
\d+ table_name
```

2. Manually complete migration:
```sql
-- Apply missing changes manually
-- Use migration file as reference
```

3. Or rollback and retry:
```bash
# Rollback partial changes
psql -d $DB_NAME -f migrations/rollback/XXX_rollback.sql

# Retry migration
psql -d $DB_NAME -f migrations/XXX_migration.sql
```

### Migrations Out of Order

**Symptoms:**
- Dependencies not met
- Foreign key errors
- Missing tables/columns

**Solutions:**

1. Check migration order:
```bash
ls -1 backend/migrations/*.sql
```

2. Verify execution order:
```sql
-- Check table creation timestamps
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

3. Re-run migrations in correct order:
```bash
# Drop database and start fresh
dropdb $DB_NAME
createdb $DB_NAME

# Run migrations in order
for file in backend/migrations/*.sql; do
    psql -d $DB_NAME -f "$file"
done
```

### Performance Issues After Migration

**Symptoms:**
- Slow queries
- High CPU usage
- Timeouts

**Solutions:**

1. Analyze query performance:
```sql
EXPLAIN ANALYZE SELECT * FROM your_table WHERE your_column = 'value';
```

2. Check for missing indexes:
```sql
-- Find tables without indexes
SELECT schemaname, tablename 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename NOT IN (
    SELECT tablename FROM pg_indexes WHERE schemaname = 'public'
);
```

3. Update statistics:
```sql
ANALYZE your_table;
```

4. Rebuild indexes:
```sql
REINDEX TABLE your_table;
```

### Docker Migration Issues

**Symptoms:**
- Migrations not running in Docker
- Database empty after container start
- Permission errors

**Solutions:**

1. Check volume mounts:
```bash
docker-compose config | grep -A 5 volumes
```

2. Verify migration files in container:
```bash
docker-compose exec postgres ls -la /docker-entrypoint-initdb.d/
```

3. Check container logs:
```bash
docker-compose logs postgres
```

4. Manually run migrations in container:
```bash
docker-compose exec postgres psql -U postgres -d indian_culture -f /docker-entrypoint-initdb.d/001_create_languages_table.sql
```

## Migration Checklist

Before deploying a new migration:

- [ ] Migration file created with correct number
- [ ] Migration is idempotent
- [ ] Dependencies documented
- [ ] Rollback script created
- [ ] Tested in development environment
- [ ] Tested with production-like data
- [ ] Tested idempotency (run twice)
- [ ] Tested rollback script
- [ ] Performance impact assessed
- [ ] Documentation updated
- [ ] Code review completed
- [ ] Backup plan prepared
- [ ] Maintenance window scheduled
- [ ] Team notified

## Support

For migration issues:
- Review this guide
- Check migration file comments
- Consult database logs
- Contact database administrator
