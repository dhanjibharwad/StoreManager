-- View all users with their verification status
SELECT 
  u.name,
  u.email,
  u.role,
  u.is_email_verified,
  u.is_phone_verified,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
ORDER BY u.created_at DESC;

-- Get unverified users (need to complete registration)
SELECT 
  u.name,
  u.email,
  c.company_name,
  u.created_at
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.is_email_verified = false
ORDER BY u.created_at DESC;

-- Get verified users (can login)
SELECT 
  u.name,
  u.email,
  u.role,
  c.company_name
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE u.is_email_verified = true
ORDER BY c.company_name, u.name;

-- Count users by verification status per company
SELECT 
  c.company_name,
  COUNT(CASE WHEN u.is_email_verified = true THEN 1 END) as verified_users,
  COUNT(CASE WHEN u.is_email_verified = false THEN 1 END) as pending_users,
  COUNT(u.id) as total_users
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
GROUP BY c.id, c.company_name
ORDER BY c.company_name;