@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem ==========================================================
rem   Dang ky Windows Task Scheduler:
rem   Moi ngay 07:15 chay run-auto-deploy.bat -> phat hien so moi
rem   trong site\ va tu deploy len Netlify.
rem   (Cowork tao so luc 07:00, nen 07:15 de day len Netlify.)
rem
rem   Chay file nay 1 lan. Neu bao "Access denied", bam chuot phai
rem   -> "Run as administrator".
rem ==========================================================

set "TASKNAME=BanTin-AutoDeploy-Netlify"
set "RUNNER=%~dp0run-auto-deploy.bat"

echo Dang tao scheduled task: %TASKNAME%
echo Chay: %RUNNER%
echo Lich: hang ngay luc 07:15
echo.

schtasks /Create /F /SC DAILY /ST 07:15 /TN "%TASKNAME%" /TR "\"%RUNNER%\"" /RL LIMITED

echo.
if errorlevel 1 (
  echo [LOI] Tao task that bai. Thu bam chuot phai file nay -^> Run as administrator.
) else (
  echo [OK] Da tao task. Kiem tra bang lenh:
  echo     schtasks /Query /TN "%TASKNAME%"
  echo Chay thu ngay:
  echo     schtasks /Run /TN "%TASKNAME%"
  echo Xoa task neu can:
  echo     schtasks /Delete /F /TN "%TASKNAME%"
)
echo.
pause
