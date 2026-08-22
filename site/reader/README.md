# Highlight + Favourite cho Bản tin sáng

Tính năng cho phép **bôi/tô đoạn văn**, **ghi chú**, và **lưu (favourite) số** — lưu dài hạn, xuyên thiết bị, **không phụ thuộc localStorage** (localStorage chỉ là cache offline).

## Kiến trúc

```
Trình duyệt (reader.js)
   │  local-first: lưu ngay vào localStorage
   │  đồng bộ 2 chiều qua fetch (cookie Cloudflare Access)
   ▼
Cloudflare Worker  ──/api/*──►  handleApi (worker-api.js)
   │                                   │
   │  Cloudflare Access (Google)       ▼
   │  chèn email đã xác thực       D1 (SQLite): highlights, favourites
```

- **Neo highlight**: mô hình W3C TextQuoteSelector (quote + prefix/suffix + offset trong thẻ có `id`). Trang số đã publish là bất biến ⇒ neo bền.
- **Định danh**: Cloudflare Access whitelist email — Worker đọc header `Cf-Access-Authenticated-User-Email`, gần như không cần code auth.

## Chạy thử NGAY (chưa cần backend)

`reader.js` đã local-first: chỉ cần nhúng vào trang là bôi/tô/favourite chạy được, lưu ở trình duyệt. Số `2026-08-22.html` đã nhúng sẵn để demo. Khi backend online, dữ liệu local sẽ tự đẩy lên D1.

## Dựng backend (một lần)

Yêu cầu: tài khoản Cloudflare + `npm i -g wrangler` + `wrangler login`.

1. **Tạo D1 và áp schema**
   ```bash
   wrangler d1 create bantin-reader          # copy database_id in ra
   # dán database_id vào reader/wrangler.toml
   wrangler d1 execute bantin-reader --file=./reader/schema.sql
   ```

2. **Deploy Worker** (gộp handleApi vào worker hiện có, hoặc dùng worker.example.js)
   ```bash
   wrangler deploy
   ```

3. **Bật Cloudflare Access** (Zero Trust → Access → Applications)
   - Application type: *Self-hosted*, domain = domain site của bạn (hoặc chỉ path `/api/*` nếu muốn công khai phần đọc).
   - Identity provider: Google.
   - Policy: *Allow* → include *Emails* = danh sách email nhóm bạn.
   - Access sẽ tự chèn `Cf-Access-Authenticated-User-Email` cho request qua cổng.

4. **Xong.** Mở một số, bôi thử trên máy A rồi máy B — highlight/favourite đồng bộ.

## Nhúng vào MỌI số (sau khi ưng prototype)

Thêm vào cuối `<body>` của template số (và các file số cũ nếu muốn áp ngược):
```html
<script src="/reader.js" defer></script>
```
Gợi ý: thêm dòng này vào bước sinh số trong quy trình bản tin để số mới tự có.

## Файлы

| File | Vai trò |
|------|---------|
| `reader.js` (ở gốc site) | Frontend: bôi/tô/ghi chú/favourite, local-first + sync |
| `bo-suu-tap.html` (ở gốc site) | Trang gom mọi highlight + số đã lưu |
| `reader/schema.sql` | Bảng D1 |
| `reader/worker-api.js` | Xử lý `/api/*` |
| `reader/worker.example.js` | Mẫu tích hợp vào Worker |
| `reader/wrangler.toml` | Cấu hình D1 binding |

## Ghi chú bảo mật / giới hạn

- Worker chỉ trả/sửa dữ liệu của **chính email** gọi request (lọc theo `email`).
- Không có secret trong các file này — an toàn để commit công khai.
- Nếu bật Access cho toàn site, người chưa đăng nhập không đọc được site; nếu chỉ muốn khoá phần lưu, đặt Access chỉ cho `/api/*` và cho trang đọc công khai (khi đó cần một cách định danh khác cho người ẩn danh — hiện prototype giả định nhóm đã đăng nhập).
