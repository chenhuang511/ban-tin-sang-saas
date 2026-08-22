/* ============================================================================
 * reader.js — Highlight + Favourite cho Bản tin sáng
 * ----------------------------------------------------------------------------
 * Thiết kế: LOCAL-FIRST.
 *   - Mọi thao tác lưu ngay vào localStorage (chạy được offline / trước khi có backend).
 *   - Nếu API (/api/*) khả dụng (Cloudflare Worker + D1 + Access), tự đồng bộ 2 chiều.
 *   - Neo highlight theo mô hình W3C TextQuoteSelector (quote + prefix/suffix + offset)
 *     — bền vì trang số đã publish là bất biến.
 *
 * Nhúng vào mỗi trang số:  <script src="/reader.js" defer></script>
 * Không phụ thuộc thư viện ngoài. Chỉ tô trong vùng bài viết (.card, .dich).
 * ==========================================================================*/
(function () {
  "use strict";

  if (window.__btsReaderLoaded) return;   // chống nạp trùng (nếu vừa có <script> vừa được Worker chèn)
  window.__btsReaderLoaded = true;

  var API_BASE = "/api";          // Worker route; đổi nếu deploy khác origin
  var COLORS = [
    { key: "y", name: "Vàng",  bg: "#fef08a" },
    { key: "g", name: "Xanh",  bg: "#bbf7d0" },
    { key: "p", name: "Hồng",  bg: "#fbcfe8" },
    { key: "b", name: "Lam",   bg: "#bfdbfe" }
  ];
  // Chỉ cho bôi trong các khối nội dung này:
  var CONTENT_SELECTOR = "article.card, section.dich";

  // ---- Nhận diện trang -----------------------------------------------------
  function pageId() {
    var p = location.pathname.replace(/\/+$/, "");
    var last = p.split("/").pop() || "index";
    return last.replace(/\.html$/, "") || "index";
  }
  var PAGE = pageId();

  // ---- Lưu trữ local -------------------------------------------------------
  var LS_HL = "bts_highlights";     // { [page]: [ {id, page, quote, prefix, suffix, anchorId, startOff, endOff, color, note, createdAt, dirty, deleted} ] }
  var LS_FAV = "bts_favourites";    // { [page]: {page, createdAt, dirty, deleted} }
  var LS_EMAIL = "bts_email";       // email biết được từ /api/me (nếu có)

  function loadLS(key) { try { return JSON.parse(localStorage.getItem(key) || "{}"); } catch (e) { return {}; } }
  function saveLS(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)); } catch (e) {} }

  function getHighlights() {
    var all = loadLS(LS_HL);
    return (all[PAGE] || []).filter(function (h) { return !h.deleted; });
  }
  function putHighlight(h) {
    var all = loadLS(LS_HL);
    var arr = all[PAGE] || [];
    var i = arr.findIndex(function (x) { return x.id === h.id; });
    if (i >= 0) arr[i] = h; else arr.push(h);
    all[PAGE] = arr; saveLS(LS_HL, all);
  }
  function removeHighlightLocal(id) {
    var all = loadLS(LS_HL);
    var arr = all[PAGE] || [];
    var i = arr.findIndex(function (x) { return x.id === id; });
    if (i >= 0) { arr[i].deleted = true; arr[i].dirty = true; }
    all[PAGE] = arr; saveLS(LS_HL, all);
  }

  // ---- API (best-effort) ---------------------------------------------------
  var apiAvailable = false;
  function api(path, opts) {
    opts = opts || {};
    opts.credentials = "include";            // gửi cookie Cloudflare Access
    opts.headers = Object.assign({ "Content-Type": "application/json" }, opts.headers || {});
    return fetch(API_BASE + path, opts).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      var ct = r.headers.get("content-type") || "";
      return ct.indexOf("json") >= 0 ? r.json() : r.text();
    });
  }

  // Đồng bộ: kéo từ server, hợp nhất, đẩy các bản dirty lên.
  function sync() {
    return api("/me").then(function (me) {
      apiAvailable = true;
      if (me && me.email) { localStorage.setItem(LS_EMAIL, me.email); }
      return Promise.all([pullHighlights(), pullFavourite(), pushDirty()]);
    }).catch(function () {
      apiAvailable = false;   // backend chưa có → ở lại local, không sao
    });
  }

  function pullHighlights() {
    return api("/highlights?page=" + encodeURIComponent(PAGE)).then(function (rows) {
      var all = loadLS(LS_HL); var arr = all[PAGE] || [];
      rows.forEach(function (row) {
        var i = arr.findIndex(function (x) { return x.id === row.id; });
        if (i < 0) arr.push(Object.assign({}, row, { dirty: false }));
        else if (!arr[i].dirty) arr[i] = Object.assign({}, row, { dirty: false });
      });
      all[PAGE] = arr; saveLS(LS_HL, all);
    }).catch(function () {});
  }
  function pullFavourite() {
    return api("/favourites?page=" + encodeURIComponent(PAGE)).then(function (res) {
      var favs = loadLS(LS_FAV);
      if (res && res.favourited) favs[PAGE] = { page: PAGE, createdAt: res.createdAt || Date.now(), dirty: false };
      else if (favs[PAGE] && !favs[PAGE].dirty) delete favs[PAGE];
      saveLS(LS_FAV, favs);
    }).catch(function () {});
  }
  function pushDirty() {
    var all = loadLS(LS_HL); var arr = all[PAGE] || []; var chain = Promise.resolve();
    arr.forEach(function (h) {
      if (!h.dirty) return;
      if (h.deleted) {
        chain = chain.then(function () { return api("/highlights?id=" + encodeURIComponent(h.id), { method: "DELETE" }); })
          .then(function () { h.dirty = false; }).catch(function () {});
      } else {
        chain = chain.then(function () { return api("/highlights", { method: "POST", body: JSON.stringify(h) }); })
          .then(function () { h.dirty = false; }).catch(function () {});
      }
    });
    // favourite dirty
    var favs = loadLS(LS_FAV); var f = favs[PAGE];
    if (f && f.dirty) {
      if (f.deleted) chain = chain.then(function () { return api("/favourites?page=" + encodeURIComponent(PAGE), { method: "DELETE" }); }).then(function () { delete favs[PAGE]; saveLS(LS_FAV, favs); }).catch(function () {});
      else chain = chain.then(function () { return api("/favourites", { method: "POST", body: JSON.stringify({ page: PAGE }) }); }).then(function () { f.dirty = false; saveLS(LS_FAV, favs); }).catch(function () {});
    }
    return chain.then(function () { all[PAGE] = arr; saveLS(LS_HL, all); });
  }

  // ---- Neo văn bản: serialize / restore -----------------------------------
  function anchorEl(node) {
    var el = node.nodeType === 1 ? node : node.parentNode;
    while (el && el !== document.body) {
      if (el.id) return el;
      el = el.parentNode;
    }
    return document.body;
  }
  // Chỉ số ký tự của (node, offset) trong textContent của container
  function charIndex(container, node, offset) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    var idx = 0, n;
    while ((n = walker.nextNode())) {
      if (n === node) return idx + offset;
      idx += n.nodeValue.length;
    }
    return idx;
  }
  // Đổi chỉ số ký tự → {node, offset} trong container
  function nodeAt(container, target) {
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    var idx = 0, n;
    while ((n = walker.nextNode())) {
      var len = n.nodeValue.length;
      if (target <= idx + len) return { node: n, offset: target - idx };
      idx += len;
    }
    return null;
  }

  function serializeSelection(range) {
    var container = anchorEl(range.commonAncestorContainer);
    var startOff = charIndex(container, range.startContainer, range.startOffset);
    var endOff = charIndex(container, range.endContainer, range.endOffset);
    var text = container.textContent;
    return {
      anchorId: container.id || "",
      startOff: startOff,
      endOff: endOff,
      quote: range.toString(),
      prefix: text.slice(Math.max(0, startOff - 40), startOff),
      suffix: text.slice(endOff, endOff + 40)
    };
  }

  function restoreRange(h) {
    var container = h.anchorId ? document.getElementById(h.anchorId) : document.body;
    if (!container) return null;
    var text = container.textContent;
    var s = h.startOff, e = h.endOff;
    // Xác thực bằng quote; nếu lệch, dò lại bằng prefix+quote+suffix rồi chỉ quote.
    if (text.slice(s, e) !== h.quote) {
      var probe = (h.prefix || "") + h.quote + (h.suffix || "");
      var p = text.indexOf(probe);
      if (p >= 0) { s = p + (h.prefix || "").length; e = s + h.quote.length; }
      else {
        p = text.indexOf(h.quote);
        if (p < 0) return null;      // không tìm thấy → bỏ qua (không tô sai)
        s = p; e = p + h.quote.length;
      }
    }
    var a = nodeAt(container, s), b = nodeAt(container, e);
    if (!a || !b) return null;
    var range = document.createRange();
    range.setStart(a.node, a.offset);
    range.setEnd(b.node, b.offset);
    return range;
  }

  // ---- Tô màu một Range (có thể trải nhiều text node) ----------------------
  function textNodesInRange(range) {
    var container = range.commonAncestorContainer;
    if (container.nodeType === 3) return [{ node: container, start: range.startOffset, end: range.endOffset }];
    var walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, null);
    var out = [], n, started = false;
    while ((n = walker.nextNode())) {
      var inStart = n === range.startContainer;
      var inEnd = n === range.endContainer;
      if (inStart) started = true;
      if (started) {
        var s = inStart ? range.startOffset : 0;
        var e = inEnd ? range.endOffset : n.nodeValue.length;
        if (e > s) out.push({ node: n, start: s, end: e });
      }
      if (inEnd) break;
    }
    return out;
  }

  function paint(range, h) {
    var segs = textNodesInRange(range);
    segs.forEach(function (seg) {
      var r = document.createRange();
      r.setStart(seg.node, seg.start);
      r.setEnd(seg.node, seg.end);
      var mark = document.createElement("mark");
      mark.className = "uh";
      mark.dataset.uh = h.id;
      mark.style.background = colorBg(h.color);
      mark.style.borderRadius = "2px";
      mark.style.cursor = "pointer";
      if (h.note) mark.title = "📝 " + h.note;
      try { r.surroundContents(mark); } catch (e) { /* ranh giới phức tạp: bỏ seg này */ }
    });
  }
  function colorBg(key) {
    var c = COLORS.find(function (x) { return x.key === key; });
    return c ? c.bg : "#fef08a";
  }
  function unpaint(id) {
    document.querySelectorAll('mark.uh[data-uh="' + cssEsc(id) + '"]').forEach(function (m) {
      var parent = m.parentNode;
      while (m.firstChild) parent.insertBefore(m.firstChild, m);
      parent.removeChild(m);
      parent.normalize();
    });
  }
  function cssEsc(s) { return String(s).replace(/["\\]/g, "\\$&"); }

  function renderAll() {
    getHighlights().forEach(function (h) {
      if (document.querySelector('mark.uh[data-uh="' + cssEsc(h.id) + '"]')) return; // đã tô
      var range = restoreRange(h);
      if (range) paint(range, h);
    });
  }

  // ---- UI: thanh công cụ khi bôi chọn -------------------------------------
  var toolbar;
  function buildToolbar() {
    toolbar = document.createElement("div");
    toolbar.id = "uh-toolbar";
    var html = '<div class="uh-colors">';
    COLORS.forEach(function (c) {
      html += '<button class="uh-c" data-c="' + c.key + '" title="' + c.name + '" style="background:' + c.bg + '"></button>';
    });
    html += '</div><button class="uh-note" title="Thêm ghi chú">📝</button>';
    toolbar.innerHTML = html;
    document.body.appendChild(toolbar);

    toolbar.querySelectorAll(".uh-c").forEach(function (btn) {
      btn.addEventListener("mousedown", function (ev) {
        ev.preventDefault();
        createFromSelection(btn.dataset.c, null);
      });
    });
    toolbar.querySelector(".uh-note").addEventListener("mousedown", function (ev) {
      ev.preventDefault();
      var note = prompt("Ghi chú cho đoạn này:");
      if (note !== null) createFromSelection("y", note.trim());
    });
  }

  function showToolbar(rect) {
    if (!toolbar) buildToolbar();
    toolbar.style.display = "flex";
    var top = window.scrollY + rect.top - toolbar.offsetHeight - 8;
    var left = window.scrollX + rect.left + rect.width / 2 - toolbar.offsetWidth / 2;
    toolbar.style.top = Math.max(window.scrollY + 4, top) + "px";
    toolbar.style.left = Math.max(6, left) + "px";
  }
  function hideToolbar() { if (toolbar) toolbar.style.display = "none"; }

  function selectionInContent(sel) {
    if (!sel.rangeCount || sel.isCollapsed) return false;
    var node = sel.getRangeAt(0).commonAncestorContainer;
    var el = node.nodeType === 1 ? node : node.parentNode;
    return !!(el && el.closest && el.closest(CONTENT_SELECTOR));
  }

  document.addEventListener("mouseup", function () {
    setTimeout(function () {
      var sel = window.getSelection();
      if (selectionInContent(sel)) {
        var rect = sel.getRangeAt(0).getBoundingClientRect();
        if (rect && rect.width) showToolbar(rect);
      } else hideToolbar();
    }, 10);
  });
  document.addEventListener("mousedown", function (e) {
    if (toolbar && toolbar.contains(e.target)) return;
    hideToolbar();
  });

  function createFromSelection(color, note) {
    var sel = window.getSelection();
    if (!selectionInContent(sel)) return;
    var range = sel.getRangeAt(0);
    var meta = serializeSelection(range);
    if (!meta.quote.trim()) return;
    var h = Object.assign({
      id: uid(),
      page: PAGE,
      color: color,
      note: note || "",
      createdAt: Date.now(),
      dirty: true,
      deleted: false
    }, meta);
    paint(range, h);
    putHighlight(h);
    sel.removeAllRanges();
    hideToolbar();
    if (apiAvailable) pushDirty();
  }

  // ---- Click vào highlight đã tô: popover xoá / xem ghi chú ----------------
  document.addEventListener("click", function (e) {
    var mark = e.target.closest && e.target.closest("mark.uh");
    if (!mark) { removePopover(); return; }
    e.stopPropagation();
    openPopover(mark);
  });
  var popover;
  function openPopover(mark) {
    removePopover();
    var id = mark.dataset.uh;
    var h = getHighlights().find(function (x) { return x.id === id; });
    popover = document.createElement("div");
    popover.id = "uh-pop";
    popover.innerHTML =
      (h && h.note ? '<div class="uh-pop-note">📝 ' + escapeHtml(h.note) + "</div>" : "") +
      '<div class="uh-pop-actions">' +
      (h ? '<button class="uh-share1">🔗 Chia sẻ</button>' : "") +
      '<button class="uh-del">🗑 Xoá</button></div>';
    document.body.appendChild(popover);
    var rect = mark.getBoundingClientRect();
    popover.style.top = window.scrollY + rect.bottom + 6 + "px";
    popover.style.left = window.scrollX + rect.left + "px";
    popover.querySelector(".uh-del").addEventListener("click", function () {
      unpaint(id); removeHighlightLocal(id); removePopover();
      if (apiAvailable) pushDirty();
    });
    var sb = popover.querySelector(".uh-share1");
    if (sb) sb.addEventListener("click", function () { shareOne(h); removePopover(); });
  }
  function removePopover() { if (popover) { popover.remove(); popover = null; } }

  // ---- Nút Favourite ở backbar --------------------------------------------
  function isFav() { var f = loadLS(LS_FAV)[PAGE]; return !!(f && !f.deleted); }
  function setFav(on) {
    var favs = loadLS(LS_FAV);
    if (on) favs[PAGE] = { page: PAGE, createdAt: Date.now(), dirty: true, deleted: false };
    else if (favs[PAGE]) { favs[PAGE].deleted = true; favs[PAGE].dirty = true; }
    saveLS(LS_FAV, favs);
    if (apiAvailable) pushDirty();
  }
  function mountFavButton() {
    var backbar = document.querySelector(".backbar");
    if (!backbar || PAGE === "index" || PAGE === "bo-suu-tap") return;
    var btn = document.createElement("button");
    btn.id = "uh-fav";
    function refresh() { btn.innerHTML = (isFav() ? "♥ Đã thích" : "♡ Yêu thích"); btn.classList.toggle("on", isFav()); btn.title = (isFav() ? "Bỏ khỏi mục yêu thích" : "Thêm vào mục yêu thích để đọc lại / chia sẻ"); }
    btn.addEventListener("click", function () { setFav(!isFav()); refresh(); });
    backbar.appendChild(btn);
    // nút Chia sẻ
    var sh = document.createElement("button");
    sh.id = "uh-share"; sh.type = "button"; sh.textContent = "🔗 Chia sẻ";
    sh.title = "Copy link kèm các đoạn bạn đã tô để gửi cho người khác";
    sh.addEventListener("click", doShare);
    backbar.appendChild(sh);
    // link tới Bộ sưu tập
    var col = document.createElement("a");
    col.href = "/bo-suu-tap"; col.id = "uh-collink"; col.textContent = "🔖 Bộ sưu tập";
    backbar.appendChild(col);
    refresh();
  }

  // ---- Chia sẻ highlight qua URL ------------------------------------------
  function b64EncodeUnicode(str) { return btoa(unescape(encodeURIComponent(str))); }
  function b64DecodeUnicode(str) { return decodeURIComponent(escape(atob(str))); }

  function shareUrlFor(list) {
    var base = location.origin + location.pathname;
    var hs = (list || []).map(function (h) { return { q: h.quote, p: h.prefix, s: h.suffix, a: h.anchorId, c: h.color }; });
    if (!hs.length) return base;
    return base + "?hl=" + encodeURIComponent(b64EncodeUnicode(JSON.stringify(hs)));
  }
  function buildShareUrl() { return shareUrlFor(getHighlights()); }
  function shareOne(h) {
    if (!h) return;
    var url = shareUrlFor([h]);
    if (navigator.share) {
      navigator.share({ title: document.title, url: url }).catch(function () { copyText(url).then(function () { toast("Đã copy link đoạn này"); }); });
    } else {
      copyText(url).then(function () { toast("Đã copy link đoạn này"); }).catch(function () { prompt("Copy link đoạn này:", url); });
    }
  }
  function copyText(txt) {
    if (navigator.clipboard && navigator.clipboard.writeText) return navigator.clipboard.writeText(txt);
    return new Promise(function (res, rej) {
      try { var ta = document.createElement("textarea"); ta.value = txt; ta.style.position = "fixed"; ta.style.opacity = "0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); res(); }
      catch (e) { rej(e); }
    });
  }
  function doShare() {
    var url = buildShareUrl(), n = getHighlights().length;
    var msg = n ? ("Đã copy link kèm " + n + " đoạn tô") : "Đã copy link trang";
    if (navigator.share) {
      navigator.share({ title: document.title, url: url }).catch(function () { copyText(url).then(function () { toast(msg); }); });
    } else {
      copyText(url).then(function () { toast(msg); }).catch(function () { prompt("Copy link chia sẻ:", url); });
    }
  }
  function toast(m) {
    var t = document.createElement("div"); t.className = "uh-toast"; t.textContent = m;
    document.body.appendChild(t);
    setTimeout(function () { t.style.opacity = "0"; }, 1600);
    setTimeout(function () { t.remove(); }, 2100);
  }

  // Hiển thị highlight được CHIA SẺ (từ tham số ?hl=) — chỉ để xem, không tự lưu
  var sharedData = null;
  function paintShared(range, color) {
    textNodesInRange(range).forEach(function (seg) {
      var r = document.createRange(); r.setStart(seg.node, seg.start); r.setEnd(seg.node, seg.end);
      var mark = document.createElement("mark"); mark.className = "uh-shared"; mark.style.background = colorBg(color);
      try { r.surroundContents(mark); } catch (e) {}
    });
  }
  function unpaintShared() {
    document.querySelectorAll("mark.uh-shared").forEach(function (m) {
      var p = m.parentNode; while (m.firstChild) p.insertBefore(m.firstChild, m); p.removeChild(m); p.normalize();
    });
  }
  function stripHl() { try { history.replaceState(null, "", location.pathname); } catch (e) {} }
  function renderShared() {
    var m = /[?&]hl=([^&]+)/.exec(location.search); if (!m) return;
    var arr; try { arr = JSON.parse(b64DecodeUnicode(decodeURIComponent(m[1]))); } catch (e) { return; }
    if (!Array.isArray(arr) || !arr.length) return;
    var painted = 0;
    arr.forEach(function (o) {
      var range = restoreRange({ quote: o.q, prefix: o.p, suffix: o.s, anchorId: o.a, color: o.c });
      if (range) { paintShared(range, o.c); painted++; }
    });
    if (painted) {
      sharedData = arr; showSharedBanner(painted);
      var first = document.querySelector("mark.uh-shared");
      if (first) setTimeout(function () { first.scrollIntoView({ behavior: "smooth", block: "center" }); }, 120);
    }
  }
  function showSharedBanner(n) {
    var b = document.createElement("div"); b.id = "uh-sharebanner";
    b.innerHTML = '<span>🔗 ' + n + ' đoạn được chia sẻ với bạn</span>' +
      '<button class="uh-save">Lưu vào của tôi</button><button class="uh-hide">Ẩn</button>';
    document.body.appendChild(b);
    b.querySelector(".uh-save").addEventListener("click", saveShared);
    b.querySelector(".uh-hide").addEventListener("click", function () { unpaintShared(); b.remove(); stripHl(); });
  }
  function saveShared() {
    if (!sharedData) return;
    unpaintShared();     // dọn marks chia sẻ trước khi tô lại thành của mình
    sharedData.forEach(function (o) {
      var h = { id: uid(), page: PAGE, quote: o.q, prefix: o.p, suffix: o.s, anchorId: o.a, color: o.c || "y", note: "", createdAt: Date.now(), dirty: true, deleted: false };
      var range = restoreRange(h); if (range) { paint(range, h); putHighlight(h); }
    });
    var b = document.getElementById("uh-sharebanner"); if (b) b.remove();
    stripHl();
    if (apiAvailable) pushDirty();
    toast("Đã lưu vào highlight của bạn");
  }

  // ---- Tiện ích ------------------------------------------------------------
  function uid() { return "h_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8); }
  function escapeHtml(s) { return String(s).replace(/[&<>"]/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]; }); }

  // ---- CSS -----------------------------------------------------------------
  function injectCSS() {
    var css = ''
      + '#uh-toolbar{position:absolute;z-index:9999;display:none;gap:6px;align-items:center;background:#111;color:#fff;padding:6px 8px;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.25)}'
      + '#uh-toolbar .uh-colors{display:flex;gap:5px}'
      + '#uh-toolbar .uh-c{width:20px;height:20px;border:2px solid #fff;border-radius:50%;cursor:pointer;padding:0}'
      + '#uh-toolbar .uh-note{background:#333;color:#fff;border:none;border-radius:6px;padding:2px 7px;cursor:pointer;font-size:14px}'
      + '#uh-pop{position:absolute;z-index:9999;background:#fff;border:1px solid #e5e7eb;border-radius:10px;box-shadow:0 4px 14px rgba(0,0,0,.18);padding:8px 10px;font-size:13px;max-width:260px}'
      + '#uh-pop .uh-pop-note{margin-bottom:6px;color:#374151}'
      + '#uh-pop .uh-pop-actions{display:flex;gap:8px}'
      + '#uh-pop .uh-del{background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;border-radius:7px;padding:4px 10px;cursor:pointer;font-size:13px}'
      + '#uh-pop .uh-share1{background:#ecfeff;color:#0e7490;border:1px solid #a5f3fc;border-radius:7px;padding:4px 10px;cursor:pointer;font-size:13px}'
      + '#uh-fav{margin-left:8px;font-size:13px;background:#fff1f2;color:#e11d48;border:1px solid #fecdd3;border-radius:20px;padding:6px 14px;cursor:pointer}'
      + '#uh-fav.on{background:#e11d48;color:#fff;border-color:#e11d48}'
      + '#uh-collink{margin-left:8px;font-size:13px;background:#eef2ff;color:#4338ca;border-radius:20px;padding:6px 14px;text-decoration:none}'
      + '#uh-auth{position:fixed;right:14px;bottom:14px;z-index:9998;display:flex;align-items:center;gap:9px;font-size:13px;background:#111;color:#fff;border-radius:22px;padding:8px 14px;box-shadow:0 4px 14px rgba(0,0,0,.28)}'
      + '#uh-auth a{color:#fff;text-decoration:none}'
      + '#uh-auth .uh-who{max-width:190px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'
      + '#uh-auth .uh-logout{background:#374151;border-radius:14px;padding:3px 10px;font-size:12px}'
      + '#uh-auth .uh-login{font-weight:600}'
      + '#uh-share{margin-left:8px;font-size:13px;background:#ecfeff;color:#0e7490;border:1px solid #a5f3fc;border-radius:20px;padding:6px 14px;cursor:pointer}'
      + 'mark.uh-shared{padding:0;border-radius:2px;box-shadow:inset 0 -2px 0 rgba(0,0,0,.28)}'
      + '.uh-toast{position:fixed;left:50%;bottom:70px;transform:translateX(-50%);z-index:10000;background:#111;color:#fff;font-size:13px;padding:9px 16px;border-radius:20px;box-shadow:0 4px 14px rgba(0,0,0,.3);transition:opacity .4s}'
      + '#uh-sharebanner{position:fixed;left:50%;top:12px;transform:translateX(-50%);z-index:10000;display:flex;align-items:center;gap:10px;background:#0e7490;color:#fff;font-size:13px;padding:8px 12px;border-radius:12px;box-shadow:0 4px 14px rgba(0,0,0,.28);max-width:92vw;flex-wrap:wrap;justify-content:center}'
      + '#uh-sharebanner button{border:none;border-radius:14px;padding:4px 11px;font-size:12px;cursor:pointer}'
      + '#uh-sharebanner .uh-save{background:#fff;color:#0e7490;font-weight:600}'
      + '#uh-sharebanner .uh-hide{background:rgba(255,255,255,.22);color:#fff}'
      + 'mark.uh{padding:0}';
    var st = document.createElement("style");
    st.textContent = css;
    document.head.appendChild(st);
  }

  // ---- Khởi động -----------------------------------------------------------
  // Thanh trạng thái nổi: đã đăng nhập → hiện email + nút Đăng xuất; chưa → nút Đăng nhập.
  function mountAuthBar() {
    var ex = document.getElementById("uh-auth");
    if (ex) ex.remove();
    var wrap = document.createElement("div");
    wrap.id = "uh-auth";
    if (apiAvailable) {
      var email = localStorage.getItem(LS_EMAIL) || "";
      wrap.innerHTML =
        '<span class="uh-who" title="' + escapeHtml(email) + '">👤 ' + escapeHtml(email || "đã đăng nhập") + '</span>' +
        '<a class="uh-logout" href="' + API_BASE + '/logout">Đăng xuất</a>';
    } else {
      wrap.innerHTML =
        '<a class="uh-login" href="' + API_BASE + '/login?next=' + encodeURIComponent(location.pathname + location.search) + '"' +
        ' title="Đăng nhập Google để lưu highlight & yêu thích trên mọi thiết bị">🔐 Đăng nhập để đồng bộ</a>';
    }
    document.body.appendChild(wrap);
  }

  function init() {
    injectCSS();
    mountFavButton();
    renderAll();          // tô ngay từ local
    renderShared();       // hiện các đoạn được chia sẻ qua ?hl= (nếu có)
    sync().then(function () {
      renderAll();        // tô thêm phần kéo từ server (nếu có)
      mountAuthBar();     // hiện email + đăng xuất, hoặc nút đăng nhập
    });
  }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();

  // API nội bộ cho trang Bộ sưu tập dùng lại
  window.BTSReader = {
    api: api,
    localHighlights: function () { return loadLS(LS_HL); },
    localFavourites: function () { return loadLS(LS_FAV); }
  };
})();
