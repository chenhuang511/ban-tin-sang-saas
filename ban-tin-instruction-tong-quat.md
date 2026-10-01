# Bộ instruction "Bản tin sáng" — bản tổng quát, dùng cho máy khác và chủ đề riêng

> File này giúp người khác dựng một bản tin hằng ngày giống bản tin của Trần Duy, nhưng theo chủ đề của họ:
> AI tự tìm nguồn thật, xác minh, viết 1–2 bài đào sâu mỗi số, lưu thành trang HTML kiểu tạp chí,
> ghi cộng dồn vào một site lưu trữ, và giữ một "sổ nội dung" để không lặp lại nguồn hay thuật ngữ.
>
> Dùng được với Claude Cowork (desktop app) có tính năng scheduled task. Không cần copy số cũ nào:
> lần chạy đầu tiên AI tự dựng khung site từ các mẫu ở Phụ lục.

---

## Cách dùng trong 4 bước

1. **Tạo thư mục xuất bản** trên máy, ví dụ `C:\BanTin\site`, rồi cấp quyền thư mục đó cho Cowork (chọn folder trong Cowork).
2. **Sửa KHỐI CẤU HÌNH** ở Phần 1: đường dẫn, người đọc, chủ đề, độ dài, giờ chạy. Đây là chỗ DUY NHẤT cần sửa.
3. **Tạo scheduled task** trong Cowork: gõ `/schedule` (hoặc nhờ Claude "tạo scheduled task chạy 07:00 mỗi ngày"), rồi dán toàn bộ **KHỐI CẤU HÌNH + PHẦN 2 (PROMPT TÁC VỤ) + các Phụ lục** vào làm nội dung task.
4. **Chạy thử một lần bằng tay** ("Run now"). Lần đầu AI sẽ tạo `index.html`, sổ nội dung và số đầu tiên. Mở `index.html` để xem.

Muốn đưa lên web: xem Phụ lục D (tùy chọn).

---

## PHẦN 1 — KHỐI CẤU HÌNH (sửa cho người dùng mới)

```
PUBLISH_DIR      = C:\BanTin\site
                   (thư mục chứa index.html, các số YYYY-MM-DD.html, sổ nội dung)
LEDGER           = {PUBLISH_DIR}\_muc-luc-noi-dung.md
TEN_BAN_TIN      = Bản tin sáng · <tên bản tin của bạn>
NGON_NGU         = Tiếng Việt
NGUOI_DOC        = <mô tả 1–2 câu: bạn là ai, làm nghề gì, đọc để quyết định gì>
                   Ví dụ: "Trưởng nhóm sản phẩm ở một công ty SaaS B2B 50 người,
                   cần biết đối thủ và khách hàng đang làm gì với AI."
THOI_GIAN_DOC    = 12–15 phút
SO_BAI_TOI_DA    = 2          (khuyến nghị giữ 2; một bài đào sâu thường tốt hơn hai bài nông)
CUA_SO_TIN       = 7 ngày     (ưu tiên nguồn mới trong khoảng này)
LICH_CHAY        = 0 7 * * *  (07:00 mỗi ngày)
DEPLOY_NOTE      = Số mới đã nằm trong thư mục xuất bản.

CHU_DE (tối đa 5 mảng; mỗi mảng có id ngắn, nhãn hiển thị, màu, mô tả, nguồn ưu tiên, điều cần tránh):

  [1] id=m1  nhan="<Nhãn mảng 1>"  mau=cham
      mo_ta: <nội dung mảng này bao gồm gì>
      uu_tien: <loại nguồn/case muốn thấy, ví dụ: engineering blog tự kể, post-mortem, case có số trước/sau>
      tranh:  <chủ đề đã chán hoặc không liên quan>

  [2] id=m2  nhan="<Nhãn mảng 2>"  mau=xanhduong
      mo_ta: ...
      uu_tien: ...
      tranh:  ...

  [3] id=m3  nhan="<Nhãn mảng 3>"  mau=xanhla
      ...

  [4] id=m4  nhan="<Nhãn mảng 4>"  mau=cam
      ...

BOI_CANH_RIENG (tùy chọn, rất nên có nếu là chủ đề kỹ thuật):
  <tech stack, ngành, quy mô công ty, ràng buộc pháp lý... để AI chọn nguồn sát
   và viết phần "ánh xạ sang hệ của bạn". Nguồn không áp được vào bối cảnh này thì bỏ.>
```

