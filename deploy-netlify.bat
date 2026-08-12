@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

rem ==========================================================
rem   Deploy TOAN BO thu muc site\ len Netlify (ban-tin-sang-ai)
rem   - Deploy kieu cong don: day CA cac so cu + so moi.
rem   - Chay tay: bam doi file nay (co the dang nhap trinh duyet).
rem   - Chay ngam: dat bien AUTO=1 (Task Scheduler) + co netlify-token.txt.
rem ==========================================================

set "SITE_ID=9cd6a1ce-278f-4bc3-8d87-c24960e610c3"
set "SITE_NAME=ban-tin-sang-ai"
set "PUBDIR=site"

echo ==========================================================
echo   Deploy ban tin len Netlify  (%SITE_NAME%)
echo ==========================================================
echo Thu muc site: %CD%\%PUBDIR%
if defined AUTO echo Che do: AUTO (chay ngam)
echo.

rem --- 1. Kiem tra Node.js ---
where node >nul 2>nul
if errorlevel 1 (
  echo [LOI] Chua cai Node.js. Tai o https://nodejs.org  ^(ban LTS^), cai xong chay lai.
  if not defined AUTO pause
  exit /b 1
)

rem --- 2. Kiem tra thu muc site\ va co index.html ---
if not exist "%PUBDIR%\index.html" (
  echo [LOI] Khong thay %PUBDIR%\index.html.
  echo Hay chay 1-tai-ve-site.bat truoc de co day du cac so, roi chay lai file nay.
  if not defined AUTO pause
  exit /b 1
)

rem --- Dem so file .html trong site\ ---
set /a N=0
for %%F in ("%PUBDIR%\*.html") do set /a N+=1
echo Tim thay %N% file .html trong %PUBDIR%\  ^(gom index + cac so^).
if %N% LSS 2 (
  echo [CANH BAO] Chi co %N% file .html — co the thieu cac so cu.
  if defined AUTO (
    echo [AUTO] Dung deploy de tranh ghi de thieu bai. Hay kiem tra site\.
    exit /b 1
  )
  set /p GO=Van tiep tuc deploy? [y/N]:
  if /I not "!GO!"=="y" (
    echo Da huy.
    pause
    exit /b 1
  )
)

rem --- 3. Token tu netlify-token.txt neu co ---
set "NETLIFY_AUTH_TOKEN="
if exist "netlify-token.txt" set /p NETLIFY_AUTH_TOKEN=<netlify-token.txt

rem --- 4. Xac thuc ---
if not defined NETLIFY_AUTH_TOKEN (
  echo Kiem tra dang nhap Netlify...
  call npx --yes netlify-cli api getCurrentUser >nul 2>nul
  if errorlevel 1 (
    if defined AUTO (
      echo [LOI][AUTO] Chua dang nhap va khong co netlify-token.txt.
      echo   Tao Personal Access Token o Netlify -^> luu vao netlify-token.txt de chay ngam.
      exit /b 1
    )
    echo Chua dang nhap. Se mo trinh duyet de ban dang nhap Netlify...
    echo   -^> Nho dang nhap dung tai khoan so huu site "%SITE_NAME%".
    call npx --yes netlify-cli login
  ) else (
    echo Da dang nhap. OK.
  )
)

rem --- 5. Deploy CA thu muc site\ len production ---
echo.
echo Dang deploy toan bo %PUBDIR%\ len production...
if defined NETLIFY_AUTH_TOKEN (
  call npx --yes netlify-cli deploy --prod --dir "%PUBDIR%" --site "%SITE_ID%" --auth "%NETLIFY_AUTH_TOKEN%"
) else (
  call npx --yes netlify-cli deploy --prod --dir "%PUBDIR%" --site "%SITE_ID%"
)
set "RC=%errorlevel%"

echo.
if "%RC%"=="0" (
  echo ==========================================================
  echo   XONG! Xem tai: https://%SITE_NAME%.netlify.app
  echo ==========================================================
) else (
  echo [LOI] Deploy that bai. ^(Unauthorized = sai tai khoan / token^)
)
if not defined AUTO pause
exit /b %RC%
