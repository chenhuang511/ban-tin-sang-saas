// ==========================================================
//  auto-deploy.js
//  Phat hien so bai moi (hoac thay doi) trong site\ roi tu chay
//  deploy-netlify.bat de day len Netlify. Chay ngam (khong bam phim).
//
//  Cach dung:
//    node auto-deploy.js            (chay 1 lan, dung cho Task Scheduler)
//    node auto-deploy.js --watch    (theo doi lien tuc, deploy khi co file moi)
//
//  Trang thai luu o .deploy-state.json ; log o auto-deploy.log
// ==========================================================

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT  = __dirname;
const SITE  = path.join(ROOT, 'site');
const STATE = path.join(ROOT, '.deploy-state.json');
const LOG   = path.join(ROOT, 'auto-deploy.log');
const BAT   = path.join(ROOT, 'deploy-netlify.bat');

function log(msg) {
  const line = `[${new Date().toLocaleString('vi-VN')}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG, line + '\n'); } catch (_) {}
}

// Chi lay cac file so dang YYYY-MM-DD.html (khong tinh index.html)
function issueFiles() {
  if (!fs.existsSync(SITE)) return [];
  return fs.readdirSync(SITE)
    .filter(f => /^\d{4}-\d{2}-\d{2}\.html$/.test(f))
    .sort();
}

// Chu ky = ten + kich thuoc + mtime cua tung so (bat ca truong hop sua noi dung)
function signature(files) {
  return files.map(f => {
    const st = fs.statSync(path.join(SITE, f));
    return `${f}:${st.size}:${Math.floor(st.mtimeMs)}`;
  }).join('|');
}

function loadState() {
  try { return JSON.parse(fs.readFileSync(STATE, 'utf8')); }
  catch (_) { return { sig: '', files: [] }; }
}

function saveState(sig, files) {
  fs.writeFileSync(STATE, JSON.stringify(
    { sig, files, deployedAt: new Date().toISOString() }, null, 2));
}

function runDeploy() {
  log('Bat dau chay deploy-netlify.bat (AUTO)...');
  const r = spawnSync('cmd.exe', ['/c', BAT], {
    cwd: ROOT,
    env: { ...process.env, AUTO: '1' },
    stdio: ['ignore', 'inherit', 'inherit']
  });
  return r.status === 0;
}

function checkOnce() {
  const files = issueFiles();
  if (files.length === 0) { log('Khong co so nao trong site\\ — bo qua.'); return; }

  const sig = signature(files);
  const state = loadState();
  const known = new Set(state.files || []);
  const newOnes = files.filter(f => !known.has(f));

  if (sig === state.sig) {
    log(`Khong co thay doi (${files.length} so). Khong deploy.`);
    return;
  }

  log(`Phat hien thay doi. So moi: ${newOnes.length ? newOnes.join(', ') : '(chi cap nhat noi dung)'}. Tong ${files.length} so.`);
  if (runDeploy()) {
    saveState(sig, files);
    log('Deploy THANH CONG, da cap nhat trang thai.');
  } else {
    log('Deploy THAT BAI — giu nguyen trang thai de lan sau thu lai.');
    process.exitCode = 1;
  }
}

function watch() {
  log('Che do --watch: dang theo doi thu muc site\\ ...');
  checkOnce();
  let timer = null;
  fs.watch(SITE, { persistent: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(checkOnce, 5000); // gom thay doi trong 5s roi kiem tra
  });
}

if (process.argv.includes('--watch')) watch();
else checkOnce();
