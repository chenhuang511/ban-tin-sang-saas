@echo off
rem Runner cho Task Scheduler: chay auto-deploy.js o che do ngam.
chcp 65001 >nul
cd /d "%~dp0"
set AUTO=1
node "%~dp0auto-deploy.js" >> "%~dp0auto-deploy.log" 2>&1
