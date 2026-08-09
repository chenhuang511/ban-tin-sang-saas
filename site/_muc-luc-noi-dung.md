# 🗂️ Từ điển & Mục lục nội dung — Bản tin sáng AI/SaaS

> **Mục đích:** File nội bộ (KHÔNG phải trang bản tin) để biên tập viên / lần chạy tự động kiểm tra
> nhanh những gì ĐÃ dùng, nhằm tránh lặp bài, lặp nguồn, lặp số liệu và lặp phần giải thích thuật ngữ.
>
> **Cách dùng mỗi lần ra số mới:**
> 1. Trước khi viết: đọc phần **A. Danh sách nguồn/thực thể đã dùng** — không chọn lại nguồn/công ty/báo cáo đã có, trừ khi có DỮ LIỆU MỚI thực sự.
> 2. Trước khi giải thích một thuật ngữ: xem phần **C. Từ điển thuật ngữ** — nếu đã giải thích ở số trước thì chỉ nhắc gọn/nối link, không giải thích lại dài dòng.
> 3. Sau khi viết xong: thêm 1 khối vào phần **B. Mục lục theo số** và cập nhật phần A + C nếu có nguồn/thuật ngữ mới (dùng mẫu ở cuối file).
>
> _Cập nhật lần cuối: 09/08/2026 — 18 số (24/07 → 09/08/2026; gồm 1 số song song 09/08 chuyên đề An toàn thông tin)._

---

## A. Danh sách nguồn / thực thể ĐÃ DÙNG (tránh lặp)

### Domain nguồn đã trích dẫn (đừng lặp cùng một bài)
abstracta.us · arxiv.org (2603.28592 "Debt Behind the AI Boom") · aws.amazon.com · bcg.com · businesswire.com (CrewAI) · lorikeetcx.ai · gartner.com (dự báo 80%/2029) · openmainframeproject.org · userpilot.com · emcap.com (Emergence Capital) · datadoghq.com (State of DevSecOps 2026) · scytale.ai (SOC 2) · blogs.cisco.com · businessofapps.com · byteiota.com · ciodive.com · clonedesk.ai · cloud.google.com (DORA) · cnbc.com · devblogs.microsoft.com · devoxsoftware.com · dora.dev · entrepreneur.com · faros.ai · forrester.com · fungies.io · gartner.com · getdx.com / newsletter.getdx.com · getmacha.com · gleap.io · kyndryl.com · larridin.com · linearb.io · marketscale.com · mckinsey.com · metr.org · mlq.ai · natlawreview.com · opsera.ai · plandek.com · prnewswire.com · qrvey.com · research.google · sfailabs.com · slashdot.org · sourcegraph.com · technode.global · thenewstack.io · thoughtworks.com · writer.com · zylo.com

