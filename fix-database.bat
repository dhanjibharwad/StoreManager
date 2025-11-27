@echo off
echo Fixing phone column constraint in database...
echo.
echo Please run the following SQL commands in your Supabase SQL Editor:
echo.
type "src\lib\fix-phone-column.sql"
echo.
echo After running the SQL commands, your registration should work properly.
pause