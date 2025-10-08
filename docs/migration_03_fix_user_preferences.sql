-- ============================================================================
-- MIGRATION 3: Fix user_preferences table for mode switching
-- Run this in Supabase SQL Editor
-- ============================================================================

-- The user_preferences table was designed with UNIQUE(user_id, preference_category)
-- for multiple rows per user, but interface_mode is stored as a column.
-- This migration adds a UNIQUE constraint on user_id to support upsert operations.

-- Step 1: Drop the old composite unique constraint
ALTER TABLE user_preferences
DROP CONSTRAINT IF EXISTS user_preferences_user_id_preference_category_key;

-- Step 2: Add new unique constraint on just user_id
-- This assumes each user should only have one preferences row
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_preferences_user_id_key'
  ) THEN
    ALTER TABLE user_preferences
    ADD CONSTRAINT user_preferences_user_id_key UNIQUE (user_id);
  END IF;
END $$;

-- Step 3: Clean up any duplicate user_id rows (keep most recent)
-- This will delete older duplicate rows if they exist
DELETE FROM user_preferences a
USING user_preferences b
WHERE a.user_id = b.user_id
  AND a.created_at < b.created_at;

-- Step 4: Verify the constraint was added
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'user_preferences'::regclass
  AND conname LIKE '%user_id%';
