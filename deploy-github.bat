@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
cd /d "%~dp0"

rem ==========================================================
rem   Deploy ban tin qua GitHub (push -> GitHub Pages Actions)
rem   - Commit thay doi trong site\ (va cac file cau hinh) roi push len main.
rem   - GitHub Actions se tu build va dua site\ len GitHub Pages.
rem   - KHONG dung credit Netlify, khong can token Netlify.
rem   - Chay tay: bam doi file nay.
rem   - Chay ngam: Task Scheduler dat bien AUTO=1 (can credential GitHub da luu).
rem ==========================================================

echo ==========================================================
echo   Deploy ban tin len GitHub  (-^> GitHub Pages)
echo ==========================================================
if defined AUTO echo Che do: AUTO (chay ngam)
echo.

rem --- 1. Kiem tra Git ---
where git >nul 2>nul
if errorlevel 1 (
  echo [LOI] Chua cai Git. Tai o https://git-scm.com/download/win roi cai lai.
  if not defined AUTO pause
  exit /b 1
)

rem --- 2. Phai la mot git repo ---
git rev-parse --is-inside-work-tree >nul 2>nul
if errorlevel 1 (
  echo [LOI] Thu muc nay khong phai git repo. Kiem tra lai .git.
  if not defined AUTO pause
  exit /b 1
)

rem --- 3. Stage tat ca (netlify-token.txt / log / state da bi .gitignore chan) ---
git add -A

rem --- 4. Neu khong co gi thay doi thi thoi ---
git diff --cached --quiet
if not errorlevel 1 (
  echo Khong co thay doi de commit. Bo qua.
  if not defined AUTO pause
  exit /b 0
)

rem --- 5. Commit ---
git commit -m "auto: cap nhat ban tin (%date% %time%)"
if errorlevel 1 (
  echo [LOI] Commit that bai.
  if not defined AUTO pause
  exit /b 1
)

rem --- 6. Push len nhanh hien tai (mac dinh main) ---
echo Dang push len GitHub...
git push origin HEAD
if errorlevel 1 (
  echo [LOI] Push that bai.
  echo   Nguyen nhan hay gap: chua luu dang nhap GitHub tren may.
  echo   Chay tay lenh:  git push origin HEAD   de dang nhap 1 lan
  echo   ^(Git Credential Manager se nho cho cac lan sau, ke ca chay ngam^).
  if not defined AUTO pause
  exit /b 1
)

echo.
echo ==========================================================
echo   XONG! Da push len GitHub.
echo   GitHub Actions dang build -^> Pages se cap nhat sau ~1-2 phut.
echo   Xem tien trinh: repo GitHub -^> tab "Actions".
echo ==========================================================
if not defined AUTO pause
exit /b 0
