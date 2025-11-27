-- Make phone column optional in users table
ALTER TABLE users ALTER COLUMN phone DROP NOT NULL;

-- Also remove the UNIQUE constraint on phone since null values can cause issues
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_phone_key;

-- Add a new unique constraint that allows multiple null values
-- This ensures that when phone numbers are provided, they must be unique
CREATE UNIQUE INDEX users_phone_unique_idx ON users (phone) WHERE phone IS NOT NULL;