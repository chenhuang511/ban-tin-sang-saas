#!/usr/bin/env python3
# -*- coding: utf-8 -*-
# YEU CAU PYTHON 3. Neu 'python' cua ban la Python 2, dung ban Node: node reader\serve-local.js
"""
Server local để TEST tính năng highlight/favourite giống môi trường thật.
Mô phỏng rewrite của Cloudflare Worker:  /2026-08-22 -> 2026-08-22.html, /bo-suu-tap -> bo-suu-tap.html

Chạy (từ bất kỳ đâu):
    python reader\\serve-local.py
Rồi mở:  http://localhost:8000/2026-08-22

Ghi chú: /api/* sẽ trả 404 (chưa có backend) — reader.js tự chuyển sang chế độ
local-first, mọi thứ vẫn hoạt động và lưu trong trình duyệt.
"""
import http.server, socketserver, os, re, sys

PORT = int(sys.argv[1]) if len(sys.argv) > 1 else 8000
SITE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # thư mục site/ (cha của reader/)
os.chdir(SITE)

PRETTY = re.compile(r"^/(\d{4}-\d{2}-\d{2}(?:-[a-z]+)?|bo-suu-tap)$")

class Handler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        # API chưa có backend -> 404 gọn để reader.js fallback local
        if self.path.startswith("/api/"):
            self.send_error(404, "no local backend (expected)")
            return
        m = PRETTY.match(self.path.split("?")[0])
        if m and os.path.exists(m.group(1) + ".html"):
            self.path = "/" + m.group(1) + ".html"
        return super().do_GET()

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()

print(f"Phục vụ {SITE}\n  → http://localhost:{PORT}/2026-08-22\n  → http://localhost:{PORT}/bo-suu-tap\nCtrl+C để dừng.")
with socketserver.TCPServer(("127.0.0.1", PORT), Handler) as httpd:
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        pass
