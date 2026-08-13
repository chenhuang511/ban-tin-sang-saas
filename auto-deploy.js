// ==========================================================
//  auto-deploy.js
//  Phat hien MOI thay doi can dua len web (dua tren GIT, khong chi
//  nhin file so) roi tu chay deploy-github.bat de commit + push.
//
//  Vi sao dua tren git: ban cu chi tinh "chu ky" tu cac file
//  YYYY-MM-DD.html nen sua rieng index.html / _muc-luc / bat ky file
//  nao khac se KHONG kich hoat deploy -> trang bia bi lo so moi.
//  Nay: co bat ky thay doi chua commit HOAC commit chua push -> deploy.
//
//  Cach dung:
//    node auto-deploy.js            (chay 1 lan, dung cho Task Scheduler)
//    node auto-deploy.js --watch    (theo doi lien tuc, deploy khi co thay doi)
//
//  Log o auto-deploy.log ; khoa chong dung o .deploy.lock
// ==========================================================

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = __dirname;
const SITE = path.join(ROOT, 'site');
const LOG  = path.join(ROOT, 'auto-deploy.log');
const LOCK = path.join(ROOT, '.deploy.lock');
const STATE = path.join(ROOT, '.deploy-state.json');

// Deploy qua GitHub (push -> GitHub Pages Actions + Cloudflare tu build lai).
// Muon quay lai Netlify: doi 'deploy-github.bat' thanh 'deploy-netlify.bat'.
const BAT = path.join(ROOT, 'deploy-github.bat');

const LOCK_STALE_MS = 10 * 60 * 1000; // khoa cu hon 10 phut coi nhu ket -> bo qua
const QUIET_MS = 4 * 60 * 1000;       // neu site/ vua sua trong 4 phut qua -> coi nhu Cowork DANG viet dở, doi lan sau moi deploy (tranh push nham trang bia nua voi)

function log(msg) {
  const line = `[${new Date().toLocaleString('vi-VN')}] ${msg}`;
  console.log(line);
  try { fs.appendFileSync(LOG, line + '\n'); } catch (_) {}
}

// Chay 1 lenh git, tra ve { code, out }
function git(args) {
  const r = spawnSync('git', args, { cwd: ROOT, encoding: 'utf8' });
  return { code: r.status, out: (r.stdout || '').trim(), err: (r.stderr || '').trim() };
}

// Co viec de deploy khong?
//   1) Co file thay doi chua commit (git status --porcelain, bo qua file .gitignore)
//   2) HOAC local di truoc origin/main (commit chua push — tu chua lanh lan truoc push loi)
function pendingWork() {
  const st = git(['status', '--porcelain']);
  if (st.code !== 0) { log('Khong chay duoc "git status" — bo qua lan nay.'); return { work: false, reason: 'git-error' }; }
  const dirty = st.out.length > 0;

  const ahead = git(['rev-list', '--count', 'origin/main..HEAD']);
  const nAhead = ahead.code === 0 ? parseInt(ahead.out || '0', 10) || 0 : 0;

  if (dirty) return { work: true, reason: 'co thay doi chua commit', dirty, nAhead };
  if (nAhead > 0) return { work: true, reason: `${nAhead} commit chua push`, dirty, nAhead };
  return { work: false, reason: 'repo sach & da day len', dirty, nAhead };
}

// Khoa chong watch + scheduler chay dong thoi (tung gay index.lock ket)
function acquireLock() {
  try {
    if (fs.existsSync(LOCK)) {
      const age = Date.now() - fs.statSync(LOCK).mtimeMs;
      if (age < LOCK_STALE_MS) return false;      // dang co tien trinh khac chay
      log('Khoa cu (>10 phut) — coi nhu ket, ghi de.');
    }
    fs.writeFileSync(LOCK, `${process.pid} @ ${new Date().toISOString()}`);
    return true;
  } catch (_) { return true; } // khong khoa duoc thi cu chay, khong chan
}
function releaseLock() { try { fs.unlinkSync(LOCK); } catch (_) {} }

// File site/ moi nhat vua duoc sua cach day bao lau (ms)? Dung de tranh
// deploy khi Cowork con dang viet do (race tung khien index.html bi push nua voi).
function msSinceNewestSiteChange() {
  try {
    let newest = 0;
    for (const name of fs.readdirSync(SITE)) {
      const m = fs.statSync(path.join(SITE, name)).mtimeMs;
      if (m > newest) newest = m;
    }
    return newest ? Date.now() - newest : Infinity;
  } catch (_) { return Infinity; }
}

function saveState(info) {
  try {
    fs.writeFileSync(STATE, JSON.stringify(
      { ...info, deployedAt: new Date().toISOString() }, null, 2));
  } catch (_) {}
}

function runDeploy() {
  log(`Bat dau chay ${path.basename(BAT)} (AUTO)...`);
  const r = spawnSync('cmd.exe', ['/c', BAT], {
    cwd: ROOT,
    env: { ...process.env, AUTO: '1' },
    stdio: ['ignore', 'inherit', 'inherit']
  });
  return r.status === 0;
}

function checkOnce() {
  const p = pendingWork();
  if (!p.work) { log(`Khong co gi de deploy (${p.reason}).`); return; }

  const quietFor = msSinceNewestSiteChange();
  if (quietFor < QUIET_MS) {
    log(`site/ vua sua ${Math.round(quietFor/1000)}s truoc (< ${QUIET_MS/1000}s) — co the Cowork dang viet do, doi lan sau moi deploy.`);
    return;
  }

  if (!acquireLock()) { log('Dang co tien trinh deploy khac chay (co khoa) — bo qua lan nay.'); return; }

  try {
    log(`Phat hien viec can deploy: ${p.reason}.`);
    const ok = runDeploy();

    // Xac nhan da day len THAT SU: local khong con di truoc origin
    const after = git(['rev-list', '--count', 'origin/main..HEAD']);
    const stillAhead = after.code === 0 ? parseInt(after.out || '0', 10) || 0 : -1;

    if (ok && stillAhead === 0) {
      saveState({ status: 'ok', reason: p.reason });
      log('Deploy THANH CONG — da push, local khop origin.');
    } else {
      saveState({ status: 'fail', reason: p.reason, stillAhead });
      log(`Deploy CHUA XONG (batOk=${ok}, con ${stillAhead} commit chua push) — se thu lai lan sau.`);
      process.exitCode = 1;
    }
  } finally {
    releaseLock();
  }
}

function watch() {
  log('Che do --watch: theo doi site\\ (deploy khi co bat ky thay doi noi dung).');
  checkOnce();
  let timer = null;
  const kick = () => { clearTimeout(timer); timer = setTimeout(checkOnce, 5000); };
  fs.watch(SITE, { persistent: true, recursive: false }, kick);
  // Luoi an toan: quet lai moi 10 phut phong khi watch bo lo su kien (mang/OneDrive)
  setInterval(checkOnce, 10 * 60 * 1000);
}

if (process.argv.includes('--watch')) watch();
else checkOnce();
