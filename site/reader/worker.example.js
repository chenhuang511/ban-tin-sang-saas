/* ============================================================================
 * worker.example.js — Mẫu tích hợp vào Worker phục vụ site tĩnh.
 * ----------------------------------------------------------------------------
 * Làm 2 việc:
 *   1) Định tuyến /api/* -> handleApi (highlight/favourite).
 *   2) Tự CHÈN <script src="/reader.js" defer> vào mọi trang HTML lúc phục vụ,
 *      bằng HTMLRewriter — nên KHÔNG phải sửa 31 file số cũ hay đổi SKILL.
 *
 * Nếu bạn ĐÃ có Worker riêng: chỉ cần bê 2 khối đánh dấu [THÊM] vào worker đó.
 * Mẫu dưới dùng binding ASSETS làm ví dụ phục vụ tĩnh.
 * ==========================================================================*/
import { handleApi } from "./worker-api.js";

// [THÊM] Chèn reader.js trước </body> của mọi response HTML.
function injectReader(response) {
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return response;
  return new HTMLRewriter()
    .on("body", {
      element(el) {
        el.append('<script src="/reader.js" defer></script>', { html: true });
      }
    })
    .transform(response);
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // [THÊM] 1) API cho highlight/favourite
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    // 2) Rewrite URL đẹp -> .html (giữ hành vi hiện tại của bạn)
    if (/^\/\d{4}-\d{2}-\d{2}(-[a-z]+)?$/.test(url.pathname)) {
      url.pathname += ".html";
    } else if (url.pathname === "/bo-suu-tap") {
      url.pathname = "/bo-suu-tap.html";
    }

    // 3) Lấy trang tĩnh rồi chèn reader.js
    const res = await env.ASSETS.fetch(new Request(url, request));
    return injectReader(res);   // [THÊM]
  }
};
