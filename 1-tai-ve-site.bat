@echo off
chcp 65001 >nul
cd /d "%~dp0"

rem ==========================================================
rem   Buoc 1: Tai toan bo site hien tai tu Netlify ve thu muc site\
rem   (de co day du cac so cu truoc khi them so moi va deploy lai)
rem ==========================================================

set "BASE=https://ban-tin-sang-ai.netlify.app"

if not exist "site" mkdir "site"

echo Dang tai ve tu %BASE% ...
echo.

curl -s -o "site\index.html"      "%BASE%/"            && echo   [OK] index.html
curl -s -o "site\2026-07-27.html" "%BASE%/2026-07-27"  && echo   [OK] 2026-07-27.html
curl -s -o "site\2026-07-26.html" "%BASE%/2026-07-26"  && echo   [OK] 2026-07-26.html
curl -s -o "site\2026-07-25.html" "%BASE%/2026-07-25"  && echo   [OK] 2026-07-25.html
curl -s -o "site\2026-07-24.html" "%BASE%/2026-07-24"  && echo   [OK] 2026-07-24.html

echo.
echo Danh sach file da tai:
dir /b "site"
echo.
echo Xong buoc 1. Bao lai cho tro ly de dung so moi + sua script deploy.
pause
