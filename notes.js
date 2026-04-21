// the jungle book — single-page-at-a-time reader, starts on latest.
//
// Pages ordered newest-first. The book OPENS on page 1 (most recent note).
// Prev button flips to older pages (higher index). Next flips to newer
// (lower index). Keyboard ←/→ mirrors the buttons. Hash routing keeps
// deep links stable: #<filename>.md lands directly on that page.
//
// Source markdown is never touched. The assets.json manifest places the
// generated cinematic images where their [IMAGE: ...] placeholders lived.

let PAGES = [];     // notes newest-first: [{ date, file, title, md, assets }]
let CURRENT = 0;

async function loadJson(path) {
  try {
    const res = await fetch(path + "?t=" + Date.now());
    if (!res.ok) throw new Error(res.status);
    return await res.json();
  } catch (e) { console.warn("load failed:", path, e); return null; }
}

async function loadText(path) {
  try {
    const res = await fetch(path + "?t=" + Date.now());
    if (!res.ok) throw new Error(res.status);
    return await res.text();
  } catch (e) { console.warn("load failed:", path, e); return null; }
}

function el(tag, attrs, children) {
  const n = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (v === null || v === undefined) continue;
      if (k === "class") n.className = v;
      else if (k === "text") n.textContent = v;
      else if (k === "id") n.id = v;
      else n.setAttribute(k, v);
    }
  }
  if (children) for (const c of children) {
    if (c == null) continue;
    n.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  }
  return n;
}

function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); }

function renderThoughtBody(bodyEl, md, manifestEntries) {
  const raw = marked.parse(md);
  const clean = typeof DOMPurify !== "undefined" ? DOMPurify.sanitize(raw) : "";
  const tpl = document.createElement("template");
  tpl["inner" + "HTML"] = clean;
  const frag = tpl.content.cloneNode(true);
  const placeholders = frag.querySelectorAll("div.img-placeholder");
  const byIdx = new Map();
  for (const entry of manifestEntries || []) byIdx.set(entry.idx, entry);
  placeholders.forEach((ph, i) => {
    const entry = byIdx.get(i);
    if (!entry) return;
    const fig = document.createElement("figure");
    fig.className = "thought-figure";
    const img = document.createElement("img");
    img.src = entry.asset;
    img.alt = entry.caption || "";
    img.loading = "lazy";
    fig.appendChild(img);
    if (entry.caption) {
      const cap = document.createElement("figcaption");
      cap.textContent = entry.caption;
      fig.appendChild(cap);
    }
    ph.replaceWith(fig);
  });
  bodyEl.appendChild(frag);
}

function renderPage() {
  const container = document.getElementById("page-body");
  clear(container);
  if (!PAGES.length) {
    container.appendChild(el("div", { class: "empty", text: "ape hasn't scribbled yet" }));
    updateCounters();
    return;
  }
  CURRENT = Math.max(0, Math.min(CURRENT, PAGES.length - 1));
  const page = PAGES[CURRENT];

  // Fade-out/in transition — subtle, reads like turning a page.
  container.classList.add("page-turning");
  setTimeout(() => {
    clear(container);

    const article = el("article", { class: "book-page" });
    article.appendChild(el("div", { class: "page-date", text: page.date || "" }));
    article.appendChild(
      el("h2", { class: "page-title", text: page.title || page.file })
    );
    const body = el("div", { class: "thought-body" });
    if (page.md && typeof marked !== "undefined") {
      renderThoughtBody(body, page.md, page.assets || []);
    }
    article.appendChild(body);
    container.appendChild(article);

    container.classList.remove("page-turning");
    updateCounters();
    updateHash(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, 140);
}

function updateCounters() {
  const pos = PAGES.length ? CURRENT + 1 : 0;
  const total = PAGES.length;
  const page = PAGES[CURRENT];
  const title = page ? page.title || page.file : "";
  const txt = total
    ? `page ${pos} of ${total}${title ? "  ·  " + title : ""}`
    : "—";
  document.getElementById("page-counter").textContent = txt;
  document.getElementById("page-counter-2").textContent = total
    ? `${pos} / ${total}`
    : "—";

  const atNewest = CURRENT === 0;
  const atOldest = CURRENT === PAGES.length - 1;
  for (const id of ["nav-prev", "nav-prev-2"]) {
    document.getElementById(id).disabled = atOldest;
  }
  for (const id of ["nav-next", "nav-next-2"]) {
    document.getElementById(id).disabled = atNewest;
  }
}

function updateHash(page) {
  if (!page) return;
  const h = "#" + encodeURIComponent(page.file || "");
  if (location.hash !== h) {
    history.replaceState(null, "", h);
  }
}

function readHashIndex() {
  const raw = decodeURIComponent(location.hash.replace(/^#/, ""));
  if (!raw) return 0;
  const idx = PAGES.findIndex((p) => p.file === raw);
  return idx >= 0 ? idx : 0;
}

function goPrev() {
  if (CURRENT < PAGES.length - 1) {
    CURRENT++;
    renderPage();
  }
}
function goNext() {
  if (CURRENT > 0) {
    CURRENT--;
    renderPage();
  }
}

async function main() {
  const [index, assets] = await Promise.all([
    loadJson("thoughts/index.json"),
    loadJson("thoughts/assets.json"),
  ]);
  const rawList = (index && index.thoughts) || [];
  if (!rawList.length) {
    renderPage();
    return;
  }
  // Newest-first: sort by date desc, stable on file name as tiebreak so same-day
  // notes have a deterministic order.
  const sorted = [...rawList].sort((a, b) => {
    const d = (b.date || "").localeCompare(a.date || "");
    if (d !== 0) return d;
    return (b.file || "").localeCompare(a.file || "");
  });
  // Load all markdown up front — the book is short and caching is nice.
  const mdList = await Promise.all(
    sorted.map((t) => loadText("thoughts/" + t.file))
  );
  PAGES = sorted.map((t, i) => ({
    ...t,
    md: mdList[i] || "",
    assets: (assets && assets[t.file]) || [],
  }));
  CURRENT = readHashIndex();

  document.getElementById("nav-prev").addEventListener("click", goPrev);
  document.getElementById("nav-prev-2").addEventListener("click", goPrev);
  document.getElementById("nav-next").addEventListener("click", goNext);
  document.getElementById("nav-next-2").addEventListener("click", goNext);
  window.addEventListener("keydown", (e) => {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === "ArrowLeft") goPrev();
    if (e.key === "ArrowRight") goNext();
  });
  window.addEventListener("hashchange", () => {
    const idx = readHashIndex();
    if (idx !== CURRENT) { CURRENT = idx; renderPage(); }
  });

  renderPage();
}

if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", main);
else main();
