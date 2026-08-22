/* ============================================================================
 * worker.example.js — Mẫu tích hợp handleApi vào Worker phục vụ site tĩnh.
 * ----------------------------------------------------------------------------
 * Nếu bạn ĐÃ có Worker riêng phục vụ /YYYY-MM-DD: chỉ cần thêm 2 dòng
 *   import { handleApi } ... và  if (path.startsWith("/api/")) return handleApi(...)
 * ở đầu fetch(), giữ nguyên phần phục vụ trang của bạn.
 *
 * Mẫu dưới dùng binding ASSETS (Workers Static Assets / Pages) làm ví dụ.
 * ==========================================================================*/
import { handleApi } from "./worker-api.js";

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1) API cho highlight/favourite
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    // 2) Rewrite /2026-08-22 -> /2026-08-22.html (giữ hành vi hiện tại của bạn)
    if (/^\/\d{4}-\d{2}-\d{2}(-[a-z]+)?$/.test(url.pathname)) {
      url.pathname += ".html";
      return env.ASSETS.fetch(new Request(url, request));
    }
    if (url.pathname === "/bo-suu-tap") {
      url.pathname = "/bo-suu-tap.html";
      return env.ASSETS.fetch(new Request(url, request));
    }

    // 3) Còn lại: phục vụ tĩnh
    return env.ASSETS.fetch(request);
  }
};
