@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem ==========================================================
rem   Dang ky Task Scheduler: chay WATCH deploy MOI KHI DANG NHAP.
rem   -> Tien trinh ngam theo doi site\ va tu deploy trong ~5 giay
rem      khi Cowork tao so moi. Publish NGAY, khong cho lich gio.
rem
rem   Chay file nay 1 lan (bam doi). Neu "Access denied":
rem   bam chuot phai -> "Run as administrator".
rem ==========================================================

set "TASKNAME=BanTin-AutoDeploy-Watch"
set "VBS=%~dp0chay-ngam-watch.vbs"

echo Dang tao scheduled task: %TASKNAME%
echo Chay (ngam, khi dang nhap): %VBS%
echo.

schtasks /Create /F /SC ONLOGON /TN "%TASKNAME%" /TR "wscript.exe \"%VBS%\"" /RL LIMITED

echo.
if errorlevel 1 (
  echo [LOI] Tao task that bai. Thu bam chuot phai file nay -^> Run as administrator.
) else (
  echo [OK] Da tao task WATCH chay khi dang nhap.
  echo   Chay watch ngay bay gio (khong can dang xuat):
  echo       schtasks /Run /TN "%TASKNAME%"
  echo   Kiem tra:  schtasks /Query /TN "%TASKNAME%"
  echo   Xoa neu can: schtasks /Delete /F /TN "%TASKNAME%"
)
echo.
echo GHI CHU: Task cu "BanTin-AutoDeploy-Netlify" (chay theo gio) van giu
echo lam luoi an toan — no idempotent, khong xung dot voi watch.
echo.
pause
