@echo off
rem ==========================================================
rem   theo-doi-va-deploy.bat
rem   Chay auto-deploy.js o CHE DO WATCH: theo doi thu muc site\
rem   va tu deploy (git commit + push) trong ~5 giay khi co so moi
rem   hoac khi noi dung so bi sua.
rem
rem   - Chay tay: bam doi file nay (se hien cua so log).
rem   - Chay ngam khi dang nhap: dung chay-ngam-watch.vbs / task scheduler.
rem   Dung tien trinh: dong cua so hoac Ctrl+C.
rem ==========================================================
chcp 65001 >nul
cd /d "%~dp0"
set AUTO=1
echo [%date% %time%] BAT DAU che do WATCH — dang theo doi site\ ... >> "%~dp0auto-deploy.log"
node "%~dp0auto-deploy.js" --watch >> "%~dp0auto-deploy.log" 2>&1
