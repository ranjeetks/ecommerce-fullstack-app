#****************************************************************
# ▶️ Run It
# From your backend/ folder run below command in PowerShell in VS code:
# powershell -ExecutionPolicy Bypass -File cleanup.ps1
#*****************************************************************
# cleanup.ps1 - Reset Django migrations & database (safe for dev)

# cleanup.ps1 - Reset Django migrations & SQLite DB (for development only)


Write-Host '🚀 Starting Django cleanup...' -ForegroundColor Cyan

# Find all folders named "migrations" under the current folder
$migrationDirs = Get-ChildItem -Path . -Recurse -Directory | Where-Object { $_.Name -eq 'migrations' }

if (-not $migrationDirs) {
    Write-Host 'ℹ️ No migrations directories found under current folder.' -ForegroundColor Yellow
} else {
    foreach ($dir in $migrationDirs) {
        Write-Host "Processing: $($dir.FullName)" -ForegroundColor Gray

        # Delete migration files except __init__.py
        Get-ChildItem -Path $dir.FullName -File -ErrorAction SilentlyContinue |
            Where-Object { $_.Name -ne '__init__.py' } |
            ForEach-Object {
                Remove-Item -LiteralPath $_.FullName -Force -ErrorAction SilentlyContinue
                Write-Host "  Deleted file: $($_.Name)" -ForegroundColor DarkGray
            }

        # Remove __pycache__ folder inside this migrations folder (if present)
        $pyCache = Join-Path $dir.FullName '__pycache__'
        if (Test-Path $pyCache) {
            Remove-Item -LiteralPath $pyCache -Recurse -Force -ErrorAction SilentlyContinue
            Write-Host "  Deleted __pycache__" -ForegroundColor DarkGray
        }
    }

    Write-Host '✅ Migration files cleaned (kept __init__.py).' -ForegroundColor Green
}

# Optionally delete SQLite DB in project root
if ($DeleteSQLite) {
    $dbPath = Join-Path (Get-Location) 'db.sqlite3'
    if (Test-Path $dbPath) {
        Remove-Item -LiteralPath $dbPath -Force -ErrorAction SilentlyContinue
        Write-Host "✅ Deleted database file: $dbPath" -ForegroundColor Green
    } else {
        Write-Host 'ℹ️ No db.sqlite3 file found, skipping DB delete.' -ForegroundColor Yellow
    }
}
# 3. Reinstall Django (to restore missing migration.py etc.)
Write-Host '🔄 Reinstalling Django inside current venv...' -ForegroundColor Cyan
pip uninstall django -y | Out-Null
pip install django | Out-Null
Write-Host '✅ Django reinstalled successfully.' -ForegroundColor Green

Write-Host ''
Write-Host '🎉 Cleanup completed! Now run the following commands:' -ForegroundColor Cyan
Write-Host '    python manage.py makemigrations' -ForegroundColor White
Write-Host '    python manage.py migrate' -ForegroundColor White
