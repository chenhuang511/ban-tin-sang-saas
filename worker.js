/* ============================================================================
 * worker.js — Worker production cho site Bản tin sáng.
 * Nâng từ "static assets only" thành "assets + script nhỏ":
 *   1) /api/*  -> handleApi (highlight/favourite trên D1)
 *   2) mọi trang HTML -> tự chèn <script src="/reader.js" defer>
 *      (nhờ run_worker_first=true trong wrangler.toml, worker chạy trước khi trả asset)
 *   3) còn lại -> phục vụ tĩnh qua env.ASSETS (giữ nguyên URL đẹp /2026-08-22)
 *
 * Deploy:  cd D:\0-AI\0-Ban-tin  &&  npx wrangler deploy
 * ==========================================================================*/
import { handleApi } from "./worker-api.js";

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
  async fetch(request, env) {
    const url = new URL(request.url);

    // 1) API highlight/favourite
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }

    // 2) Phục vụ tĩnh (ASSETS binding tự xử lý URL đẹp + 404) rồi chèn reader.js
    const res = await env.ASSETS.fetch(request);
    return injectReader(res);
  }
};