### Công ty / báo cáo / case study đã khai thác (KHÔNG viết lại trừ khi có số liệu mới)
- **Case hiện đại hóa/legacy:** Bankdata × Microsoft (COBOL→Java Quarkus); Experian × AWS (687.600 dòng .NET, agentic); Toyota × AWS (rời mainframe 1979); Google "Accelerating code migrations with AI" (74%); Sourcegraph legacy guide; Kyndryl State of Mainframe Modernization 2025; Devox 2026 Legacy Modernization Report; Abstracta (RPG siêu thị, "90% là kiểm thử"); Open Mainframe Project "Discovery Is Not Migration" (Gartner >70% exit fail, IBM watsonx Code Assistant for Z, Rocket Software candor).
- **AI trong SaaS / adoption / ROI:** Userpilot × Emergence Capital "Beyond Benchmarks" (AI-native 4× tăng trưởng / +21% giữ chân, bolt-on vs built-in, RateGain analogy); Notion ($500M ARR, AI agent); WRITER × Workplace Intelligence (5× / 29% ROI); The New Stack "Hype→ROI" (Leo Goldfarb); Designli/Business of Apps (khảo sát SaaS founders); Zylo 2026 SaaS Management Index (108%); Qrvey; SFAI Labs; Fungies.io; Gleap (feature adoption); Intercom Fin (76%→45–53%, qua Macha/CloneDesk); CrewAI 2026 State of Agentic AI (khảo sát 500 lãnh đạo); Lorikeet (benchmark tỷ lệ giải quyết CSKH 2026).
- **Năng suất dev / DevOps / benchmark:** DORA 2025 (Google Cloud); METR (uplift study, J-curve); Microsoft arXiv (Claude Code + Copilot CLI, +24% PR); Faros AI Engineering Report 2026 (sự cố +243%); Opsera AI Coding Impact Benchmark; Plandek; byteiota/LinearB/Larridin/McKinsey/DX (benchmark 2026); arXiv "Debt Behind the AI Boom" (304.362 commit AI/6.275 repo, 24,2% lỗi còn sống).
- **Refactor/tech-debt bằng AI:** Thoughtworks "Ref-AI-ctoring" (Mario Fernández Pacheco — case gỡ thư viện chết, TDD làm guardrail, "1,5 năm rủi ro" gỡ trong <1 tháng).

### Số liệu "đầu bài" đã dùng (đừng lặp làm điểm nhấn chính)
304.362 commit AI/6.275 repo · 24,2% lỗi AI còn sống ở HEAD · 110.000+ lỗi tồn tới 02/2026 · code smell 89,1% · bảo mật khó dọn nhất 41,1% (arXiv Debt) · "1,5 năm rủi ro"/<1 tháng (Thoughtworks) · CrewAI: 65% dùng agent/100% mở rộng/31% quy trình tự động/ROI xếp chót 2%/bảo mật 34% · Lorikeet: resolution thật 30–50%→50–70%→70–85%, deflection≠resolution chênh ~30 điểm %, ticket người 1,25–4 USD vs AI ~1 USD, Gartner 80%/2029 · 70M+ dòng COBOL (Bankdata) · 687.600 dòng .NET / 47% (Experian) · 74% code migrate (Google) · 108% chi SaaS AI-native (Zylo) · 5× năng suất & 29% ROI (WRITER) · $500M ARR (Notion) · +24% PR (Microsoft) · sự cố +243% (Faros) · 76%→45–53% (Intercom Fin) · 4,6× chờ review + J-curve -19%→+18% (byteiota/LinearB/METR) · -46% việc lặp/<10% việc khó (McKinsey) · "90% là kiểm thử" + IBM -13,2% (Abstracta) · Gartner >70% mainframe exit 2026 fail · IBM cổ phiếu giảm 02/2026 · SaaS AI-native 4× tăng trưởng & +21% giữ chân · expansion revenue 58%→67% (>50tr/>100tr ARR) · Gartner 40% app có agent 2026 (từ <5%) · Deloitte 75% đầu tư agentic (Emergence/Userpilot).

---

## B. Mục lục theo số (mới → cũ)

