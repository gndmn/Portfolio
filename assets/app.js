(() => {
  const SECTIONS = [
    { key: "motion",   title: "Motion Graphics", note: "things that move", cls: "grid--motion" },
    { key: "posters",  title: "Posters",         note: "big ideas, one page", cls: "grid--posters" },
    { key: "logos",    title: "Logos",           note: "small marks, big stories", cls: "grid--logos" },
    { key: "catalogs", title: "Catalogs",        note: "turn the pages", cls: "grid--catalogs" },
  ];
  const WORKS = window.WORKS || {};
  const root = document.getElementById("sections");
  const nav = document.getElementById("navLinks");
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let io; // video observer, created on first use
  document.getElementById("year").textContent = new Date().getFullYear();

  // Build sections in order; empty sections stay hidden.
  const aboutLink = nav.firstElementChild;
  SECTIONS.forEach((s) => {
    const items = WORKS[s.key] || [];
    if (!items.length) return;
    const a = el("a"); a.href = "#" + s.key; a.textContent = s.title.split(" ")[0];
    nav.insertBefore(a, aboutLink);

    const sec = el("section", "work"); sec.id = s.key;
    sec.innerHTML = `<div class="work__head"><h2 class="work__title">${s.title}</h2>
      <span class="work__note">${s.note}</span><span class="work__count">${String(items.length).padStart(2, "0")}</span></div>`;
    const grid = el("div", "grid " + s.cls);
    items.forEach((item) => grid.appendChild(card(item, s.key === "catalogs" ? "PAGES" : "IMAGES")));
    sec.appendChild(grid);
    root.appendChild(sec);
  });
  // About goes last in the menu
  nav.appendChild(aboutLink);

  function card(item, badgeWord) {
    const b = el("button", "card"); b.type = "button";
    const media = el("div", "card__media");
    let meta = "";
    if (item.type === "video") {
      const v = document.createElement("video");
      v.muted = true; v.loop = true; v.playsInline = true; v.preload = "none";
      v.setAttribute("muted", ""); v.dataset.src = item.src;
      if (item.cover) v.poster = item.cover;
      media.append(v, el("span", "play"));
      watch(v);
    } else {
      const img = document.createElement("img");
      img.loading = "lazy"; img.decoding = "async"; img.alt = item.title;
      img.src = item.type === "gallery" ? item.images[0] : item.src;
      media.appendChild(img);
      if (item.type === "gallery" && item.images.length > 1) {
        media.appendChild(el("span", "badge", `${item.images.length} ${badgeWord}`));
      }
    }
    b.append(media, el("span", "card__title", `<span>${esc(item.title)}</span>${meta ? `<span class="card__meta">${meta}</span>` : ""}`));
    b.addEventListener("click", () => openViewer(item, 0));
    b.setAttribute("aria-label", "Open " + item.title);
    return b;
  }

  // Video previews only load and play while on screen (saves mobile data).
  function watch(v) {
    if (!("IntersectionObserver" in window)) { v.src = v.dataset.src; return; }
    io = io || new IntersectionObserver((entries) => entries.forEach((e) => {
      const vid = e.target;
      if (e.isIntersecting) {
        if (!vid.src) { vid.preload = "metadata"; vid.src = vid.dataset.src + (vid.poster ? "" : "#t=0.1"); }
        if (!matchMedia("(prefers-reduced-motion: reduce)").matches) vid.play().catch(() => {});
      } else vid.pause();
    }), { rootMargin: "100px", threshold: 0.25 });
    io.observe(v);
  }

  // Lightbox
  const lb = document.getElementById("lightbox");
  const stage = lb.querySelector(".lb__stage");
  const cap = lb.querySelector(".lb__caption");
  const prev = lb.querySelector(".lb__prev"), next = lb.querySelector(".lb__next");
  let cur = null, idx = 0, lastFocus = null;

  function openViewer(item, i) {
    cur = item; idx = i; lastFocus = document.activeElement;
    lb.hidden = false; document.body.style.overflow = "hidden";
    render(); lb.querySelector(".lb__close").focus();
  }
  function closeViewer() {
    stage.innerHTML = ""; lb.hidden = true; document.body.style.overflow = ""; cur = null;
    if (lastFocus) lastFocus.focus();
  }
  function render() {
    stage.innerHTML = "";
    const pages = cur.type === "gallery" ? cur.images : null;
    if (cur.type === "video") {
      const v = document.createElement("video");
      v.src = cur.src; v.controls = true; v.autoplay = true; v.playsInline = true;
      if (cur.cover) v.poster = cur.cover;
      stage.appendChild(v);
    } else {
      const img = document.createElement("img");
      img.src = pages ? pages[idx] : cur.src; img.alt = cur.title;
      stage.appendChild(img);
    }
    const multi = pages && pages.length > 1;
    prev.hidden = next.hidden = !multi;
    cap.innerHTML = esc(cur.title) + (multi ? `<small>${idx + 1} / ${pages.length}</small>` : "");
    if (multi) [-1, 1].forEach((d) => { const n = pages[(idx + d + pages.length) % pages.length]; new Image().src = n; });
  }
  function step(d) {
    if (!cur || cur.type !== "gallery") return;
    idx = (idx + d + cur.images.length) % cur.images.length; render();
  }
  prev.addEventListener("click", () => step(-1));
  next.addEventListener("click", () => step(1));
  lb.querySelector(".lb__close").addEventListener("click", closeViewer);
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target === stage) closeViewer(); });
  document.addEventListener("keydown", (e) => {
    if (lb.hidden) return;
    if (e.key === "Escape") closeViewer();
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });
  let x0 = null;
  stage.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0; x0 = null;
    if (Math.abs(dx) > 50) step(dx < 0 ? 1 : -1);
  });
})();
