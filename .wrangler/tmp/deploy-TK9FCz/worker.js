var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// site/reader/worker-api.js
function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }
  });
}
__name(json, "json");
function getEmail(request, env) {
  return request.headers.get("Cf-Access-Authenticated-User-Email") || env && env.DEV_EMAIL || null;
}
__name(getEmail, "getEmail");
async function handleApi(request, env) {
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api/, "");
  const email = getEmail(request, env);
  if (!email) return json({ error: "unauthenticated" }, 401);
  if (!env.DB) return json({ error: "no_database_binding" }, 500);
  try {
    if (path === "/me" && request.method === "GET") {
      return json({ email });
    }
    if (path === "/highlights") {
      if (request.method === "GET") {
        const page = url.searchParams.get("page");
        const q = page ? env.DB.prepare("SELECT * FROM highlights WHERE email=? AND page=? ORDER BY created_at").bind(email, page) : env.DB.prepare("SELECT * FROM highlights WHERE email=? ORDER BY created_at").bind(email);
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
          h.id,
          email,
          h.page,
          h.quote,
          h.prefix || "",
          h.suffix || "",
          h.anchorId || "",
          h.startOff || 0,
          h.endOff || 0,
          h.color || "y",
          h.note || "",
          h.createdAt || Date.now()
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
__name(handleApi, "handleApi");
function rowToHl(r) {
  return {
    id: r.id,
    page: r.page,
    quote: r.quote,
    prefix: r.prefix,
    suffix: r.suffix,
    anchorId: r.anchor_id,
    startOff: r.start_off,
    endOff: r.end_off,
    color: r.color,
    note: r.note,
    createdAt: r.created_at
  };
}
__name(rowToHl, "rowToHl");

// worker.js
function injectReader(response) {
  const ct = response.headers.get("content-type") || "";
  if (!ct.includes("text/html")) return response;
  return new HTMLRewriter().on("body", {
    element(el) {
      el.append('<script src="/reader.js" defer><\/script>', { html: true });
    }
  }).transform(response);
}
__name(injectReader, "injectReader");
var worker_default = {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }
    const res = await env.ASSETS.fetch(request);
    return injectReader(res);
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