### 09/08/2026 — "Discovery is not migration" & vì sao SaaS AI-native tăng trưởng 4×
- **Chủ đề:** Hiện đại hóa legacy · AI trong SaaS · Xu hướng
- **Nguồn:** Open Mainframe Project — Ramana Sree K V, "Discovery Is Not Migration…" (22/07/2026, openmainframeproject.org) · Userpilot — Yazan Sehwail, "AI in SaaS in 2026: Why AI-Native Companies Are Pulling Away" (22/07/2026, userpilot.com), dẫn Emergence Capital "Beyond Benchmarks"
- **Số chính:** Gartner dự báo >70% dự án mainframe exit khởi động 2026 sẽ không đạt lợi ích; cổ phiếu IBM giảm 02/2026 sau tuyên bố AI tăng tốc COBOL; Gartner tách "modernize tại chỗ" vs "platform exit" (AI phòng thủ tốt hơn ở vế đầu); watsonx Code Assistant for Z đặt discovery trước conversion; Rocket Software: viết lại COBOL→Java bằng AI "giống hệt chức năng nhưng không giá trị hơn". Emergence Capital (500+ SaaS B2B): AI-native tăng trưởng 4× & giữ chân +21%; expansion revenue 58% (sau 50tr ARR) → 67% (sau 100tr ARR); 74% phần mềm bán ảo, 50% giao dịch có đánh giá AI; Gartner 40% app doanh nghiệp có agent theo tác vụ vào 2026 (từ <5%/2025); Deloitte 75% đầu tư agentic AI; Airfocus 92% PM tin AI tác động lâu dài, 21% thiếu kỹ năng.
- **Thực thể:** Open Mainframe Project/Linux Foundation, Ramana Sree K V, Misty Decker, Gartner (mainframe exit), IBM watsonx Code Assistant for Z, Rocket Software, Userpilot/Yazan Sehwail (agent Lia), Emergence Capital "Beyond Benchmarks", RateGain/Bhanu Chopra, Deloitte, Airfocus, Hotjar/Mixpanel/Zendesk (bối cảnh).

