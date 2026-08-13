@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem ==========================================================
rem   Dang ky Windows Task Scheduler:
rem   Bat dau 07:15, LAP LAI moi 20 phut trong 1 tieng 45 phut (toi ~09:00)
rem   chay run-auto-deploy.bat -> phat hien so moi trong site\ va deploy.
rem
rem   VI SAO LAP LAI: Cowork bat dau tao so luc 07:10 nhung viec tao
rem   (search web + viet) mat 15-60 phut, xong sau 07:15. Neu chi chay
rem   1 lan luc 07:15 thi so hom do CHUA kip tao -> bi bo lo sang hom sau.
rem   deploy-github.bat idempotent: khong co gi moi thi tu bo qua, nen
rem   chay lai nhieu lan la an toan.
rem
rem   Chay file nay 1 lan. Neu bao "Access denied", bam chuot phai
rem   -> "Run as administrator".
rem ==========================================================

set "TASKNAME=BanTin-AutoDeploy-Netlify"
set "RUNNER=%~dp0run-auto-deploy.bat"

echo Dang tao scheduled task: %TASKNAME%
echo Chay: %RUNNER%
echo Lich: bat dau 07:15, lap lai moi 20 phut trong 1 tieng 45 phut (toi ~09:00)
echo.

schtasks /Create /F /SC DAILY /ST 07:15 /RI 20 /DU 01:45 /TN "%TASKNAME%" /TR "\"%RUNNER%\"" /RL LIMITED

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
