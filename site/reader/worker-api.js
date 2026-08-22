/* ============================================================================
 * worker-api.js — Xử lý /api/* cho Highlight + Favourite (Cloudflare Worker + D1)
 * ----------------------------------------------------------------------------
 * Nhúng vào Worker hiện có (xem worker.example.js):
 *
 *   import { handleApi } from "./worker-api.js";
 *   export default {
 *     async fetch(request, env, ctx) {
 *       const url = new URL(request.url);
 *       if (url.pathname.startsWith("/api/")) return handleApi(request, env);
 *       return servePage(request, env, ctx);   // logic phục vụ trang tĩnh hiện tại
 *     }
 *   };
 *
 * Định danh: lấy email từ header do Cloudflare Access chèn:
 *   Cf-Access-Authenticated-User-Email
 * (Access đã xác thực JWT ở cổng; whitelist email trong dashboard Zero Trust.)
 * Dev cục bộ không qua Access: đặt env.DEV_EMAIL để giả lập.
 *
 * Yêu cầu binding D1 tên `DB` (xem wrangler.toml).
 * ==========================================================================*/

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}

function getEmail(request, env) {
  return request.headers.get("Cf-Access-Authenticated-User-Email")
    || (env && env.DEV_EMAIL)   // chỉ dùng khi phát triển cục bộ
    || null;
}

export async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "");
  const email = getEmail(request, env);

  // Điểm chạm đăng nhập: vì /api/* bị Cloudflare Access chặn, mở URL này sẽ kích hoạt
  // trang đăng nhập Google; sau khi đăng nhập, Access cho qua và ta redirect về `next`.
  if (path === "/login") {
    const next = url.searchParams.get("next") || "/";
    const dest = (next.startsWith("/") && !next.startsWith("//")) ? next : "/";
    return Response.redirect(new URL(dest, url.origin).toString(), 302);
  }
  // Đăng xuất (tiện dụng): xoá phiên Access rồi về trang chủ.
  if (path === "/logout") {
    return Response.redirect(new URL("/cdn-cgi/access/logout", url.origin).toString(), 302);
  }

  if (!email) return json({ error: "unauthenticated" }, 401);
  if (!env.DB) return json({ error: "no_database_binding" }, 500);

  try {
    // ---- /me -------------------------------------------------------------
    if (path === "/me" && request.method === "GET") {
      return json({ email });
    }

    // ---- /highlights -----------------------------------------------------
    if (path === "/highlights") {
      if (request.method === "GET") {
        const page = url.searchParams.get("page");
        const q = page
          ? env.DB.prepare("SELECT * FROM highlights WHERE email=? AND page=? ORDER BY created_at").bind(email, page)
          : env.DB.prepare("SELECT * FROM highlights WHERE email=? ORDER BY created_at").bind(email);
        const { results } = await q.all();
        return json(results.map(rowToHl));
      }
      if (request.method === "POST") {
        const h = await request.json();
        if (!h || !h.id || !h.page || !h.quote) return json({ error: "bad_request" }, 400);
        await env.DB.prepare(
          `INSERT INTO highlights (id,email,page,quote,prefix,suffix,anchor_id,start_off,end_off,color,note,created_at)
           VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
           ON CONFLICT(id) DO UPDATE SET color=excluded.color, note=excluded.note`
        ).bind(
          h.id, email, h.page, h.quote, h.prefix || "", h.suffix || "",
          h.anchorId || "", h.startOff || 0, h.endOff || 0,
          h.color || "y", h.note || "", h.createdAt || Date.now()
        ).run();
        return json({ ok: true });
      }
      if (request.method === "DELETE") {
        const id = url.searchParams.get("id");
        if (!id) return json({ error: "bad_request" }, 400);
        await env.DB.prepare("DELETE FROM highlights WHERE id=? AND email=?").bind(id, email).run();
        return json({ ok: true });
      }
    }

    // ---- /favourites -----------------------------------------------------
    if (path === "/favourites") {
      if (request.method === "GET") {
        const page = url.searchParams.get("page");
        if (page) {
          const row = await env.DB.prepare("SELECT created_at FROM favourites WHERE email=? AND page=?").bind(email, page).first();
          return json({ favourited: !!row, createdAt: row ? row.created_at : null });
        }
        const { results } = await env.DB.prepare("SELECT page, created_at FROM favourites WHERE email=? ORDER BY created_at DESC").bind(email).all();
        return json(results);
      }
      if (request.method === "POST") {
        const b = await request.json();
        if (!b || !b.page) return json({ error: "bad_request" }, 400);
        await env.DB.prepare(
          "INSERT INTO favourites (email,page,created_at) VALUES (?,?,?) ON CONFLICT(email,page) DO NOTHING"
        ).bind(email, b.page, Date.now()).run();
        return json({ ok: true });
      }
      if (request.method === "DELETE") {
        const page = url.searchParams.get("page");
        if (!page) return json({ error: "bad_request" }, 400);
        await env.DB.prepare("DELETE FROM favourites WHERE email=? AND page=?").bind(email, page).run();
        return json({ ok: true });
      }
    }

    return json({ error: "not_found" }, 404);
  } catch (err) {
    return json({ error: "server_error", detail: String(err && err.message || err) }, 500);
  }
}

function rowToHl(r) {
  return {
    id: r.id, page: r.page, quote: r.quote, prefix: r.prefix, suffix: r.suffix,
    anchorId: r.anchor_id, startOff: r.start_off, endOff: r.end_off,
    color: r.color, note: r.note, createdAt: r.created_at
  };
}
