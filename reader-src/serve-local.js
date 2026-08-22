/* Local test server cho tinh nang highlight/favourite (khong can cai gi ngoai Node).
 * Mo phong rewrite cua Cloudflare Worker: /2026-08-22 -> 2026-08-22.html, /bo-suu-tap -> bo-suu-tap.html
 *
 * Chay tu thu muc site:   node reader\serve-local.js
 * Roi mo:                 http://localhost:8000/2026-08-22
 *
 * /api/* tra 404 (chua co backend) -> reader.js tu chuyen sang che do local-first.
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = parseInt(process.argv[2], 10) || 8000;
const SITE = path.resolve(__dirname, "../site"); // thu muc site/ (cha cua reader/)

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/plain; charset=utf-8"
};

const PRETTY = /^\/(\d{4}-\d{2}-\d{2}(?:-[a-z]+)?|bo-suu-tap)$/;

http.createServer((req, res) => {
  let urlPath = decodeURIComponent(req.url.split("?")[0]);

  if (urlPath.startsWith("/api/")) {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("no local backend (expected)");
    return;
  }
  if (urlPath === "/") urlPath = "/index.html";

  const m = PRETTY.exec(urlPath);
  if (m && fs.existsSync(path.join(SITE, m[1] + ".html"))) {
    urlPath = "/" + m[1] + ".html";
  }

  // chan path traversal
  const filePath = path.join(SITE, path.normalize(urlPath).replace(/^(\.\.[\/\\])+/, ""));
  if (!filePath.startsWith(SITE)) {
    res.writeHead(403); res.end("forbidden"); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      res.end("404: " + urlPath);
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": "no-store"
    });
    res.end(data);
  });
}).listen(PORT, "127.0.0.1", () => {
  console.log("Phuc vu " + SITE);
  console.log("  -> http://localhost:" + PORT + "/2026-08-22");
  console.log("  -> http://localhost:" + PORT + "/bo-suu-tap");
  console.log("Ctrl+C de dung.");
});
