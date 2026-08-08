# Bản tin sáng về AI cho SaaS — Ngữ cảnh & Vận hành

Tài liệu này ghi lại toàn bộ cách hệ thống "Bản tin sáng" hoạt động, để sau này dễ chỉnh sửa (đặc biệt là **lịch chạy** và **deploy**).

Thư mục gốc dự án: `D:\0-AI\0-Ban-tin\`
Cập nhật lần cuối: 07/08/2026.

> **Thay đổi lớn ngày 07/08/2026:** Đã **chuyển deploy từ Netlify sang GitHub** (đẩy git → GitHub Pages **và** Cloudflare Worker). Lý do: Netlify đổi sang gói tính theo **credit**, hết credit thì production deploy bị chặn (lỗi 403 Forbidden). Xem mục 3 và 10.

---

## 1. Tổng quan — hệ thống làm gì

Mỗi sáng, hệ thống tự động tạo **một số bản tin mới** (tiếng Việt, ~15–20 phút đọc) về 3 mảng: AI trong SaaS, tối ưu quy trình sản xuất phần mềm, và hiện đại hóa hệ thống legacy. Mỗi số là một trang HTML riêng, rồi được **đẩy lên web qua GitHub** để xuất bản.

Trang web (2 nơi, cùng nội dung, tự cập nhật mỗi lần push):

- **Cloudflare Worker:** https://ban-tin-sang-saas.hoangtd-ptd.workers.dev/  (phục vụ `site/` ở tên miền gốc)
- **GitHub Pages:** https://chenhuang511.github.io/ban-tin-sang-saas/  (phục vụ dưới subpath `/ban-tin-sang-saas/`)
- ~~Netlify: https://ban-tin-sang-ai.netlify.app~~ — **tạm ngừng** (hết credit; giữ script để tham khảo).

Repo GitHub: **https://github.com/chenhuang511/ban-tin-sang-saas**

Có **hai bộ lập lịch tách biệt**, chạy nối tiếp nhau:

| Bước | Ai chạy | Khi nào | Làm gì |
| --- | --- | --- | --- |
| 1. Tạo số mới | Scheduled task của **Cowork** (Claude) | 07:00 hằng ngày | Tìm nguồn, viết số mới, ghi `site\YYYY-MM-DD.html` + cập nhật `site\index.html` + `site\_muc-luc-noi-dung.md` |
| 2. Đẩy lên web | **Windows Task Scheduler** trên máy | 07:15 hằng ngày | Phát hiện số mới trong `site\` rồi **commit + push lên GitHub** |
| 3. Build & publish | **GitHub Actions** + **Cloudflare** (trên mây) | tự động sau mỗi push | GitHub Pages build `site/`; Cloudflare Worker chạy `wrangler deploy` phục vụ `site/` |

> ℹ️ Bước 1 và 2 tách nhau vì môi trường tự động của Cowork **không có mạng ra web để deploy**. Cowork chỉ ghi file vào `site\`; việc push do máy tính của bạn lo; việc build/publish do GitHub + Cloudflare lo.

---

## 2. Sơ đồ luồng

```
07:00  Cowork task "ban-tin-sang-ai-saas"
         → WebSearch + web_fetch (tìm & xác minh nguồn)
         → viết site\YYYY-MM-DD.html  (phong cách "artifact", mẫu chuẩn = 2026-07-28.html)
         → thêm 1 thẻ .edcard vào đầu site\index.html, tăng "🗂️ N số"
         → cập nhật site\_muc-luc-noi-dung.md (sổ nội dung)
                         │
                         ▼   (file mới nằm trong site\)
07:15  Windows Task Scheduler  "BanTin-AutoDeploy-Netlify"  (tên cũ, giờ đẩy GitHub)
         → run-auto-deploy.bat
             → node auto-deploy.js   (so sánh với .deploy-state.json)
                 → nếu có file mới/đổi → deploy-github.bat
                     → git add -A && git commit && git push origin HEAD
                         │
                         ▼   (GitHub nhận push)
   ┌─────────────────────────────┴─────────────────────────────┐
   ▼                                                             ▼
