-- View all users with their company information
SELECT 
  u.id as user_id,
  u.name as user_name,
  u.email as user_email,
  u.role,
  u.department,
  u.phone,
  c.id as company_id,
  c.company_name,
  c.email as company_email
FROM users u
LEFT JOIN companies c ON u.company_id = c.id
ORDER BY c.company_name, u.name;

-- Count users per company
SELECT 
  c.company_name,
  COUNT(u.id) as user_count
FROM companies c
LEFT JOIN users u ON c.id = u.company_id
GROUP BY c.id, c.company_name
ORDER BY user_count DESC;

-- View users for a specific company (replace 'your-company-name' with actual name)
SELECT 
  u.name,
  u.email,
  u.role,
  u.department
FROM users u
JOIN companies c ON u.company_id = c.id
WHERE c.company_name = 'your-company-name';