-- Add role column to users table
ALTER TABLE users 
ADD COLUMN role TEXT DEFAULT 'user';

-- Add constraint to validate role values
ALTER TABLE users
ADD CONSTRAINT check_user_role 
CHECK (role IN ('user', 'superadmin', 'rentaladmin', 'eventadmin', 'ecomadmin'));

-- Comment on the role column
COMMENT ON COLUMN users.role IS 'User role for access control (user, superadmin, rentaladmin, eventadmin, ecomadmin)';

-- Update existing users to have 'user' role if null
UPDATE users SET role = 'user' WHERE role IS NULL; 