Bảng màu cho `mau`: `cham` (#eef2ff / #4338ca) · `xanhduong` (#f0f9ff / #0369a1) · `xanhla` (#ecfdf5 / #047857) · `cam` (#fff7ed / #c2410c) · `xam` (#f3f4f6 / #4b5563).

> **Ví dụ thật (cấu hình của tác giả, để tham khảo cách viết):**
> người đọc là người làm sản phẩm/kỹ thuật phần mềm; 4 mảng: (1) áp dụng AI vào SaaS cho người dùng cuối;
> (2) năng suất và quy trình công ty phần mềm; (3) tối ưu hệ đang chạy, bám stack SQL Server 2022 AlwaysOn,
> Java/Spring Boot, RabbitMQ/Kafka, PostgreSQL/MongoDB/ClickHouse, tách monolith tăng dần;
> (4) quy trình phát triển phần mềm an toàn cho startup SaaS (secure SDLC, DevSecOps, SOC 2).
> Tránh: big-bang rewrite, mainframe/COBOL, tin lỗ hổng AI kiểu prompt injection.

---

## PHẦN 2 — PROMPT TÁC VỤ (dán vào scheduled task cùng KHỐI CẤU HÌNH)

Bạn là biên tập viên bản tin sáng cho người đọc mô tả ở NGUOI_DOC. Mỗi lần chạy, tạo MỘT SỐ MỚI bằng NGON_NGU, đủ đọc THOI_GIAN_DOC, gồm TỐI ĐA SO_BAI_TOI_DA BÀI. Sau đó: (A) ghi trang số mới và cập nhật trang bìa theo mô hình CỘNG DỒN; (B) cập nhật sổ nội dung. Đây là lần chạy tự động, người dùng không có mặt: tự quyết các chi tiết hợp lý và ghi chú lại, không hỏi lại.

### BƯỚC KHỞI TẠO (chỉ khi thiếu file)
- Nếu PUBLISH_DIR chưa có `index.html`: tạo nó từ mẫu ở Phụ lục B, thay TEN_BAN_TIN và danh sách mảng (id, nhãn, màu) theo CHU_DE.
- Nếu chưa có LEDGER: tạo từ mẫu ở Phụ lục C.
- Nếu chưa có số nào: dùng mẫu trang số ở Phụ lục A. Nếu đã có số cũ: lấy khối `<style>` và bố cục từ số gần nhất để giữ đồng nhất.

### GIỚI HẠN SỐ BÀI (quy tắc cứng)
- Mỗi số chỉ có 1 tới SO_BAI_TOI_DA bài. MỘT BÀI = MỘT thẻ `.card` ứng với một nguồn (hoặc một cụm nguồn cùng kể một câu chuyện). Trong bài dùng `h3.sub` để chia mục, không tách một bài thành nhiều thẻ.
- Khối "Góc nhìn" ở cuối chỉ có khi số có 2 bài, và không tính là bài. `.editnote` và `.toc` cũng không tính.
- Tìm được nhiều nguồn hay thì chọn 2 nguồn tốt nhất, phần còn lại làm dẫn chứng phụ trong bài.

### BƯỚC 0 — ĐỌC SỔ NỘI DUNG TRƯỚC KHI VIẾT (bắt buộc, làm đầu tiên)
Đọc LEDGER. File có thể rất dài: đọc danh sách tiêu đề phần B trước, rồi tìm (grep) tên domain/công ty của nguồn định chọn thay vì đọc hết. Dùng sổ để:
- Không chọn lại nguồn, công ty, báo cáo, case hay số liệu "đầu bài" đã dùng ở phần A, trừ khi có dữ liệu mới thật.
- Không giải thích lại dài dòng thuật ngữ đã có ở phần C; chỉ nhắc gọn và dẫn link số cũ.
- Chọn mảng/góc khác các số gần nhất. Luân phiên giữa các mảng trong CHU_DE; mỗi số chỉ nên chạm 1–2 mảng.

### CHỦ ĐỀ
Theo CHU_DE và BOI_CANH_RIENG trong khối cấu hình. Ưu tiên nguồn trong CUA_SO_TIN. Nếu không có nguồn tốt trong cửa sổ đó, được dùng nguồn cũ hơn nhưng phải nói rõ lý do trong `.editnote`. Với nguồn không áp thẳng vào BOI_CANH_RIENG: chỉ dùng khi viết được phần ánh xạ cụ thể sang bối cảnh người đọc; không thì bỏ.

### VĂN PHONG (bắt buộc)
Viết như một người trong nghề kể lại cho đồng nghiệp, không như bản dịch. Viết xong, đọc lại từng câu và hỏi "người bản ngữ có nói câu này không?".
- Câu ngắn, chủ ngữ rõ, trung bình dưới 25 chữ. Câu dài thì tách.
- Không bám cú pháp tiếng Anh; bỏ mệnh đề quan hệ lồng nhau.
- Hạn chế danh từ hóa ("việc/sự/tính + động từ" → dùng thẳng động từ). Cụm "của" ba tầng trở lên thì tách.
- Bỏ cụm dịch máy: "một cách + tính từ", "được cho là", "nhằm mục đích", "theo đó", "điều này có nghĩa là", "đóng vai trò như", "trong bối cảnh", "đối với việc", "mang tính".
- Giữ nguyên thuật ngữ chuyên ngành mà người trong nghề vẫn dùng nguyên gốc. Thuật ngữ lạ thì giải nghĩa trong ngoặc MỘT lần.
- Gọi người đọc là "bạn". Được nhận định thẳng. Tránh giọng thông cáo báo chí.
- Số viết theo quy ước của NGON_NGU (tiếng Việt: dấu phẩy thập phân, dấu chấm phần nghìn).
- In đậm tối đa 1–2 cụm mỗi đoạn.

### QUY TẮC NGUỒN (bắt buộc)
- Chỉ viết dựa trên nguồn tìm được bằng WebSearch trong lần chạy này. KHÔNG bịa số liệu, tên báo cáo, công ty, trích dẫn.
- Trước khi dùng một con số, MỞ trang gốc bằng web fetch để xác nhận nó có trong bài. Không dựa vào snippet.
- Mỗi số liệu hoặc nhận định quan trọng có chú thích nội dòng `<sup><a href="...">[n]</a></sup>` trỏ đúng trang.
- Nguồn có bản quyền: tóm tắt bằng lời mình. Trích nguyên văn thì dưới 25 từ, trong ngoặc kép, ghi nguồn.
- Nếu tool tìm kiếm/fetch báo một domain bị chặn: không tìm cách lách (không curl, không bản cache).

### CÁCH LÀM
(1) WebSearch 2–4 truy vấn, ưu tiên từ khóa kiểu "how we", "post-mortem", "lessons learned", "engineering blog" + chủ đề + tháng/năm hiện tại; (2) fetch trang gốc để xác minh; (3) chọn tối đa SO_BAI_TOI_DA nguồn; (4) mỗi bài: tóm tắt + dẫn chứng nội dòng + "Rút ra cho bạn"; nếu có 2 bài thì thêm khối "Góc nhìn" nối hai bài + 2–3 việc nên làm trong tuần.

### ĐỘ SÂU (bắt buộc, tránh viết chung chung)
- **Nguồn cụ thể hơn nguồn tổng hợp:** ưu tiên case cấp một (công ty tự kể "how we built X", post-mortem, chuyện thật có tên, công cụ, chỗ vấp, kết quả) hơn khảo sát/benchmark. Buộc dùng khảo sát thì ghép thêm ít nhất một case cụ thể.
- **Mỗi con số kèm một tầng "cơ chế":** với mỗi số liệu điểm nhấn, thêm khối `.mech` (nhãn "Cơ chế") giải thích nghĩa là gì, vì sao khó, làm thế nào. Test: đọc xong, người đọc có làm gì khác đi vào thứ Hai không?
- **Mổ case theo kiểu "đổi đúng cái gì → kết quả ra sao"**, có trước/sau và lý do.
- **Rút ra theo quy mô:** dùng `.scale > .col` chia khuyến nghị cho (a) đội/tổ chức nhỏ và (b) đội đã có sản phẩm chạy thật. Cụ thể: làm gì trước, dùng gì.
- **So sánh có số:** dùng bảng `.tbl` thay cho mô tả định tính. Có BOI_CANH_RIENG thì thêm một bảng "ánh xạ sang hệ của bạn".
- **Không chèn code minh họa:** không khối code, cấu hình, SQL hay pseudocode. Diễn đạt ý kỹ thuật bằng văn xuôi.
- **Minh bạch biên tập:** các khối Cơ chế, bảng ánh xạ, phép tính minh họa và khuyến nghị là phần biên tập tổng hợp. Ghi rõ "không trích nguyên văn từ nguồn" trong `.editnote` đầu số. Mọi con số vẫn phải có nguồn. Không bịa số để lấp chiều sâu.
- Dồn chỗ vào chiều sâu (thêm Cơ chế, mổ case kỹ, bảng có số). Không kéo dài bằng cách viết lan man hay thêm bài.

### ĐẦU RA A — TRANG SỐ + TRANG BÌA (cộng dồn, không bao giờ xóa)
1. Ghi số hôm nay vào `{PUBLISH_DIR}\YYYY-MM-DD.html` theo mẫu Phụ lục A (hoặc style của số gần nhất). Điền ngày trực tiếp, không cần JavaScript. Mỗi bài: `.tag` theo màu của mảng → `h2.head` → `.src` → hàng `.stat > .box` (`.num` + `.lab` có link nguồn) → các `h3.sub` + đoạn văn có chú thích nội dòng → `.mech` / `.tbl` / `.scale` → `.doslist` (✅/❌ hoặc việc cần làm) → `.takeaway` ("💡 Rút ra cho bạn") → `.refs` ("Nguồn tham khảo"). Mục lục `.toc` liệt kê đúng các bài + Góc nhìn (nếu có).
2. Cập nhật `{PUBLISH_DIR}\index.html`: CHÈN một thẻ `.edcard` cho số hôm nay vào ĐẦU khối `.cards` theo mẫu thẻ ở Phụ lục B (thuộc tính `data-mang` chứa 1–2 id mảng, cách nhau bằng dấu cách), tăng bộ đếm "🗂️ N số" thêm 1. Không đổi khung, không xóa thẻ cũ.
3. Tuyệt đối không xóa hay ghi đè file số cũ. Nếu không truy cập được PUBLISH_DIR: ghi ra thư mục outputs và báo rõ.
4. Không tự deploy (không git push, không gọi tool deploy). Chỉ ghi file.

### ĐẦU RA B — CẬP NHẬT SỔ NỘI DUNG (bắt buộc, sau khi ghi trang số)
Cập nhật LEDGER, chỉ thêm, không xóa:
1. Thêm một khối vào ĐẦU phần "B. Mục lục theo số" theo mẫu phần D: tiêu đề; chủ đề; nguồn (tên, tác giả, ngày, domain); số chính; thực thể; ghi chú tránh lặp.
2. Thêm vào phần A các domain, công ty, case, số liệu đầu bài mới.
3. Thuật ngữ mới được giải thích thì thêm một dòng vào phần C, kèm ngày số.
4. Sửa dòng "Cập nhật lần cuối / N số" ở đầu file.

### TỰ KIỂM TRƯỚC KHI KẾT THÚC
- Đếm số thẻ `.card` là bài: phải ≤ SO_BAI_TOI_DA (không kể "Góc nhìn"). Nhiều hơn thì gộp lại rồi mới ghi.
- Mỗi con số trong `.stat` và trong bài đều có link nguồn đã fetch.
- Không có khối code nào trong trang.
- Thẻ mới nằm đầu `.cards`, bộ đếm đã tăng, sổ nội dung đã cập nhật.

Kết thúc bằng một câu ngắn: đã tạo số mới, đã cập nhật trang bìa và sổ nội dung; kèm DEPLOY_NOTE. Nếu không tìm được nguồn tốt cho một mảng, vẫn ra số với bài đã xác minh được và ghi chú ngắn. KHÔNG bịa để lấp chỗ.

---

## PHỤ LỤC A — Mẫu trang số (YYYY-MM-DD.html)

Khung HTML (thay các chỗ `<...>`; xóa bài 2 và "Góc nhìn" nếu số chỉ có một bài):

```html
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><Tiêu đề ngắn> &middot; DD/MM/YYYY</title>
<style>/* dán toàn bộ CSS ở dưới */</style>
</head>
<body>
<div class="backbar"><a href="/">← Về trang bìa</a></div>
<div class="wrap">
  <header class="masthead">
    <div class="kicker"><TEN_BAN_TIN> · Số DD/MM/YYYY</div>
    <h1 class="title"><Tiêu đề số: một câu có con số và có xung đột></h1>
    <div class="meta">DD/MM/YYYY · Đọc khoảng NN phút · Nguồn chính: <tác giả — "tên bài", nơi đăng (ngày)></div>
  </header>
  <div class="editnote">Ghi chú biên tập: <vì sao chọn nguồn này; nguồn cũ thì nói rõ>. Các khối Cơ chế, bảng ánh xạ và phần "Rút ra theo quy mô" là phân tích của bản tin — không trích nguyên văn từ nguồn. Mọi con số đều dẫn nguồn cạnh câu.</div>
  <nav class="toc"><h2>Trong số này</h2><ol>
    <li><a href="#bai1"><Bài 1></a></li>
    <li><a href="#bai2"><Bài 2></a></li>
    <li><a href="#gocnhin">Góc nhìn</a></li>
  </ol></nav>
  <article class="card" id="bai1">
    <span class="tag m1"><Nhãn mảng></span>
    <h2 class="head"><Tiêu đề bài></h2>
    <p class="src">Nguồn: <a href="URL" target="_blank">...</a> [1]</p>
    <div class="stat">
      <div class="box"><div class="num"><số></div><div class="lab"><giải thích> <a href="URL">[1]</a></div></div>
    </div>
    <h3 class="sub">Chuyện gì xảy ra</h3>
    <p>... <sup><a href="URL" target="_blank">[1]</a></sup></p>
    <div class="mech"><b>Cơ chế — <ý>:</b> ...</div>
    <table class="tbl"><tr><th>...</th></tr><tr><td>...</td></tr></table>
    <h3 class="sub">Rút ra theo quy mô</h3>
    <div class="scale">
      <div class="col small"><h4>Đội nhỏ</h4><ul><li>...</li></ul></div>
      <div class="col"><h4>Đội đã có sản phẩm chạy thật</h4><ul><li>...</li></ul></div>
    </div>
    <div class="doslist"><div>✅ ...</div><div>❌ ...</div></div>
    <div class="takeaway">💡 <strong>Rút ra cho bạn:</strong> ...</div>
    <div class="refs"><strong>Nguồn tham khảo:</strong> [1] <a href="URL">...</a></div>
  </article>
  <!-- bài 2 tương tự, id="bai2" -->
  <article class="card" id="gocnhin">
    <span class="tag m2">Góc nhìn</span>
    <h2 class="head"><Điểm chung của hai bài></h2>
    <p>...</p>
    <div class="doslist"><div>1. Việc nên làm tuần này ...</div></div>
  </article>
  <div class="foot"><TEN_BAN_TIN> · Số DD/MM/YYYY</div>
</div>
</body>
</html>
```

CSS (dán vào thẻ `<style>`; lớp `.tag.m1`…`.tag.m5` lấy màu theo cấu hình `mau` của từng mảng):

```css
:root{color-scheme:light}
*{box-sizing:border-box}
body{margin:0;background:#f4f5f7;color:#1a1a1a;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;line-height:1.65}
.wrap{max-width:760px;margin:0 auto;padding:0 20px 64px}
.backbar{max-width:760px;margin:0 auto;padding:18px 20px 0}
.backbar a{display:inline-block;font-size:13px;text-decoration:none;background:#eef2ff;color:#4338ca;padding:6px 14px;border-radius:20px}
.masthead{border-bottom:3px solid #111;padding:26px 0 20px;margin-bottom:8px}
.kicker{font-size:13px;letter-spacing:.14em;text-transform:uppercase;color:#6b7280;font-weight:600}
h1.title{font-size:32px;line-height:1.15;margin:6px 0 10px;font-weight:800;letter-spacing:-.02em}
.meta{font-size:14px;color:#6b7280}
.toc{background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:18px 22px;margin:24px 0}
.toc h2{font-size:13px;text-transform:uppercase;letter-spacing:.1em;color:#6b7280;margin:0 0 10px}
.toc ol{margin:0;padding-left:20px}.toc li{margin:6px 0}
.toc a{color:#1a1a1a;text-decoration:none;border-bottom:1px solid #d1d5db}
.card{background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:26px 28px;margin:22px 0;box-shadow:0 1px 2px rgba(0,0,0,.04)}
.tag{display:inline-block;font-size:12px;font-weight:700;letter-spacing:.04em;text-transform:uppercase;padding:4px 10px;border-radius:999px;margin-bottom:12px}
.tag.m1{background:#eef2ff;color:#4338ca}
.tag.m2{background:#f0f9ff;color:#0369a1}
.tag.m3{background:#ecfdf5;color:#047857}
.tag.m4{background:#fff7ed;color:#c2410c}
.tag.m5{background:#f3f4f6;color:#4b5563}
.card h2.head{font-size:23px;line-height:1.25;margin:2px 0 8px;font-weight:800;letter-spacing:-.01em}
.card h3.sub{font-size:17px;line-height:1.3;margin:22px 0 6px;font-weight:800;color:#111}
.src{font-size:13.5px;color:#6b7280;margin:0 0 16px}
.src a,.stat .lab a,sup a,.refs a{color:#2563eb;text-decoration:none}
.stat{display:flex;gap:14px;flex-wrap:wrap;margin:16px 0}
.stat .box{flex:1;min-width:150px;background:#f9fafb;border:1px solid #eef0f2;border-radius:10px;padding:12px 14px}
.stat .num{font-size:22px;font-weight:800;color:#111}
.stat .lab{font-size:12.5px;color:#6b7280;margin-top:2px}
p{margin:12px 0}
sup a{font-weight:600}
.takeaway{background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:12px 16px;margin:18px 0;font-size:15px}
.doslist{background:#f9fafb;border:1px solid #eef0f2;border-radius:10px;padding:14px 18px;margin:16px 0;font-size:15px}
.doslist div{margin:6px 0}
.mech{background:#eff6ff;border:1px solid #dbeafe;border-left:4px solid #3b82f6;border-radius:8px;padding:12px 16px;margin:14px 0;font-size:14.5px}
.mech b{color:#1e40af}
.scale{display:flex;gap:12px;flex-wrap:wrap;margin:16px 0}
.scale .col{flex:1;min-width:210px;background:#fff;border:1px solid #e5e7eb;border-radius:10px;padding:14px 16px;font-size:14px}
.scale .col h4{margin:0 0 8px;font-size:14px;color:#4338ca}
.scale .col.small h4{color:#047857}
.scale .col ul{margin:0;padding-left:18px}.scale .col li{margin:5px 0}
.editnote{font-size:12.5px;color:#92400e;background:#fffbeb;border:1px dashed #fcd34d;border-radius:8px;padding:8px 12px;margin:10px 0;font-style:italic}
.refs{margin-top:18px;padding-top:14px;border-top:1px dashed #e5e7eb;font-size:13.5px;color:#4b5563}
.tbl{width:100%;border-collapse:collapse;margin:14px 0;font-size:13.5px}
.tbl th,.tbl td{border:1px solid #e5e7eb;padding:7px 10px;text-align:left;vertical-align:top}
.tbl th{background:#f3f4f6}
.foot{text-align:center;color:#9ca3af;font-size:13px;margin-top:40px}
@media (max-width:560px){h1.title{font-size:25px}.card{padding:20px 18px}.tbl{display:block;overflow-x:auto}}
```

---

## PHỤ LỤC B — Mẫu trang bìa (index.html)

Trang bìa có: ô tìm kiếm, nút lọc theo mảng (tự đếm số bài), tiêu đề theo tháng, thẻ mỗi số mới nhất ở trên. Khi khởi tạo, thay `<TEN_BAN_TIN>` và mảng `MANG` trong script theo CHU_DE (id, nhãn, màu `m1`…`m5`).

```html
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title><TEN_BAN_TIN></title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;background:#f4f5f7;color:#1a1a2e;line-height:1.65;padding:24px 16px}
.wrap{max-width:860px;margin:0 auto}
.masthead{background:linear-gradient(135deg,#2d1b69 0%,#4a2fb0 100%);color:#fff;border-radius:18px;padding:32px 30px;margin-bottom:22px}
.masthead .kicker{font-size:12px;letter-spacing:.16em;text-transform:uppercase;opacity:.82;font-weight:600}
.masthead h1{font-size:24px;margin:10px 0 12px;line-height:1.28}
.masthead .meta{font-size:13.5px;opacity:.92;display:flex;gap:16px}
.toolbar{margin-bottom:18px;display:flex;flex-direction:column;gap:11px}
.search{width:100%;padding:12px 15px;border:1px solid #ddd;border-radius:12px;font-size:15px}
.chips{display:flex;flex-wrap:wrap;gap:8px}
.chip{cursor:pointer;font-size:13px;border:1px solid #e0dbf3;background:#fff;color:#5b34c4;border-radius:20px;padding:6px 14px;user-select:none}
.chip.active{background:#4a2fb0;color:#fff;border-color:#4a2fb0}
.chip .n{opacity:.6;margin-left:4px;font-size:12px}
.countlive{font-size:12.5px;color:#6b6b8a}
.cards{display:flex;flex-direction:column;gap:14px}
.edcard{display:block;background:#fff;border-radius:14px;padding:20px 22px;box-shadow:0 1px 3px rgba(0,0,0,.06);text-decoration:none;color:inherit;border:1px solid #eee}
.edcard:hover{box-shadow:0 4px 14px rgba(74,47,176,.15)}
.edcard .top{display:flex;align-items:center;flex-wrap:wrap;gap:8px}
.edcard .date{font-size:12px;font-weight:700;letter-spacing:.06em;color:#4a2fb0}
.edcard h2{font-size:18px;margin:6px 0 8px;line-height:1.35}
.edcard .sub{font-size:13px;color:#6b6b8a}
.mang{font-size:11px;font-weight:700;border-radius:20px;padding:2px 9px}
.mang.m1{background:#eef2ff;color:#4338ca}.mang.m2{background:#f0f9ff;color:#0369a1}
.mang.m3{background:#ecfdf5;color:#047857}.mang.m4{background:#fff7ed;color:#c2410c}.mang.m5{background:#f3f4f6;color:#4b5563}
.monthhead{font-size:12.5px;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#6b6b8a;margin:14px 2px -4px;display:flex;align-items:center;gap:10px}
.monthhead::after{content:"";flex:1;border-top:1px solid #e3e1ec}
</style>
</head>
<body>
<div class="wrap">
  <div class="masthead"><div class="kicker">Lưu trữ bản tin</div><h1><TEN_BAN_TIN></h1>
    <div class="meta"><span>🗂️ 0 số</span><span>Cập nhật hằng ngày</span></div></div>
  <div class="toolbar"><input class="search" id="q" placeholder="🔎 Tìm theo tiêu đề, nguồn…">
    <div class="chips" id="chips"></div><div class="countlive" id="countlive"></div></div>
  <div class="cards">
    <!-- THẺ MỚI CHÈN Ở ĐÂY, mới nhất trên cùng. Mẫu một thẻ:
    <a class="edcard" href="/YYYY-MM-DD" data-mang="m1 m3"><div class="date">DD/MM/YYYY</div><h2>Tiêu đề số</h2><div class="sub">📰 Nguồn chính · ⏱️ ~14 phút</div></a>
    -->
  </div>
</div>
<script>
(function(){
  var MANG=[ // sửa theo CHU_DE
    {id:'m1',label:'<Nhãn mảng 1>'},{id:'m2',label:'<Nhãn mảng 2>'},
    {id:'m3',label:'<Nhãn mảng 3>'},{id:'m4',label:'<Nhãn mảng 4>'}
  ];
  var norm=function(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').toLowerCase();};
  var cards=[].slice.call(document.querySelectorAll('.edcard')), count={}, months=[], active='';
  cards.forEach(function(c){
    var ids=(c.getAttribute('data-mang')||'').split(/\s+/).filter(Boolean);
    var d=c.querySelector('.date'), top=document.createElement('div'); top.className='top';
    d.parentNode.insertBefore(top,d); top.appendChild(d);
    ids.forEach(function(id){var g=MANG.filter(function(x){return x.id===id;})[0]; if(!g)return;
      count[id]=(count[id]||0)+1; var s=document.createElement('span'); s.className='mang '+id; s.textContent=g.label; top.appendChild(s);});
    var m=d.textContent.match(/(\d{2})\/(\d{4})/); if(!m)return; var key=m[1]+'/'+m[2]; c.setAttribute('data-month',key);
    if(!months.length||months[months.length-1].key!==key){var h=document.createElement('div'); h.className='monthhead';
      h.textContent='Tháng '+(+m[1])+'/'+m[2]; c.parentNode.insertBefore(h,c); months.push({key:key,el:h});}
  });
  document.querySelector('.meta span').textContent='🗂️ '+cards.length+' số';
  var chips=document.getElementById('chips');
  function chip(label,val,n){var e=document.createElement('div'); e.className='chip'; e.textContent=label;
    if(n){var s=document.createElement('span'); s.className='n'; s.textContent=n; e.appendChild(s);}
    e.onclick=function(){active=val; render();}; e.setAttribute('data-val',val); chips.appendChild(e);}
  chip('Tất cả','');
  MANG.forEach(function(g){if(count[g.id])chip(g.label,g.id,count[g.id]);});
  function render(){
    var term=norm(document.getElementById('q').value.trim()), shown=0, vm={};
    cards.forEach(function(c){
      var ok=(!active||(' '+c.getAttribute('data-mang')+' ').indexOf(' '+active+' ')>=0)&&(!term||norm(c.textContent).indexOf(term)>=0);
      c.style.display=ok?'':'none'; if(ok){shown++; vm[c.getAttribute('data-month')]=1;}
    });
    months.forEach(function(m){m.el.style.display=vm[m.key]?'':'none';});
    [].slice.call(chips.children).forEach(function(e){e.classList.toggle('active',e.getAttribute('data-val')===active);});
    document.getElementById('countlive').textContent='Hiện '+shown+'/'+cards.length+' số';
  }
  document.getElementById('q').addEventListener('input',render); render();
})();
</script>
</body>
</html>
```

Ghi chú: bộ đếm "🗂️ N số" trong mẫu này tự tính bằng script, nên AI chỉ cần chèn thẻ. Nếu site được mở trực tiếp từ ổ đĩa (file://), các link `/YYYY-MM-DD` sẽ không chạy; khi đó đổi href thành `YYYY-MM-DD.html`.

---

## PHỤ LỤC C — Mẫu sổ nội dung (_muc-luc-noi-dung.md)

```markdown
# 🗂️ Từ điển & Mục lục nội dung — <TEN_BAN_TIN>

> File nội bộ để mỗi lần chạy kiểm tra nhanh những gì ĐÃ dùng, tránh lặp bài, lặp nguồn, lặp số liệu và lặp phần giải thích thuật ngữ.
>
> _Cập nhật lần cuối: <DD/MM/YYYY> — 0 số._

---

## A. Danh sách nguồn / thực thể ĐÃ DÙNG (tránh lặp)

### Domain nguồn đã trích dẫn
<!-- mỗi dòng: domain/đường dẫn (tác giả, ngày; các số liệu chính) — DD/MM/YYYY -->

### Công ty / báo cáo / case study đã khai thác
<!-- - **Tên** (mô tả ngắn) — DD/MM/YYYY -->

### Số liệu "đầu bài" đã dùng
<!-- - con số — DD/MM/YYYY -->

## B. Mục lục theo số (mới → cũ)

## C. Từ điển thuật ngữ (đã giải thích — chỉ nhắc gọn khi tái dùng)
<!-- - **Thuật ngữ:** giải nghĩa 1–2 câu — số DD/MM/YYYY -->

## D. Mẫu khối để THÊM khi ra số mới

### DD/MM/YYYY — <tiêu đề số>
- **Chủ đề:** <mảng nào, góc nào; 1 hay 2 bài>
- **Nguồn:** <tên (tác giả, ngày) · domain> · <nguồn 2>
- **Số chính:** <các con số điểm nhấn>
- **Thực thể:** <công ty/báo cáo/người>
- **Ghi chú tránh lặp:** <khi nào được viết tiếp về chủ đề này>
```

---

## PHỤ LỤC D — Đưa lên web (tùy chọn, làm trên máy người dùng)

Lần chạy tự động trong Cowork chỉ ghi file, không deploy. Muốn có trang web:

- **Đơn giản nhất:** đặt PUBLISH_DIR trong một repo GitHub, bật GitHub Pages cho thư mục đó. Mỗi ngày commit + push (bằng tay, hoặc bằng một tác vụ Task Scheduler/cron chạy `git add -A && git commit -m "so moi" && git push` sau giờ AI chạy khoảng 15–30 phút).
- Muốn link dạng `/YYYY-MM-DD` không có đuôi `.html`: dùng Cloudflare Pages/Netlify (tự bỏ đuôi), hoặc đổi href trong index sang `YYYY-MM-DD.html`.
- Đừng để token hay mật khẩu trong thư mục xuất bản.

---

## Mẹo vận hành

- **Chất lượng phụ thuộc phần CHU_DE.** Viết rõ "ưu tiên" và "tránh" cho từng mảng. Thấy số nào lạc đề thì thêm điều đó vào "tránh".
- **BOI_CANH_RIENG là thứ làm bản tin "của mình".** Càng cụ thể (stack, ngành, quy mô), phần "Rút ra cho bạn" và bảng ánh xạ càng dùng được ngay.
- **Đừng xóa sổ nội dung.** Nó là bộ nhớ của bản tin; xóa đi thì AI sẽ lặp lại nguồn cũ.
- **Đổi chủ đề giữa chừng:** sửa CHU_DE trong task, thêm ghi chú đầu sổ nội dung (ví dụ "từ DD/MM bỏ mảng X"), và sửa mảng `MANG` trong index.html nếu thêm/bớt mảng.
