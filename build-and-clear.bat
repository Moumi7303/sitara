@echo off
echo ===================================================
echo     Sitara - Frontend Build ^& Backend Clear
echo ===================================================
echo.

echo [1/5] Clearing backend cache and config...
cd backend
call php artisan cache:clear
call php artisan config:clear
call php artisan route:clear
call php artisan view:clear
call php artisan event:clear
call php artisan optimize:clear

echo.
echo [2/5] Cleaning old React assets from public...
if exist public\assets rmdir /s /q public\assets
if exist public\index.html del /f /q public\index.html
cd ..

echo.
echo [3/5] Building the frontend...
call npm run build

echo.
echo [4/5] Copying new frontend build to backend public folder...
xcopy dist\* backend\public\ /s /e /y

echo.
echo [5/5] Rebuilding backend caches...
cd backend
call php artisan config:cache
call php artisan route:cache
call php artisan view:cache
call php artisan event:cache

echo.
echo Optimizing backend application...
call composer dump-autoload
cd ..

echo.
echo ===================================================
echo     Build and Clear Completed Successfully!
echo ===================================================
pause
