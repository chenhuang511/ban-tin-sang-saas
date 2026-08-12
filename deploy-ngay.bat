@echo off
rem ==========================================================
rem   deploy-ngay.bat
rem   PUBLISH NGAY LAP TUC: bam doi file nay bat cu luc nao de
rem   commit + push toan bo thay doi trong site\ len GitHub
rem   (GitHub Pages / Cloudflare tu build lai sau ~1-2 phut).
rem   Dung khi muon dua so vua tao len web ngay, khong doi watch/lich.
rem ==========================================================
chcp 65001 >nul
cd /d "%~dp0"
echo ==========================================================
echo   DEPLOY NGAY — dua ban tin moi nhat len web
echo ==========================================================
echo.
call "%~dp0deploy-github.bat"
echo.
echo (Neu bao push that bai vi chua dang nhap GitHub: chay 1 lan
echo    git push origin HEAD
echo  trong thu muc nay de luu dang nhap, sau do watch se tu chay duoc.)
echo.
pause
