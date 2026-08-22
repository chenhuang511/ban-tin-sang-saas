var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker-api.js
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
  if (path === "/login") {
    const next = url.searchParams.get("next") || "/";
    const dest = next.startsWith("/") && !next.startsWith("//") ? next : "/";
    return Response.redirect(new URL(dest, url.origin).toString(), 302);
  }
  if (path === "/logout") {
    return Response.redirect(new URL("/cdn-cgi/access/logout", url.origin).toString(), 302);
  }
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

// worker.example.js
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
var worker_example_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname.startsWith("/api/")) {
      return handleApi(request, env);
    }
    if (/^\/\d{4}-\d{2}-\d{2}(-[a-z]+)?$/.test(url.pathname)) {
      url.pathname += ".html";
    } else if (url.pathname === "/bo-suu-tap") {
      url.pathname = "/bo-suu-tap.html";
    }
    const res = await env.ASSETS.fetch(new Request(url, request));
    return injectReader(res);
  }
};

// C:/Users/User/AppData/Local/nvm/v22.23.1/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// C:/Users/User/AppData/Local/nvm/v22.23.1/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-NzU1ww/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_example_default;

// C:/Users/User/AppData/Local/nvm/v22.23.1/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-NzU1ww/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=worker.example.js.map
