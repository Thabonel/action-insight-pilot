# How to Apply Database Migrations

Your app is currently broken because the database schema is missing tables and columns that the code expects.

## What's Wrong

The code expects these database structures:
- `user_preferences.interface_mode` column (for mode switching)
- `marketing_autopilot_config` table (for autopilot features)
- `ai_video_projects` and `ai_video_jobs` tables (for AI video generation)

These don't exist in your Supabase database yet, which is why you're seeing errors like:
```
column user_preferences.interface_mode does not exist
Could not find the table 'public.marketing_autopilot_config'
```

## How to Fix

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project
3. Click **SQL Editor** in the left sidebar
4. Click **New query**

### Step 2: Apply Migration 1 (Autopilot System)

1. Open the file: `docs/migration_01_autopilot_system.sql`
2. Copy the entire contents
3. Paste into Supabase SQL Editor
4. Click **Run**
5. You should see: "Success. No rows returned"

This creates:
- ✅ `marketing_autopilot_config` table
- ✅ `autopilot_weekly_reports` table
- ✅ `autopilot_activity_log` table
- ✅ `autopilot_lead_inbox` table
- ✅ `user_preferences.interface_mode` column

### Step 3: Apply Migration 2 (AI Video System)

1. Click **New query** in SQL Editor
2. Open the file: `docs/migration_02_ai_video_system.sql`
3. Copy the entire contents
4. Paste into Supabase SQL Editor
5. Click **Run**
6. You should see: "Success. No rows returned"

This creates:
- ✅ `ai_video_projects` table
- ✅ `ai_video_jobs` table
- ✅ `ai-videos` storage bucket
- ✅ `ai_video_stats` analytics view

**Note:** Gemini API keys are stored in the existing `user_secrets` table (no new columns needed)

### Step 4: Verify

Run this query in SQL Editor to verify everything was created:

```sql
-- Check that all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'marketing_autopilot_config',
    'autopilot_weekly_reports',
    'autopilot_activity_log',
    'autopilot_lead_inbox',
    'ai_video_projects',
    'ai_video_jobs'
  )
ORDER BY table_name;

-- Check that interface_mode column exists
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_preferences'
  AND column_name = 'interface_mode';
```

You should see 6 tables and 1 column listed.

### Step 5: Refresh Your App

1. Go back to your application
2. Hard refresh your browser (Cmd+Shift+R on Mac, Ctrl+Shift+R on Windows)
3. Try switching modes - it should work now!

## Troubleshooting

### "relation already exists" errors

This is fine - it means some tables were already created. The migrations use `CREATE TABLE IF NOT EXISTS` so they're safe to re-run.

### "column already exists" errors

This is also fine - the migrations check for existing columns before adding them.

### Still stuck in Simple Mode after migrations

1. Open browser DevTools (F12)
2. Go to Application tab → Storage → Clear site data
3. Refresh the page
4. Log in again

### Still seeing errors

Check the browser console (F12 → Console tab) and share the exact error message.

## Why SQL Instead of Code?

Database schema (table structure) is separate from application code. Think of it like this:

- **Code** = Instructions for what your app does
- **Database Schema** = The filing cabinet where data is stored

Your code was updated to store mode in `interface_mode` column, but that column doesn't exist in the database yet. Running these SQL migrations creates the "filing cabinet drawers" that the code needs.

This is standard practice in all database-driven applications - schema changes are applied via migrations, not code.