GitHub Actions (.github/workflows/deploy-pages.yml)     Cloudflare Worker (git-connected)
   → copy site/ → public/, chèn tiền tố /ban-tin-sang-saas/       → npx wrangler deploy
   → tạo thư mục clean-URL, upload artifact                       → đọc wrangler.toml (assets = ./site/)
   → deploy GitHub Pages                                          → phục vụ site/ ở tên miền gốc
   → https://chenhuang511.github.io/ban-tin-sang-saas/            → https://ban-tin-sang-saas.hoangtd-ptd.workers.dev/
```

---

## 3. Danh sách file & vai trò

| File / thư mục | Vai trò |
| --- | --- |
| `site\` | **Thư mục xuất bản**. Chứa `index.html` (trang bìa/mục lục) + mỗi số là `YYYY-MM-DD.html` + `_muc-luc-noi-dung.md` (sổ nội dung nội bộ). Mô hình **cộng dồn** — không bao giờ xoá số cũ. Cả GitHub Pages lẫn Cloudflare đều publish từ đây. |
| `site\index.html` | Trang bìa/mục lục, liệt kê tất cả các số (thẻ `.edcard`) và bộ đếm "🗂️ N số". |
| `deploy-github.bat` | **(MỚI, đang dùng)** Commit toàn bộ thay đổi trong repo rồi `git push origin HEAD`. Push này kích hoạt cả GitHub Pages lẫn Cloudflare. Chạy tay (bấm đôi) hoặc ngầm (`AUTO=1`). Cần credential GitHub đã lưu trên máy (Git Credential Manager). |
| `.github\workflows\deploy-pages.yml` | **(MỚI)** GitHub Actions: copy `site/` → `public/`, **chèn tiền tố `/ban-tin-sang-saas/`** vào link tuyệt đối, tạo thư mục clean-URL (`YYYY-MM-DD/index.html`), rồi deploy lên GitHub Pages. |
| `wrangler.toml` | **(MỚI)** Cấu hình Cloudflare Worker: `name = ban-tin-sang-saas`, `[assets] directory = ./site/`. Lệnh `npx wrangler deploy` của Worker đọc file này để phục vụ đúng `site/`. |
| `.gitignore` | **(MỚI)** Chặn không đẩy lên GitHub: `netlify-token.txt`, `auto-deploy.log`, `.deploy-state.json`, `node_modules/`. |
| `run-auto-deploy.bat` | Runner mà Task Scheduler gọi; chạy `auto-deploy.js` ở chế độ ngầm, ghi log vào `auto-deploy.log`. |
| `auto-deploy.js` | Phát hiện số mới/đổi trong `site\` (theo chữ ký tên+kích thước+mtime), nếu có thay đổi thì gọi **`deploy-github.bat`** (biến `BAT` ở đầu file — đổi lại `deploy-netlify.bat` nếu muốn quay về Netlify). Có chế độ `--watch`. |
| `dang-ky-task-scheduler.bat` | **Đăng ký** Windows Task Scheduler job. Chạy 1 lần (as administrator). Đặt giờ tại dòng `schtasks ... /ST 07:15`. |
| `deploy-netlify.bat` | **(CŨ, không còn dùng tự động)** Deploy `site\` lên Netlify bằng `netlify-cli`. Giữ lại để tham khảo / dự phòng. |
| `netlify.toml` / `.netlify\` | Cấu hình + cache Netlify (cũ). |
| `netlify-token.txt` | **(CŨ)** Personal Access Token Netlify. ⚠️ Đã **gỡ khỏi git** (07/08) và cho vào `.gitignore`. Token này từng lọt lên GitHub — **nên thu hồi** trên Netlify. |
| `.deploy-state.json` | Trạng thái deploy gần nhất (chữ ký + danh sách số đã push + thời điểm). `auto-deploy.js` dùng để biết có gì mới. |
| `auto-deploy.log` | Log các lần auto-deploy. |
| `1-tai-ve-site.bat` | Tải site cũ từ Netlify về `site\`. ⚠️ Hard-code tới 2026-07-27 — xem mục 9. Nay nguồn khôi phục chính là **git repo GitHub**. |
| `luu-tru\` | Lưu trữ (bản cũ / tư liệu). |
| `.git\` | Kho git; remote `origin` = github.com/chenhuang511/ban-tin-sang-saas. |

**Thông số triển khai hiện tại:**
- GitHub repo: `chenhuang511/ban-tin-sang-saas`, nhánh `main`.
- GitHub Pages: Source = **GitHub Actions** (bật trong Settings → Pages).
- Cloudflare Worker: `ban-tin-sang-saas`, kết nối Git tới repo trên, deploy command `npx wrangler deploy`, phục vụ `./site/` (qua `wrangler.toml`).

---

## 4. Bộ lập lịch 1 — Cowork task (tạo số mới)

- **Tên task:** `ban-tin-sang-ai-saas`
- **Lịch:** 07:00 hằng ngày (cron `0 7 * * *`). *Cowork thêm khoảng trễ điều phối vài phút, nên số thường xong quanh 07:05–07:10.*
- **Đầu ra mỗi lần chạy:**
  - (A) Ghi `site\YYYY-MM-DD.html` + cập nhật `site\index.html` (cộng dồn).
  - (B) Hiển thị/cập nhật artifact `ban-tin-sang-ai-saas` trong Cowork.
  - (C) Kèm phần "📖 Lược dịch chi tiết" cho mỗi bài nguồn.
  - (D) Cập nhật `site\_muc-luc-noi-dung.md` (sổ nội dung để tránh lặp bài/nguồn).
- **Mẫu chuẩn trang số:** copy `<style>` và bố cục từ `site\2026-07-28.html` (phong cách "artifact": backbar, masthead viền dưới đậm, `.toc`, `.card`, `.tag`, `.stat`, `.takeaway`, `.doslist`, `.refs`, `.dich`).
- **Lưu ý cho người viết số:** trang số dùng link tuyệt đối (`/`, `/YYYY-MM-DD`) — **giữ nguyên**. GitHub Pages tự được workflow chèn tiền tố; Cloudflare phục vụ ở root nên link chạy thẳng.

### Cách đổi lịch/nội dung task Cowork
- Trong Cowork dùng `/schedule` (hoặc nhờ trợ lý) để đổi giờ, hoặc sửa prompt của task.
- Đổi giờ = đổi cron. Ví dụ: `0 7 * * *` = 07:00 mỗi ngày; `30 6 * * *` = 06:30; `0 8 * * 1-5` = 08:00 các ngày trong tuần.

---

## 5. Bộ lập lịch 2 — Windows Task Scheduler (đẩy GitHub)

- **Tên task Windows:** `BanTin-AutoDeploy-Netlify` (tên cũ giữ nguyên cho khỏi phải đăng ký lại; **thực chất giờ đẩy GitHub**).
- **Lịch hiện tại:** 07:15 hằng ngày.
- **Chạy:** `run-auto-deploy.bat` → `auto-deploy.js` → (nếu có số mới) `deploy-github.bat` → `git push`.
- **Đăng ký lần đầu:** chạy `dang-ky-task-scheduler.bat` (chuột phải → *Run as administrator*).

### Cách đổi giờ deploy
Giờ nằm ở **2 nơi**, đổi cả hai cho nhất quán:

1. **Task đang chạy trên máy** — *Command Prompt (Run as administrator)*:
   ```
   schtasks /Change /TN "BanTin-AutoDeploy-Netlify" /ST 07:15
   ```
2. **File đăng ký** `dang-ky-task-scheduler.bat` — sửa dòng `schtasks /Create ... /ST 07:15 ...`.

### Kiểm tra / chạy thử / xoá task Windows
```
schtasks /Query  /TN "BanTin-AutoDeploy-Netlify" /FO LIST      (xem chi tiết)
schtasks /Run    /TN "BanTin-AutoDeploy-Netlify"               (chạy thử ngay)
schtasks /Delete /F /TN "BanTin-AutoDeploy-Netlify"            (xoá task)
```

### Điều kiện để push ngầm chạy được
`git push` ngầm cần credential GitHub đã lưu trên máy (Git Credential Manager). **Chạy tay `deploy-github.bat` một lần** và đăng nhập GitHub — từ đó các lần ngầm sẽ tự push. Nếu đổi máy/mật khẩu, chạy tay lại một lần.

---

## 6. Cơ chế phát hiện số mới (auto-deploy.js)

- Chỉ xét file dạng `YYYY-MM-DD.html` trong `site\` (bỏ qua `index.html`).
- Tính **chữ ký** = danh sách `tên:kích_thước:mtime` từng số. Khác `.deploy-state.json` → có thay đổi → deploy. Nhờ mtime nên **sửa nội dung số cũ** cũng kích hoạt.
- Deploy thành công mới lưu trạng thái mới; lỗi thì giữ nguyên để lần sau thử lại.
- Biến `BAT` ở đầu `auto-deploy.js` quyết định script deploy: hiện là `deploy-github.bat`. Đổi thành `deploy-netlify.bat` để quay về Netlify.
- Chạy: `node auto-deploy.js` (1 lần) hoặc `node auto-deploy.js --watch` (theo dõi liên tục).

---

## 7. Hạ tầng publish (mây)

### GitHub Pages
- Bật ở repo → **Settings → Pages → Source = "GitHub Actions"**.
- Workflow `.github/workflows/deploy-pages.yml` chạy mỗi khi push đụng `site/**`. Nó chèn tiền tố `/ban-tin-sang-saas/` vào link tuyệt đối (vì Project Pages phục vụ dưới subpath) và tạo thư mục clean-URL để link không đuôi `.html` vẫn mở được.
- Nếu build lỗi 404 "Ensure GitHub Pages has been enabled" → chưa bật Source = GitHub Actions.

### Cloudflare Worker
- Là **Worker** (không phải Pages cổ điển), kết nối Git tới repo; deploy command `npx wrangler deploy`.
- Đọc `wrangler.toml` (`[assets] directory = ./site/`) → phục vụ `site/` ở tên miền gốc; tự hiểu URL không đuôi `.html`. Không cần tiền tố.
- Nếu trang gốc ra nhầm 1 bài cũ → thiếu/hỏng `wrangler.toml` (nó sẽ phục vụ nhầm gốc repo).

---

## 8. Thao tác thủ công thường dùng

- **Deploy tay ngay bây giờ:** bấm đôi `deploy-github.bat` (commit + push). GitHub + Cloudflare tự build sau ~1–2 phút.
- **Xem log deploy:** mở `auto-deploy.log`.
- **Xem tiến trình build:** GitHub → tab **Actions**; Cloudflare → project → **Deployments**.
- **Khôi phục về máy mới:** clone lại repo GitHub (nguồn khôi phục chính), rồi chạy `deploy-github.bat` khi có thay đổi.

---

## 9. Việc cần lưu ý / nợ kỹ thuật

- ⚠️ **Thu hồi token Netlify cũ** (`netlify-token.txt`) trên Netlify — nó từng nằm trong lịch sử git công khai. Đã gỡ khỏi tracking + `.gitignore` từ 07/08, nhưng lịch sử cũ vẫn còn dấu vết.
- ⚠️ `1-tai-ve-site.bat` hard-code danh sách tải về tới `2026-07-27`. Nay **nguồn khôi phục chính là git repo** — file này gần như không cần nữa.
- ⚠️ Push ngầm cần Git Credential Manager đã lưu đăng nhập (xem mục 5).
- Netlify: gói credit-based, hết credit thì production deploy bị chặn (403). Muốn dùng lại: nạp credit/nâng cấp, đổi biến `BAT` trong `auto-deploy.js` về `deploy-netlify.bat`.
- `deploy-github.bat` dùng `git add -A`; `.gitignore` đã chặn token/log/state nên không lo lộ bí mật.

---

## 10. Lịch sử thay đổi

- **07/08/2026:** **Chuyển deploy Netlify → GitHub** (push git → GitHub Pages + Cloudflare Worker). Thêm `deploy-github.bat`, `.github/workflows/deploy-pages.yml`, `wrangler.toml`, `.gitignore`. `auto-deploy.js` gọi `deploy-github.bat`. Gỡ `netlify-token.txt` khỏi git. Lý do: Netlify chuyển sang gói tính theo credit, hết credit → 403 Forbidden. Cập nhật README này.
- **05/08/2026:** Đổi giờ tạo số 07:30 → **07:00**; giờ deploy 07:50 → **07:15**. Gỡ bước lưu Notion khỏi task Cowork. Viết README.
- **Trước đó:** Cowork tạo số 07:30, Windows deploy Netlify 07:50; có lưu Notion.
