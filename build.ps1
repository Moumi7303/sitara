Write-Host "Cleaning old React assets..." -ForegroundColor Yellow
if (Test-Path "backend/public/assets") {
    Remove-Item -Recurse -Force "backend/public/assets"
}
if (Test-Path "backend/public/index.html") {
    Remove-Item -Force "backend/public/index.html"
}

Write-Host "Compiling frontend assets..." -ForegroundColor Yellow
npm run build

# Change to backend directory
if (Test-Path "backend") {
    Set-Location "backend"
}

Write-Host "Pushing backend optimizations..." -ForegroundColor Yellow
php artisan cache:clear
php artisan config:clear
php artisan route:clear
php artisan view:clear
php artisan event:clear

Write-Host "Rebuilding caches..." -ForegroundColor Yellow
php artisan config:cache
php artisan route:cache
php artisan view:cache

Write-Host "Optimizing application..." -ForegroundColor Yellow
php artisan optimize
composer dump-autoload

Write-Host "Build completed successfully!" -ForegroundColor Green
Set-Location ".."
