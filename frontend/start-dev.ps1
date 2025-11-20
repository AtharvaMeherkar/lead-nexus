# PowerShell script to start Vite dev server with proper error handling
$ErrorActionPreference = "Stop"

Write-Host "Starting Vite development server..." -ForegroundColor Cyan

try {
    npm run dev
} catch {
    Write-Host "Error starting Vite: $_" -ForegroundColor Red
    Write-Host "Press any key to exit..."
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
}

