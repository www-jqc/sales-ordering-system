@echo off
echo ========================================
echo Sales Ordering System Installation
echo ========================================
echo.

echo Installing root dependencies...
npm install

echo.
echo Installing client dependencies...
cd client
npm install
cd ..

echo.
echo Installing server dependencies...
cd server
npm install
cd ..

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Copy config/env.example to .env and configure your database
echo 2. Create MySQL database: sales_ordering_system
echo 3. Run: npm run dev
echo.
echo The system will be available at:
echo - Frontend: http://localhost:3000
echo - Backend: http://localhost:5000
echo.
pause 