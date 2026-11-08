@echo off
setlocal
cd /d "%~dp0"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0generate_portfolio.ps1"
if errorlevel 1 (
  echo.
  echo Portofolio belum berhasil diperbarui.
  pause
  exit /b 1
)
echo.
echo Muat ulang halaman HansStudio dengan Ctrl+R untuk melihat perubahan.
pause
