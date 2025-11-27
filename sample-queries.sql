-- Sample queries for the system

-- 1. Get all companies with their user count
SELECT 
  c.id,
  c.company_name,
  c.email,
  c.status,
  COUNT(u.id) as user_count
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
GROUP BY c.id, c.company_name, c.email, c.status
ORDER BY c.created_at DESC;

-- 2. Get all users for a specific company
SELECT 
  u.id,
  u.name,
  u.email,
  u.role,
  u.department,
  u.status,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE c.id = 'your-company-id-here';

-- 3. Get users by role
SELECT 
  u.name,
  u.email,
  u.role,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.role = 'technician'
ORDER BY c.company_name, u.name;

-- 4. Get company admin users
SELECT 
  u.name,
  u.email,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.role = 'admin';

-- 5. Update user role
UPDATE users 
SET role = 'manager', updated_at = NOW()
WHERE email = 'user@example.com';

-- 6. Deactivate a user
UPDATE users 
SET status = 'inactive', updated_at = NOW()
WHERE email = 'user@example.com';

-- 7. Get active companies with subscription plans
SELECT 
  company_name,
  email,
  subscription_plan,
  created_at
FROM companies
WHERE status = 'active'
ORDER BY created_at DESC;

-- 8. Count users by role for each company
SELECT 
  c.company_name,
  u.role,
  COUNT(*) as count
FROM companies c
JOIN users u ON c.id = u.company_id
WHERE u.status = 'active'
GROUP BY c.company_name, u.role
ORDER BY c.company_name, u.role;