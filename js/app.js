/* CourseHub app — shared behaviour for every page.
   Theme toggle, pointer glow, breakpoint watcher, toasts, nav condense,
   count-up stats, featured courses, liquid-filter detection, scroll reveals.
   One namespace: window.CourseHub. Plain script, no modules. */
(function () {
  "use strict";

  var NS = (window.CourseHub = window.CourseHub || {});
  var THEME_KEY = "coursehub-theme";
  var SAVE_KEY = "coursehub-saved";

  /* ---------- safe storage ---------- */
  function read(key) {
    try { return window.localStorage.getItem(key); }
    catch (e) { return null; }
  }
  function write(key, value) {
    try { window.localStorage.setItem(key, value); return true; }
    catch (e) { return false; }
  }
  NS.store = { read: read, write: write };

  /* ---------- saved courses ---------- */
  function getSaved() {
    try {
      var raw = read(SAVE_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }
  function setSaved(ids) { write(SAVE_KEY, JSON.stringify(ids)); }
  function isSaved(id) { return getSaved().indexOf(id) !== -1; }
  function toggleSaved(id) {
    var ids = getSaved();
    var i = ids.indexOf(id);
    var nowSaved;
    if (i === -1) { ids.push(id); nowSaved = true; }
    else { ids.splice(i, 1); nowSaved = false; }
    setSaved(ids);
    return nowSaved;
  }
  NS.saved = { get: getSaved, is: isSaved, toggle: toggleSaved };

  function courseById(id) {
    var list = (NS.data && NS.data.courses) || [];
    for (var i = 0; i < list.length; i++) {
      if (list[i].id === id) return list[i];
    }
    return null;
  }
  NS.courseById = courseById;

  /* ---------- toasts ---------- */
  function toast(message) {
    var stack = document.getElementById("toast-stack");
    if (!stack) return;
    var el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    el.textContent = message;
    stack.appendChild(el);
    window.setTimeout(function () {
      el.classList.add("leaving");
      window.setTimeout(function () { el.remove(); }, 320);
    }, 2600);
  }
  NS.toast = toast;

  /* ---------- theme: system / light / dark ---------- */
  var ORDER = ["system", "light", "dark"];
  function currentTheme() {
    var t = read(THEME_KEY);
    return ORDER.indexOf(t) === -1 ? "system" : t;
  }
  function effectiveTheme() {
    var t = currentTheme();
    if (t !== "system") return t;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  function paintThemeButton() {
    var btn = document.getElementById("theme-toggle");
    if (!btn) return;
    var t = currentTheme();
    var eff = effectiveTheme();
    btn.setAttribute("aria-label", "Theme: " + t + " (showing " + eff + "). Activate to switch theme.");
    var icons = btn.querySelectorAll(".icon");
    for (var i = 0; i < icons.length; i++) icons[i].hidden = true;
    var show = btn.querySelector(t === "system" ? ".icon-auto" : t === "light" ? ".icon-sun" : ".icon-moon");
    if (show) show.hidden = false;
  }
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    write(THEME_KEY, t);
    paintThemeButton();
  }
  function initTheme() {
    var btn = document.getElementById("theme-toggle");
    applyTheme(currentTheme());
    if (btn) {
      btn.addEventListener("click", function () {
        var next = ORDER[(ORDER.indexOf(currentTheme()) + 1) % ORDER.length];
        applyTheme(next);
        toast("Theme: " + next);
      });
    }
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", paintThemeButton);
    }
  }

  /* ---------- pointer-following specular highlight (rAF, fine pointers) ---------- */
  function initGlow() {
    var fine = window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;
    var targets = document.querySelectorAll(".glass, .glass-1, .glass-2, .glass-3, .main-nav");
    var raf = null;
    function onMove(e) {
      var t = e.target && e.target.closest ? e.target.closest(".glass, .glass-1, .glass-2, .glass-3, .main-nav") : null;
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(function () {
        for (var i = 0; i < targets.length; i++) targets[i].style.removeProperty("--mx"), targets[i].style.removeProperty("--my");
        if (t) {
          var r = t.getBoundingClientRect();
          t.style.setProperty("--mx", ((e.clientX - r.left) / r.width * 100).toFixed(1) + "%");
          t.style.setProperty("--my", ((e.clientY - r.top) / r.height * 100).toFixed(1) + "%");
        }
      });
    }
    document.addEventListener("pointermove", onMove, { passive: true });
  }

  /* ---------- breakpoint watcher: highlight the matching device frame ---------- */
  function initBreakpoints() {
    if (!window.matchMedia) return;
    var frames = document.querySelectorAll(".device-frame");
    if (!frames.length) return;
    var mqTablet = window.matchMedia("(min-width: 768px)");
    var mqDesktop = window.matchMedia("(min-width: 1024px)");
    function update() {
      var bp = mqDesktop.matches ? "desktop" : mqTablet.matches ? "tablet" : "mobile";
      document.body.setAttribute("data-bp", bp);
      for (var i = 0; i < frames.length; i++) {
        frames[i].classList.toggle("is-active", frames[i].getAttribute("data-device") === bp);
      }
    }
    mqTablet.addEventListener("change", update);
    mqDesktop.addEventListener("change", update);
    update();
  }

  /* ---------- nav condense on scroll (sentinel observer) ---------- */
  function initNavCondense() {
    var sentinel = document.querySelector(".nav-sentinel");
    if (!sentinel || !("IntersectionObserver" in window)) return;
    new IntersectionObserver(function (entries) {
      document.body.classList.toggle("is-scrolled", !entries[0].isIntersecting);
    }, { threshold: 0 }).observe(sentinel);
  }

  /* ---------- count-up stats ---------- */
  function initCountUp() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;
    function format(value, decimals) {
      return decimals > 0
        ? value.toFixed(decimals)
        : Math.round(value).toLocaleString("en-US");
    }
    function animate(el) {
      var target = parseFloat(el.getAttribute("data-count"));
      var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
      var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced || !("requestAnimationFrame" in window)) {
        el.textContent = format(target, decimals);
        return;
      }
      var dur = 1400, start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = format(target * eased, decimals);
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
    if (!("IntersectionObserver" in window)) {
      for (var i = 0; i < nums.length; i++) animate(nums[i]);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { animate(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.4 });
    for (var j = 0; j < nums.length; j++) io.observe(nums[j]);
  }

  /* ---------- inline SVG thumbnails (no heavy images) ---------- */
  function thumbSVG(course) {
    if (course.image) {
      return '<img src="' + esc(course.image) + '" alt="' + esc(course.title) + ' Thumbnail" loading="lazy" style="width: 100%; height: 100%; object-fit: cover; display: block;">';
    }
    var p = course.pattern || "grid";
    var inner = "";
    if (p === "grid") {
      inner = '<g stroke="#7A5648" stroke-width="2" opacity="0.55">' +
        '<path d="M40 30h320M40 90h320M40 150h320M40 210h320M100 10v205M200 10v205M300 10v205"/></g>' +
        '<circle cx="200" cy="120" r="44" fill="#A47864" opacity="0.85"/>' +
        '<circle cx="200" cy="120" r="44" fill="none" stroke="#F2F0EA" stroke-width="5"/>' +
        '<path d="M188 108l9 9 16-18" stroke="#F2F0EA" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>';
    } else if (p === "waves") {
      inner = '<g fill="none" stroke="#A0D4E0" stroke-width="7" opacity="0.9">' +
        '<path d="M-10 80q50-40 100 0t100 0 100 0 100 0"/>' +
        '<path d="M-10 130q50-40 100 0t100 0 100 0 100 0" opacity="0.65"/>' +
        '<path d="M-10 180q50-40 100 0t100 0 100 0 100 0" opacity="0.4"/></g>' +
        '<circle cx="308" cy="62" r="26" fill="#A47864" opacity="0.85"/>';
    } else if (p === "bars") {
      inner = '<g fill="#7A5648" opacity="0.7">' +
        '<rect x="60" y="130" width="34" height="60" rx="8"/>' +
        '<rect x="112" y="100" width="34" height="90" rx="8"/>' +
        '<rect x="164" y="150" width="34" height="40" rx="8"/>' +
        '<rect x="216" y="80" width="34" height="110" rx="8" fill="#A47864"/>' +
        '<rect x="268" y="120" width="34" height="70" rx="8"/></g>';
    } else { /* dots */
      var dots = "";
      for (var r = 0; r < 4; r++) for (var c = 0; c < 8; c++) {
        dots += '<circle cx="' + (52 + c * 42) + '" cy="' + (52 + r * 42) + '" r="9" fill="' + ((r + c) % 3 === 0 ? "#A47864" : "#A0D4E0") + '" opacity="0.75"/>';
      }
      inner = dots;
    }
    return '<svg viewBox="0 0 400 225" width="400" height="225" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">' +
      '<rect width="400" height="225" fill="var(--surface-2, #EDE8DC)"/>' + inner + "</svg>";
  }
  NS.thumbSVG = thumbSVG;

  /* ---------- shared card renderer ---------- */
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function cardHTML(course) {
    var saved = isSaved(course.id);
    return '<div class="card-wrap"><article class="glass course-card" data-id="' + esc(course.id) + '">' +
      '<div class="card-media">' + thumbSVG(course) + "</div>" +
      '<div class="card-body">' +
      '<p class="card-kicker">' + esc(course.category) + " · " + esc(course.level) + "</p>" +
      '<h3 class="card-title">' + esc(course.title) + "</h3>" +
      '<p class="card-desc">' + esc(course.tagline) + "</p>" +
      '<ul class="card-meta"><li>' + course.hours + ' hours</li><li>' + course.lessons + " lessons</li><li>★ " + course.rating.toFixed(1) + "</li></ul>" +
      '<div class="card-actions">' +
      '<button type="button" class="save-toggle" data-save="' + esc(course.id) + '" aria-pressed="' + saved + '" aria-label="' + (saved ? "Remove " : "Save ") + esc(course.title) + (saved ? " from" : " to") + ' your saved courses">' +
      '<svg width="20" height="20" viewBox="0 0 20 20" fill="' + (saved ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" aria-hidden="true"><path d="M10 16.5 3.5 10V5.8A1.8 1.8 0 0 1 5.3 4h2.4L10 6.2 12.3 4h2.4a1.8 1.8 0 0 1 1.8 1.8V10L10 16.5Z"/></svg>' +
      "</button>" +
      '<button type="button" class="btn btn-ghost btn-small" data-details="' + esc(course.id) + '">Details</button>' +
      "</div></div></article></div>";
  }
  NS.cardHTML = cardHTML;

  /* ---------- home: featured courses ---------- */
  function initFeatured() {
    if (document.body.getAttribute("data-page") !== "home") return;
    var mount = document.getElementById("featured-cards");
    if (!mount || !NS.data) return;
    var featured = NS.data.courses.filter(function (c) { return c.featured; }).slice(0, 3);
    mount.innerHTML = featured.map(cardHTML).join("");
    mount.setAttribute("aria-busy", "false");
    addReveals(mount);
  }

  /* ---------- scroll reveals (default visible; enhanced with support) ---------- */
  function addReveals(scope) {
    if (!("IntersectionObserver" in window)) return;
    var reduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;
    var supportsTimeline = window.CSS && CSS.supports && CSS.supports("animation-timeline: view()");
    if (!supportsTimeline) return;
    var els = (scope || document).querySelectorAll(".benefit, .course-card, .stat, .swatch, .gauge, .cta");
    for (var i = 0; i < els.length; i++) els[i].classList.add("reveal");
  }

  /* ---------- liquid refraction feature detect (Chromium only) ---------- */
  function initLiquid() {
    var probe = document.createElement("div");
    probe.style.backdropFilter = "url(#liquid)";
    var ok = typeof probe.style.backdropFilter === "string" && probe.style.backdropFilter.indexOf("url(") !== -1;
    if (ok) document.documentElement.classList.add("has-liquid");
  }

  /* ---------- boot ---------- */
  function boot() {
    initTheme();
    initLiquid();
    initGlow();
    initBreakpoints();
    initNavCondense();
    initCountUp();
    initFeatured();
    addReveals(document);
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