### 09/08/2026 (SỐ SONG SONG) — Chuyên đề An toàn thông tin cho startup SaaS: 87% chạy lỗ hổng đã biết & con đường SOC 2
- **Chủ đề:** An toàn thông tin (chủ đề #4 mới) · AI trong SaaS
- **Nguồn:** Datadog "State of DevSecOps Report 2026" (26/02/2026, datadoghq.com — telemetry hàng chục nghìn app) · Scytale "How Much Does SOC 2 Compliance Cost in 2026?" (cập nhật 25/03/2026, scytale.ai — nhà cung cấp tự động hóa tuân thủ, số liệu chi phí là ước tính)
- **Số chính:** Datadog: 87% có ≥1 lỗ hổng khai thác được đang chạy; 42% dùng thư viện hết bảo trì; EOL language 50% vs 31%; dependency trễ 278 ngày (+63 so năm trước); 50% cập nhật lib trong 24h; chỉ 4% ghim GitHub Actions theo hash; chỉ 18% "critical" còn critical sau ngữ cảnh runtime. Scytale: audit SOC 2 $12k–$70k; đào tạo ~$2,5k, chính sách ~$8k, đánh giá rủi ro ~$2k, tư vấn ~$15k; tự động hóa tiết kiệm ~$25k/300+ giờ; 5 tiêu chí TSC (Security bắt buộc); Type II nghiêm/tốn hơn Type I.
- **Thực thể:** Datadog/Andrew Krug, Scytale/Meiran Galis, GitHub Actions (supply chain), AICPA SOC 2 (Type I/II, TSC).
- **Ghi chú:** file `2026-08-09-baomat.html` (phục vụ tại /2026-08-09-baomat), số thứ 2 cùng ngày 09/08 — KHÔNG đè số chính.

### 08/08/2026 — 100% doanh nghiệp mở rộng agentic AI, nhưng "tỷ lệ giải quyết" dễ đọc sai nhất
- **Chủ đề:** AI trong SaaS · Xu hướng & công cụ
- **Nguồn:** CrewAI "2026 State of Agentic AI" (qua Business Wire, 11/02/2026, businesswire.com) · Lorikeet "Resolution Rate Benchmarks 2026" (17/06/2026, lorikeetcx.ai) · Gartner (dự báo 05/03/2025, dẫn lại)
- **Số chính:** CrewAI khảo sát 500 lãnh đạo (dn >100tr USD, 5.000+ nhân viên, 7 khu vực); 65% đã dùng agent; 81% đã/đang mở rộng; 100% sẽ mở rộng; 74% coi production là ưu tiên/mệnh lệnh; 75% tác động cao tới tiết kiệm thời gian; 31% quy trình tự động, +33% kỳ vọng; tiêu chí chọn nền tảng: bảo mật 34% > tích hợp 30% > tin cậy 24% > ROI 2% (chót); rào cản: dữ liệu 35%/nhân lực 33%; 57% xây trên open-source. Lorikeet: deflection≠containment≠resolution (chênh >30 điểm %); khoảng thật 30–50%→50–70%→70–85%; 90%+ đáng ngờ; ticket người 1,25–4 USD vs AI ~1 USD; Gartner 80% vấn đề CSKH tự xử lý vào 2029 (từ double-digit thấp 2024).
- **Thực thể:** CrewAI/João Moura (dùng bởi 60% Fortune 500 US), Lorikeet, Gartner, Fin by Intercom/Decagon/Sierra/Zendesk AI (bảng định vị), Bank of America Erica (bối cảnh).

### 07/08/2026 — AI vừa trả nợ kỹ thuật vừa tạo nợ mới: "Ref-AI-ctoring" & 110.000 lỗi còn sống
- **Chủ đề:** Hiện đại hóa legacy · Quy trình sản xuất
- **Nguồn:** Thoughtworks (Mario Fernández Pacheco, 18/06/2026, thoughtworks.com) · arXiv 2603.28592v1 "Debt Behind the AI Boom" (03/2026)
- **Số chính:** case gỡ thư viện chết, "1,5 năm rủi ro"/<1 tháng, TDD làm guardrail; 304.362 commit AI/6.275 repo/5 công cụ; 484.606 lỗi (smell 89,1%/bug 5,8%/bảo mật 5,1%); >15% commit có lỗi (17,3% Copilot→28,7% Gemini); 24,2% lỗi còn sống ở HEAD; 110.000+ lỗi tồn tới 02/2026; bảo mật còn sống 41,1%; code smell net −18.134 nhưng bảo mật AI gây gần gấp đôi số vá.
- **Thực thể:** Thoughtworks/Mario Fernández Pacheco, GitHub Copilot/Claude/Cursor/Gemini/Devin, Pearce et al. (~40% code bảo mật có lỗ hổng), firecrawl (42 ngày), Stack Overflow 2025 (84%).

### 06/08/2026 — AI migrate được code, nhưng ai xác nhận nghiệp vụ? & benchmark năng suất 2026
- **Chủ đề:** Hiện đại hóa legacy · Quy trình sản xuất
- **Nguồn:** Abstracta (Federico Toledo, 11/06/2026) · byteiota (18/04/2026, dẫn LinearB/METR/Larridin/McKinsey/DX)
- **Số chính:** >90% dự án là kiểm thử; 1,5 năm test vs 1,5 tháng code; IBM -13,2%/ngày; PR AI chờ review 4,6×; J-curve -19%→+18%; McKinsey -46%/<10%; DX 13 phút≈$100k/năm.
- **Thực thể:** Abstracta/Tero, Michael Feathers, Anthropic Code Modernization Playbook, LinearB (8,1tr PR/4.800 đội), METR, Larridin, McKinsey (4.500 dev/150 dn), DX Index.

### 05/08/2026 — AI viết phần lớn code nhưng sự cố tăng 243% & "76%→45–53%" của bot
- **Chủ đề:** Quy trình sản xuất · AI trong SaaS · Xu hướng
- **Nguồn:** Faros AI Engineering Report 2026 (12/04/2026) · Macha & CloneDesk về Intercom Fin (01–07/2026)
- **Số chính:** sự cố +243%; Intercom Fin 76% → 45–53% thực tế.

### 04/08/2026 — Microsoft đo "nét bút thật" của AI coding: +24% PR & Toyota rời mainframe 1979
- **Chủ đề:** Quy trình sản xuất · Hiện đại hóa legacy
- **Nguồn:** arXiv/Microsoft Research (đầu 2026, Claude Code + Copilot CLI) · AWS Customer Stories (Toyota, 13/05/2026)
- **Số chính:** +24% PR; case Toyota mainframe 1979.

### 03/08/2026 — Notion để AI kéo doanh thu lên $500M & "không hiểu thì không hiện đại hóa"
- **Chủ đề:** AI trong SaaS · Hiện đại hóa legacy
- **Nguồn:** CNBC/The Tech Buzz (Notion, 18/09/2025) · Sourcegraph Blog (Matt Tanner, 14/05/2026)
- **Số chính:** $500M ARR; AI agent adoption Notion.

### 02/08/2026 — Mainframe hóa "cỗ máy in tiền AI" & DORA 2025: AI là loa phóng thanh
- **Chủ đề:** Hiện đại hóa legacy · Quy trình sản xuất
- **Nguồn:** Kyndryl State of Mainframe Modernization (09/09/2025) · Google Cloud DORA 2025 (23/09/2025, ~5.000 chuyên gia)
- **Số chính:** DORA "AI là amplifier"; khảo sát mainframe Kyndryl.

### 01/08/2026 — Nghịch lý AI doanh nghiệp: năng suất cá nhân 5× nhưng chỉ 29% thấy ROI
- **Chủ đề:** AI trong SaaS · Hiện đại hóa legacy
- **Nguồn:** WRITER × Workplace Intelligence (07/04/2026) · Devox Software 2026 Legacy Modernization Report (09/12/2025)
- **Số chính:** 5× năng suất; 29% ROI; 79% gặp thách thức.

### 31/07/2026 — Chi cho SaaS AI-native tăng 108% & Google để AI viết 74% một cuộc di trú
- **Chủ đề:** AI trong SaaS · Hiện đại hóa legacy
- **Nguồn:** Zylo 2026 SaaS Management Index (29/01/2026, >40tr license/$75B) · Google Research + arXiv (2024–2025, qua getDX)
- **Số chính:** 108% chi SaaS AI-native; 74% code do AI viết trong migrate.

### 30/07/2026 — Agentic AI migrate 687.600 dòng .NET & "AI có chủ đích" trong SaaS
- **Chủ đề:** Hiện đại hóa legacy · AI trong SaaS
- **Nguồn:** AWS Customer Stories (Experian, 18/06/2026) · Business of Apps/Designli (Keith Shields, 17/02/2026)
- **Số chính:** 687.600 dòng .NET; 15→8 sprint (~47%).

### 29/07/2026 — ROI của AI đến từ nơi không ai đặt ngân sách & bài học 9 triệu dòng code cũ
- **Chủ đề:** AI trong SaaS · Hiện đại hóa legacy
- **Nguồn:** MarketScale (27/07/2026, dẫn SAP & CIO Dive) · WSJ qua Entrepreneur (06/2025) · Devox
- **Số chính:** ROI đến từ chỗ bất ngờ; case 9 triệu dòng.

### 28/07/2026 — AI hiện đại hóa legacy & đường từ "hype" tới ROI
- **Chủ đề:** Hiện đại hóa legacy · AI trong SaaS
- **Nguồn:** Microsoft DevBlog (COBOL→Java, 09/07/2025) · The New Stack (Leo Goldfarb) · Faros (Góc nhìn)
- **Số chính:** 70M+ dòng COBOL Bankdata; GPT-4.1 + Semantic Kernel; ~30% thị phần NH Đan Mạch.

### 27/07/2026 — AI ra tiền cho SaaS, benchmark 250k lập trình viên & kiến trúc legacy
- **Chủ đề:** AI trong SaaS · Quy trình sản xuất · Xu hướng
- **Nguồn:** The New Stack · Opsera · TNGlobal · arXiv · (BCG, McKinsey trong tham chiếu)

### 26/07/2026 — Từ "điểm cộng" thành mặc định & câu hỏi năng suất AI chưa ngã ngũ
- **Chủ đề:** AI trong SaaS · Quy trình sản xuất
- **Nguồn:** Qrvey (12/05/2026) · METR (11/05/2026) · (Gartner, Forrester, Cisco, Zylo tham chiếu)

### 25/07/2026 — Case study AI trong SaaS & xây luồng AI code review
- **Chủ đề:** AI trong SaaS · Quy trình sản xuất
- **Nguồn:** SFAI Labs (27/02/2026) · Fungies.io (13/04/2026)

### 24/07/2026 — Feature adoption thời AI & benchmark 2.000+ team kỹ thuật
- **Chủ đề:** AI trong SaaS · Quy trình sản xuất
- **Nguồn:** Gleap (10/03/2026) · Plandek (17/03/2026)

---

## C. Từ điển thuật ngữ (đã giải thích ở các số — chỉ nhắc gọn khi tái dùng)

- **RPG (Report Program Generator):** ngôn ngữ IBM (1959) trên dòng midrange AS/400 / IBM i; phổ biến ở nghiệp vụ giao dịch (ngân hàng, bán lẻ, bảo hiểm). _Giải thích ở: 06/08._
- **COBOL:** ngôn ngữ nghiệp vụ cũ chạy trên mainframe; điển hình của legacy. _28/07, 04/08._
- **Mainframe:** máy chủ lớn IBM chạy khối lượng giao dịch tới hạn (Bankdata, Toyota, Kyndryl). _28/07, 02/08, 04/08._
- **Legacy code:** theo Michael Feathers, "code không có test"; hệ cũ ổn định nhưng thiếu tài liệu/kiểm thử. _06/08._
- **Technical debt (nợ kỹ thuật):** chi phí tương lai của các lối tắt/quyết định lỗi thời; AI có thể trả nhanh (refactor) nhưng cũng tạo thêm (code AI sinh). _07/08._
- **Code smell:** vấn đề bảo trì khiến code khó hiểu/sửa/tiến hoá (vd bắt exception quá rộng); loại nợ AI đưa vào nhiều nhất (89,1%). _07/08._
- **TDD (phát triển hướng kiểm thử):** viết test trước; test xanh làm "rào chắn" cho agent refactor mà không đổi hành vi. _07/08._
- **Ref-AI-ctoring:** thuật ngữ Thoughtworks — dùng AI tăng tốc điều tra/lập kế hoạch/thực thi refactor, con người vẫn quyết kiến trúc & rủi ro. _07/08._
- **Micro frontend / module federation:** kiến trúc chia frontend thành mảnh triển khai độc lập; "hợp đồng" module federation quy định phần nào được chia sẻ/dùng. _07/08._
- **Characterization testing:** chụp lại hành vi hệ cũ (input/output) rồi so với bản mới để phát hiện khác biệt khi migrate. _06/08._
- **Agentic AI / AI agent:** nhiều agent chuyên biệt phối hợp (phân tích, map phụ thuộc, sinh code) thay vì một prompt đơn. _28/07, 30/07._
- **Deflection / Containment / Resolution rate:** 3 con số hay bị gọi nhầm là "tỷ lệ giải quyết" — deflection = hội thoại không có người chạm (tính cả khách bỏ cuộc); containment = ở lại kênh AI; resolution = vấn đề được giải quyết end-to-end có xác minh. Chênh nhau >30 điểm %. _08/08._
- **Action-taking (khả năng hành động):** agent xâu chuỗi nhiều lệnh gọi công cụ (xác minh→kiểm tra→thực hiện→xác nhận) thay vì chỉ tra cứu-trả lời; đòn bẩy lớn nhất kéo tỷ lệ giải quyết lên. _08/08._
- **DevSecOps / shift-left:** đưa bảo mật vào sớm trong vòng đời phát triển (SAST/DAST/SCA, secret scanning) thay vì kiểm ở cuối. _09/08 (song song)._
- **Supply-chain security (bảo mật chuỗi cung ứng):** rủi ro từ thư viện/CI/CD bên thứ ba; giảm bằng ghim (pin) dependency & GitHub Actions theo commit hash, tránh dùng bản EOL. _09/08 (song song)._
- **SOC 2 (Type I/II, TSC):** chứng nhận về QUY TRÌNH bảo mật; Type I chụp một thời điểm, Type II kiểm vận hành qua thời gian; 5 tiêu chí Trust Services (Security bắt buộc). Là điều kiện bán hàng B2B chứ không đảm bảo "không có lỗ hổng". _09/08 (song song)._
- **MCP (Model Context Protocol):** lớp chuẩn để AI gọi công cụ/API theo ngữ cảnh. _28/07._
- **Discovery vs Migration:** "discovery" = AI đọc/hiểu/lập tài liệu/trích luật nghiệp vụ code cũ (AI giỏi); "migration" = chuyển đổi ngôn ngữ/nền tảng giữ đúng ngữ nghĩa nghiệp vụ (AI còn yếu, cần người kiểm chứng). Nhầm hai thứ này là nơi dự án exit đổ. _09/08._
- **Bolt-on vs Built-in AI (AI 1.0 vs 2.0):** bolt-on = chatbot dán ngoài, chỉ trả lời, vẫn cần người sửa; built-in = AI sống trong workflow, tự phát hiện + tự xử lý trước khi người vào cuộc. _09/08._
- **Modernize tại chỗ vs Platform exit:** Gartner tách 2 loại — hiện đại hóa ứng dụng tại chỗ vs rời hẳn nền tảng mainframe; AI hiện có giá trị phòng thủ được hơn ở vế đầu. _09/08._
- **Semantic Kernel / Quarkus:** khung điều phối agent của Microsoft / framework Java microservice (đích migrate COBOL). _28/07._
- **DORA & change failure rate:** bộ chỉ số giao hàng (throughput + độ ổn định); CFR = tỷ lệ thay đổi gây lỗi. _28/07, 02/08, 05/08._
- **Code churn / code turnover:** % code vừa merge bị revert/viết lại trong 30–90 ngày; thước đo chất lượng code AI. _05/08, 06/08._
- **PR cycle time:** thời gian từ mở tới merge một pull request; elite <8 giờ. _06/08._
- **CAT (Complexity-Adjusted Throughput):** chấm điểm PR theo độ khó (dễ 1, TB 3, khó 8) để đo năng suất công bằng. _06/08._
- **J-curve (đường cong học nghề):** dev kỳ cựu tụt lúc đầu rồi bật lên sau khi thành thạo AI. _06/08._
- **DevEx / DX Index:** chỉ số trải nghiệm lập trình viên; mỗi 1 điểm ≈ 13 phút/dev/tuần. _06/08._
- **ARR:** doanh thu định kỳ hằng năm (Notion $500M). _03/08._
- **ROI:** hoàn vốn — thước đo thực thay cho "tỷ lệ dùng AI". _nhiều số._
- **iPaaS:** nền tảng tích hợp dạng dịch vụ, thường nhúng để dựng lớp API/MCP cho SaaS. _28/07._
- **GSI (Global System Integrator):** nhà tích hợp hệ thống lớn; khách mainframe đang muốn giảm phụ thuộc. _28/07._

---

## D. Mẫu khối để THÊM khi ra số mới

```
### DD/MM/YYYY — <tiêu đề số>
- **Chủ đề:** <SaaS / Legacy / Quy trình / Xu hướng>
- **Nguồn:** <tên (tác giả, ngày) · domain> · <nguồn 2>
- **Số chính:** <các con số điểm nhấn>
- **Thực thể:** <công ty/báo cáo/người>
```
Sau khi thêm: cập nhật phần **A** (domain + công ty + số liệu mới) và **C** (thuật ngữ mới), rồi sửa "Cập nhật lần cuối / N số" ở đầu file.
