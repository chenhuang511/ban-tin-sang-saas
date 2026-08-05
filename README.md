# Bản tin sáng về AI cho SaaS — Ngữ cảnh & Vận hành

Tài liệu này ghi lại toàn bộ cách hệ thống "Bản tin sáng" hoạt động, để sau này dễ chỉnh sửa (đặc biệt là **lịch chạy** và **deploy Netlify**).

Thư mục gốc dự án: `D:\0-AI\0-Ban-tin\`
Cập nhật lần cuối: 05/08/2026.

---

## 1. Tổng quan — hệ thống làm gì

Mỗi sáng, hệ thống tự động tạo **một số bản tin mới** (tiếng Việt, ~15–20 phút đọc) về 3 mảng: AI trong SaaS, tối ưu quy trình sản xuất phần mềm, và hiện đại hóa hệ thống legacy. Mỗi số là một trang HTML riêng, rồi được **đẩy lên Netlify** để xuất bản.

Trang web: **https://ban-tin-sang-ai.netlify.app**

Có **hai bộ lập lịch tách biệt**, chạy nối tiếp nhau:

| Bước | Ai chạy | Khi nào | Làm gì |
| --- | --- | --- | --- |
| 1. Tạo số mới | Scheduled task của **Cowork** (Claude) | 07:00 hằng ngày | Tìm nguồn, viết số mới, ghi `site\YYYY-MM-DD.html` + cập nhật `site\index.html` |
| 2. Đẩy lên web | **Windows Task Scheduler** trên máy | 07:15 hằng ngày | Phát hiện số mới trong `site\` rồi deploy toàn bộ `site\` lên Netlify |

> ℹ️ Hai bước tách nhau vì môi trường tự động của Cowork **không có mạng ra Netlify**. Cowork chỉ ghi file vào `site\`; việc publish do máy tính của bạn lo.

---

## 2. Sơ đồ luồng

```
07:00  Cowork task "ban-tin-sang-ai-saas"
         → WebSearch + web_fetch (tìm & xác minh nguồn)
         → viết site\2026-08-05.html  (phong cách "artifact", mẫu chuẩn = 2026-07-28.html)
         → thêm 1 thẻ .edcard vào đầu site\index.html, tăng "🗂️ N số"
         → hiển thị/ cập nhật artifact trong Cowork
                         │
                         ▼   (file mới nằm trong site\)
07:15  Windows Task Scheduler  "BanTin-AutoDeploy-Netlify"
         → run-auto-deploy.bat
             → node auto-deploy.js   (so sánh với .deploy-state.json)
                 → nếu có file mới/đổi → deploy-netlify.bat
                     → npx netlify-cli deploy --prod --dir site
         → https://ban-tin-sang-ai.netlify.app  cập nhật
