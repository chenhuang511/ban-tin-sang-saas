# Chuyển "Bản tin sáng AI/SaaS" sang máy khác — Hướng dẫn dựng lại

Mục tiêu: máy mới cũng tự tạo số mỗi sáng (bằng Cowork/Claude) rồi tự đẩy lên web.
Hệ thống gồm **2 phần độc lập**, dựng phần nào chạy phần đó:

- **Phần A — Sinh nội dung** (Cowork/Claude): tạo số HTML + cập nhật index + sổ nội dung. *Không cần mạng deploy.*
- **Phần B — Xuất bản** (máy tính): phát hiện số mới → git push → GitHub Pages + Cloudflare tự build.

> Tài liệu chi tiết cơ chế vận hành: xem `README.md`. File này chỉ tập trung việc **PORT sang máy mới**.

---

## 0. Cái gì phụ thuộc máy (phải đổi khi chuyển)

| Hạng mục | Ở đâu | Đổi thành gì |
| --- | --- | --- |
| Đường dẫn thư mục dự án | prompt Cowork + các file `.bat` | Đường dẫn trên máy mới (vd `C:\banthin\`) |
| Thư mục xuất bản `PUBLISH_DIR` | KHỐI CẤU HÌNH trong `ban-tin-prompt-portable.md` | `...\site` trên máy mới |
| Tài khoản GitHub + remote `origin` | `.git` của repo | Repo GitHub của bạn |
| Cloudflare Worker (tùy chọn) | `wrangler.toml` + kết nối Git | Worker của bạn (hoặc bỏ) |
| Giờ chạy | cron task Cowork + `schtasks /ST` | Giờ mong muốn |
| Credential GitHub | Git Credential Manager trên máy | Đăng nhập 1 lần |

Mọi giá trị phụ thuộc máy trong **prompt** đã được gom vào 1 chỗ: **KHỐI CẤU HÌNH** ở đầu `ban-tin-prompt-portable.md`. Sang máy mới chỉ sửa khối đó.

---

## 1. Chuẩn bị máy mới (prerequisites)

- **Git** + đã đăng nhập GitHub (Git Credential Manager). Kiểm tra: `git --version`.
- **Node.js** (chạy `auto-deploy.js` và `wrangler`). Kiểm tra: `node --version`.
- **Cowork (Claude desktop)** đã cài, đã đăng nhập, và **đã cấp quyền truy cập thư mục dự án** (chọn folder trong Cowork).
- Tài khoản **GitHub** (bắt buộc, để publish) và **Cloudflare** (tùy chọn, nếu muốn tên miền gốc không subpath).
- Windows: quyền chạy **Task Scheduler** (Run as administrator).
  _Máy Mac/Linux: thay Windows Task Scheduler bằng `cron`/`launchd` gọi cùng `auto-deploy.js` — xem mục 6._

---

## 2. Lấy toàn bộ dự án về máy mới

Cách nhanh nhất (khuyến nghị) — **clone repo GitHub**, vì nó có sẵn tất cả số cũ, template style, và sổ nội dung:

```
git clone https://github.com/<user>/<repo>.git   D:\<đường-dẫn-mới>
```

Repo hiện tại: `https://github.com/chenhuang511/ban-tin-sang-saas` (nếu bạn dùng lại repo này thì cần quyền push; nếu không, tạo repo mới và đổi remote — xem mục 4).

Sau khi clone, bạn có: `site\` (index.html + các số + `_muc-luc-noi-dung.md`), các file `.bat`, `auto-deploy.js`, `wrangler.toml`, `.github\workflows\`.

> Nếu KHÔNG clone mà bắt đầu trắng: tối thiểu phải copy tay 4 thứ vào `PUBLISH_DIR` để phần A chạy đúng phong cách: `index.html`, `2026-07-28.html` (STYLE_BASE), `2026-08-14.html` (STYLE_DEEP), `_muc-luc-noi-dung.md`.

---

## 3. Dựng Phần A — tác vụ Cowork sinh số

1. Mở `ban-tin-prompt-portable.md`, sửa **KHỐI CẤU HÌNH** cho khớp máy mới (quan trọng nhất: `PUBLISH_DIR`).
2. Trong Cowork, tạo scheduled task mới: gõ `/schedule` (hoặc nhờ trợ lý "tạo scheduled task chạy 07:00 mỗi ngày với prompt sau…").
   - **Tên task:** `ban-tin-sang-ai-saas` (hoặc tên bạn muốn — nhớ khớp `ARTIFACT_ID` nếu muốn artifact liền mạch).
   - **Cron:** `SCHEDULE_CRON` trong khối cấu hình (mặc định `0 7 * * *`).
   - **Prompt:** dán TOÀN BỘ phần "PROMPT TÁC VỤ" (mọi `{BIẾN}` sẽ được đọc từ khối cấu hình dán kèm ở đầu, hoặc bạn thay tay các `{BIẾN}` bằng giá trị thật trước khi dán).
3. Chạy thử: bấm **"Run now"** một lần để (a) kiểm tra tạo file đúng chỗ, (b) **pre-approve** các quyền công cụ (WebSearch, web_fetch, ghi file) để lần chạy tự động lúc 07:00 không bị dừng hỏi quyền.

> Lưu ý: file `SKILL.md` trong thư mục Scheduled của Cowork là **chỉ đọc** — muốn sửa nội dung tác vụ thì sửa **prompt của task** (qua `/schedule` hoặc nhờ trợ lý), không sửa file.

---

## 4. Dựng Phần B — publish qua GitHub

1. **Trỏ remote về repo của bạn** (nếu tạo repo mới):
   ```
   git remote set-url origin https://github.com/<user>/<repo>.git
   git push -u origin main
   ```
2. **Bật GitHub Pages:** repo → Settings → Pages → **Source = "GitHub Actions"**. Workflow `.github/workflows/deploy-pages.yml` đã có sẵn (nó chèn tiền tố subpath `/<repo>/` — nếu đổi tên repo, sửa tiền tố này trong workflow).
3. **Đăng nhập credential 1 lần:** bấm đôi `deploy-github.bat`, đăng nhập GitHub khi được hỏi. Từ đó push ngầm mới chạy được.
4. **(Tùy chọn) Cloudflare Worker** để phục vụ ở tên miền gốc (không subpath): tạo Worker, kết nối Git tới repo, deploy command `npx wrangler deploy`; `wrangler.toml` đã trỏ `[assets] directory = ./site/`. Đổi `name` trong `wrangler.toml` thành tên Worker của bạn. Nếu không cần, bỏ qua — chỉ dùng GitHub Pages là đủ.

---

## 5. Đăng ký lịch đẩy (Windows Task Scheduler)

1. Mở `dang-ky-task-scheduler.bat`, kiểm tra/sửa đường dẫn dự án và giờ (`/ST 07:15` — nên đặt **sau** giờ tạo số vài phút).
2. Chuột phải `dang-ky-task-scheduler.bat` → **Run as administrator** (đăng ký 1 lần).
3. Kiểm tra & chạy thử:
   ```
   schtasks /Query /TN "BanTin-AutoDeploy-Netlify" /FO LIST
   schtasks /Run   /TN "BanTin-AutoDeploy-Netlify"
   ```
   (Tên task Windows có thể giữ nguyên hoặc đổi; nếu đổi thì sửa trong file `.bat` cho khớp.)

---

## 6. Nếu máy mới là Mac/Linux (không có Task Scheduler)

Phần A (Cowork) chạy y hệt. Phần B thay Windows Task Scheduler bằng cron:

- Đảm bảo `auto-deploy.js` gọi script deploy hợp lệ (biến `BAT` ở đầu file). Trên Mac/Linux nên thay `deploy-github.bat` bằng một script `.sh` làm cùng việc: `git add -A && git commit -m "auto" && git push origin HEAD`.
- Thêm cron: `15 7 * * *  cd /đường-dẫn/dự-án && node auto-deploy.js >> auto-deploy.log 2>&1`
- Đăng nhập GitHub credential 1 lần (`gh auth login` hoặc credential helper) để push ngầm chạy được.

---

## 7. Kiểm tra sau khi dựng (checklist nghiệm thu)

- [ ] Chạy "Run now" task Cowork → xuất hiện file `PUBLISH_DIR\<hôm-nay>.html`, `index.html` tăng 1 số, `_muc-luc-noi-dung.md` có khối mới.
- [ ] Trang số dùng đúng style (có .card/.tag/.mech…), KHÔNG có khối code minh họa.
- [ ] `deploy-github.bat` chạy tay → `git push` thành công (đăng nhập lần đầu OK).
- [ ] GitHub Actions (tab Actions) build xanh; mở URL GitHub Pages thấy số mới.
- [ ] (Nếu dùng) Cloudflare Worker Deployments xanh; URL gốc thấy số mới.
- [ ] Task Cowork + Task Scheduler đều đặt đúng giờ, task Cowork đã pre-approve quyền.

---

## 8. Bẫy thường gặp khi port

- **Sai đường dẫn:** quên đổi `PUBLISH_DIR` trong khối cấu hình → số ghi nhầm chỗ. Đây là lỗi #1 khi chuyển máy.
- **Push ngầm im lặng thất bại:** chưa đăng nhập GitHub credential trên máy mới → chạy tay `deploy-github.bat` một lần.
- **GitHub Pages 404:** chưa bật Source = GitHub Actions, hoặc tiền tố subpath trong workflow không khớp tên repo mới.
- **Cloudflare ra nhầm bài cũ ở trang gốc:** thiếu/hỏng `wrangler.toml` (`[assets] directory = ./site/`).
- **Task Cowork dừng hỏi quyền lúc 07:00:** chưa "Run now" để pre-approve công cụ.
- **Bảo mật:** đừng commit token (repo cũ từng lộ `netlify-token.txt` — đã cho vào `.gitignore`). Kiểm tra `.gitignore` trên máy mới vẫn chặn token/log/state.