```

---

## 3. Danh sách file & vai trò

| File / thư mục | Vai trò |
| --- | --- |
| `site\` | **Thư mục xuất bản** (Netlify publish dir). Chứa `index.html` (mục lục) + mỗi số là `YYYY-MM-DD.html`. Mô hình **cộng dồn** — không bao giờ xoá số cũ. |
| `site\index.html` | Trang bìa/mục lục, liệt kê tất cả các số (thẻ `.edcard`) và bộ đếm "🗂️ N số". |
| `dang-ky-task-scheduler.bat` | **Đăng ký** Windows Task Scheduler job đẩy Netlify. Chạy 1 lần (as administrator). Đặt giờ tại dòng `schtasks ... /ST 07:15`. |
| `run-auto-deploy.bat` | Runner mà Task Scheduler gọi; chạy `auto-deploy.js` ở chế độ ngầm, ghi log vào `auto-deploy.log`. |
| `auto-deploy.js` | Phát hiện số mới/đổi trong `site\` (theo chữ ký tên+kích thước+mtime), nếu có thay đổi thì gọi `deploy-netlify.bat`. Có chế độ `--watch`. |
| `deploy-netlify.bat` | Thực thi deploy toàn bộ `site\` lên Netlify bằng `netlify-cli`. Chạy tay (bấm đôi) hoặc ngầm (`AUTO=1` + token). |
| `1-tai-ve-site.bat` | Tải toàn bộ site hiện có từ Netlify về `site\` (dùng khi khôi phục/di chuyển máy để có đủ số cũ trước khi deploy lại). ⚠️ Danh sách file tải về đang **hard-code** tới 2026-07-27 — xem mục 8. |
| `netlify.toml` | Cấu hình Netlify: `publish = "site"`. |
| `netlify-token.txt` | **Personal Access Token** của Netlify (để chạy ngầm không cần đăng nhập trình duyệt). ⚠️ Bí mật — không commit công khai, không chia sẻ. |
| `.deploy-state.json` | Trạng thái deploy gần nhất (chữ ký + danh sách số đã deploy + thời điểm). `auto-deploy.js` dùng để biết có gì mới. |
| `auto-deploy.log` | Log các lần auto-deploy. |
| `.netlify\` | Cache/liên kết site do netlify-cli tạo. |
| `luu-tru\` | Lưu trữ (bản cũ / tư liệu). |
| `.git\` | Kho git của dự án. |

**Thông số Netlify (trong `deploy-netlify.bat`):**
- `SITE_ID` = `9cd6a1ce-278f-4bc3-8d87-c24960e610c3`
- `SITE_NAME` = `ban-tin-sang-ai`
- Publish dir = `site`

---

## 4. Bộ lập lịch 1 — Cowork task (tạo số mới)

- **Tên task:** `ban-tin-sang-ai-saas`
- **Lịch:** 07:00 hằng ngày (cron `0 7 * * *`). *Lưu ý: Cowork thêm một khoảng trễ điều phối vài phút khi phát lệnh, nên thực tế số có thể ghi xong quanh 07:05–07:10.*
- **Định nghĩa task (prompt):** `C:\Users\User\Claude\Scheduled\ban-tin-sang-ai-saas\SKILL.md`
- **Đầu ra mỗi lần chạy:**
  - (A) Ghi `site\YYYY-MM-DD.html` + cập nhật `site\index.html` (cộng dồn).
  - (B) Hiển thị/cập nhật artifact `ban-tin-sang-ai-saas` trong Cowork.
  - (C) Kèm phần "📖 Lược dịch chi tiết" cho mỗi bài nguồn (trong trang số).
- **Đã bỏ:** trước đây có lưu Notion — **đã gỡ** khỏi task (05/08/2026). Không còn tạo trang Notion.
- **Mẫu chuẩn trang số:** copy `<style>` và bố cục từ `site\2026-07-28.html` (phong cách "artifact/tạp chí": backbar, masthead viền dưới đậm, `.toc`, `.card`, `.tag`, `.stat`, `.takeaway`, `.doslist`, `.refs`, `.dich`).

### Cách đổi lịch/nội dung task Cowork
- Trong Cowork, dùng lệnh `/schedule` (hoặc bảo trợ lý) để đổi giờ, hoặc sửa trực tiếp prompt trong `SKILL.md` ở đường dẫn trên.
- Đổi giờ = đổi cron. Ví dụ: `0 7 * * *` = 07:00 mỗi ngày; `30 6 * * *` = 06:30; `0 8 * * 1-5` = 08:00 các ngày trong tuần.

---

## 5. Bộ lập lịch 2 — Windows Task Scheduler (đẩy Netlify)

- **Tên task Windows:** `BanTin-AutoDeploy-Netlify`
- **Lịch hiện tại (mục tiêu):** 07:15 hằng ngày.
- **Chạy:** `run-auto-deploy.bat` → `auto-deploy.js` → (nếu có số mới) `deploy-netlify.bat`.
- **Đăng ký lần đầu:** chạy `dang-ky-task-scheduler.bat` (chuột phải → *Run as administrator*).

### Cách đổi giờ deploy
Giờ nằm ở **2 nơi**, nên đổi cả hai cho nhất quán:

1. **Task đang chạy trên máy** — mở *Command Prompt (Run as administrator)*:
   ```
   schtasks /Change /TN "BanTin-AutoDeploy-Netlify" /ST 07:15
   ```
2. **File đăng ký** `dang-ky-task-scheduler.bat` — sửa dòng:
   ```
   schtasks /Create /F /SC DAILY /ST 07:15 /TN "%TASKNAME%" ...
   ```
   (đổi `07:15` thành giờ mong muốn; file này dùng khi cần đăng ký lại từ đầu / trên máy mới.)

### Kiểm tra / chạy thử / xoá task Windows
```
schtasks /Query  /TN "BanTin-AutoDeploy-Netlify" /FO LIST      (xem chi tiết, tìm dòng Start Time)
schtasks /Run    /TN "BanTin-AutoDeploy-Netlify"               (chạy thử ngay)
schtasks /Delete /F /TN "BanTin-AutoDeploy-Netlify"            (xoá task)
```

### Lưu ý về khoảng cách thời gian
Số được tạo lúc 07:00 (+ vài phút trễ điều phối) và deploy lúc 07:15 → khoảng đệm ~15 phút. Thường đủ. Nếu hôm nào tạo số lâu hơn 07:15, `auto-deploy.js` không thấy file mới và **bỏ qua hôm đó** (số vẫn nằm trong `site\`, sẽ lên web ở lần deploy kế). Muốn chắc chắn hơn:
- Đặt deploy trễ hơn (vd `/ST 07:20`), hoặc
- Chạy `auto-deploy.js --watch` (theo dõi liên tục, deploy ngay khi có file mới — không phụ thuộc mốc giờ).

---

## 6. Cơ chế phát hiện số mới (auto-deploy.js)

- Chỉ xét các file dạng `YYYY-MM-DD.html` trong `site\` (bỏ qua `index.html`).
- Tính **chữ ký** = danh sách `tên:kích_thước:mtime` của từng số. Nếu chữ ký khác với `.deploy-state.json` → có thay đổi → deploy. Nhờ mtime nên **sửa nội dung số cũ** cũng kích hoạt deploy.
- Sau khi deploy thành công mới lưu lại trạng thái mới; nếu deploy lỗi thì giữ nguyên trạng thái để lần sau thử lại.
- Chế độ chạy: `node auto-deploy.js` (1 lần, dùng cho Task Scheduler) hoặc `node auto-deploy.js --watch` (theo dõi liên tục).

---

## 7. Thao tác thủ công thường dùng

- **Deploy tay ngay bây giờ:** bấm đôi `deploy-netlify.bat` (có thể mở trình duyệt để đăng nhập Netlify nếu chưa có token).
- **Xem log deploy:** mở `auto-deploy.log`.
- **Khôi phục đủ các số về máy mới:** chạy `1-tai-ve-site.bat` trước (xem cảnh báo mục 8), rồi mới deploy.
- **Xác thực ngầm:** đặt Personal Access Token vào `netlify-token.txt` (một dòng, không xuống dòng thừa).

---

## 8. Việc cần lưu ý / nợ kỹ thuật

- ⚠️ `1-tai-ve-site.bat` **hard-code** danh sách tải về chỉ tới `2026-07-27`. Hiện đã có tới `2026-08-05` (13 số). Nếu phải khôi phục từ Netlify, file này sẽ **thiếu các số mới hơn** — nên cập nhật danh sách, hoặc tốt hơn là giữ bản sao thư mục `site\` (git đã theo dõi) làm nguồn khôi phục chính.
- ⚠️ `netlify-token.txt` chứa bí mật. Đảm bảo không đẩy công khai (kiểm tra `.gitignore`).
- `deploy-netlify.bat` có bảo vệ: nếu `site\` có **< 2 file .html**, ở chế độ AUTO nó **dừng** để tránh vô tình publish thiếu bài — đây là hành vi cố ý.

---

## 9. Lịch sử thay đổi

- **05/08/2026:** Đổi giờ tạo số Cowork 07:30 → **07:00**; đổi giờ deploy 07:50 → **07:15** (sửa `dang-ky-task-scheduler.bat`; cần chạy `schtasks /Change` để áp lên task đang chạy). Gỡ bước lưu Notion khỏi task Cowork. Viết README này.
- **Trước đó:** Cowork tạo số 07:30, Windows deploy 07:50; có lưu Notion.
