/* CourseHub audit page — live in-page audit with native APIs only.
   LCP via PerformanceObserver (largest-contentful-paint), CLS via
   PerformanceObserver (layout-shift, ignoring shifts with recent input),
   rated against the standard thresholds, plus DOM structure checks. */
(function () {
  "use strict";

  if (document.body.getAttribute("data-page") !== "audit") return;

  var CIRC = 326.7; /* 2πr for r=52 */

  /* ---------- LCP ---------- */
  function measureLCP(done) {
    var value = null;
    function finish() { done(value); }
    if (!("PerformanceObserver" in window)) { finish(); return; }
    try {
      var po = new PerformanceObserver(function (list) {
        var entries = list.getEntries();
        var last = entries[entries.length - 1];
        if (last) value = last.startTime / 1000;
      });
      po.observe({ type: "largest-contentful-paint", buffered: true });
      /* Fallback: navigation timing if no LCP entry fires (e.g. tiny page) */
      window.setTimeout(function () {
        po.disconnect();
        if (value === null && window.performance && performance.getEntriesByType) {
          var nav = performance.getEntriesByType("navigation")[0];
          if (nav) value = (nav.loadEventEnd || nav.domContentLoadedEventEnd || 0) / 1000;
        }
        finish();
      }, 2500);
    } catch (e) { finish(); }
  }

  /* ---------- CLS (ignores shifts with recent input) ---------- */
  function measureCLS() {
    var cls = 0;
    if (!("PerformanceObserver" in window)) return { value: null, live: null };
    try {
      var po = new PerformanceObserver(function (list) {
        list.getEntries().forEach(function (entry) {
          if (!entry.hadRecentInput) cls += entry.value;
        });
      });
      po.observe({ type: "layout-shift", buffered: true });
      return { value: null, live: function () { return cls; } };
    } catch (e) { return { value: null, live: null }; }
  }

  /* ---------- gauges ---------- */
  function paintGauge(prefix, value, format, thresholds) {
    var arc = document.getElementById(prefix + "-arc");
    var num = document.getElementById(prefix + "-value");
    var rating = document.getElementById(prefix + "-rating");
    var ring = document.getElementById(prefix + "-ring");
    var card = arc.closest(".gauge");
    if (value === null || value === undefined || isNaN(value)) {
      num.textContent = "n/a";
      rating.textContent = "Not measurable in this browser";
      card.setAttribute("data-rating", "ok");
      ring.setAttribute("aria-label", prefix.toUpperCase() + ": not measurable");
      return;
    }
    num.textContent = format(value);
    var r = value <= thresholds[0] ? "good" : value <= thresholds[1] ? "ok" : "bad";
    card.setAttribute("data-rating", r);
    rating.textContent = r === "good" ? "Good" : r === "ok" ? "Needs improvement" : "Poor";
    var frac = Math.min(value / (thresholds[1] * 1.6), 1);
    arc.style.strokeDashoffset = String(CIRC * (1 - frac));
    ring.setAttribute("aria-label", prefix.toUpperCase() + ": " + format(value) + ", " + rating.textContent);
  }

  /* ---------- DOM checks ---------- */
  function accessibleName(el) {
    if (el.getAttribute("aria-label")) return true;
    var labelledby = el.getAttribute("aria-labelledby");
    if (labelledby) {
      var ok = labelledby.split(/\s+/).some(function (id) { return document.getElementById(id); });
      if (ok) return true;
    }
    if (el.title) return true;
    var text = (el.textContent || "").trim();
    if (text) return true;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
      if (el.labels && el.labels.length) return true;
      if (el.getAttribute("aria-label") || el.getAttribute("aria-labelledby")) return true;
      if (el.id && document.querySelector('label[for="' + el.id + '"]')) return true;
    }
    return false;
  }

  function domChecks() {
    var out = [];

    var landmarks = document.querySelectorAll("header, nav, main, footer, aside").length;
    out.push({ name: "Landmarks present", detail: landmarks + " landmark regions (header, nav, main, footer, aside).", pass: landmarks >= 4 });

    var h1s = document.querySelectorAll("h1").length;
    out.push({ name: "Exactly one h1", detail: h1s + " h1 element" + (h1s === 1 ? "" : "s") + " on this page.", pass: h1s === 1 });

    var headings = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    var last = 0, skips = 0;
    headings.forEach(function (h) {
      var lvl = parseInt(h.tagName.charAt(1), 10);
      if (last && lvl > last + 1) skips++;
      last = lvl;
    });
    out.push({ name: "Heading order", detail: skips === 0 ? "No skipped levels across " + headings.length + " headings." : skips + " skipped heading level(s) found.", pass: skips === 0 });

    var imgs = document.querySelectorAll("img");
    var noAlt = Array.prototype.filter.call(imgs, function (i) { return !i.hasAttribute("alt"); }).length;
    out.push({ name: "Images have alt text", detail: imgs.length === 0 ? "No <img> elements; decorative visuals are inline SVG or CSS." : noAlt + " of " + imgs.length + " images missing alt.", pass: noAlt === 0 });

    var inputs = document.querySelectorAll("input, select, textarea");
    var unlabeled = Array.prototype.filter.call(inputs, function (i) {
      if (i.type === "hidden") return false;
      return !accessibleName(i);
    }).length;
    out.push({ name: "Inputs have labels", detail: unlabeled + " of " + inputs.length + " form controls missing a label.", pass: unlabeled === 0 });

    var buttons = document.querySelectorAll("button");
    var nameless = Array.prototype.filter.call(buttons, function (b) { return !accessibleName(b); }).length;
    out.push({ name: "Buttons have accessible names", detail: nameless + " of " + buttons.length + " buttons missing a name.", pass: nameless === 0 });

    var lang = document.documentElement.getAttribute("lang");
    out.push({ name: "lang attribute present", detail: lang ? 'lang="' + lang + '" on <html>.' : "No lang attribute.", pass: !!lang });

    var viewport = document.querySelector('meta[name="viewport"]');
    out.push({ name: "Viewport meta present", detail: viewport ? viewport.getAttribute("content") : "Missing.", pass: !!viewport });

    var overflow = document.documentElement.scrollWidth > window.innerWidth + 1;
    out.push({ name: "No horizontal overflow", detail: overflow ? "Page is wider than the viewport at " + window.innerWidth + "px." : "Fits within " + window.innerWidth + "px viewport.", pass: !overflow });

    return out;
  }

  function renderChecklist() {
    var ul = document.getElementById("dom-checklist");
    ul.setAttribute("aria-busy", "false");
    ul.innerHTML = "";
    domChecks().forEach(function (c) {
      var li = document.createElement("li");
      li.className = c.pass ? "pass" : "fail";
      var strong = document.createElement("strong");
      strong.textContent = c.name;
      var small = document.createElement("small");
      small.textContent = c.detail;
      var wrap = document.createElement("div");
      wrap.appendChild(strong);
      wrap.appendChild(small);
      li.appendChild(wrap);
      ul.appendChild(li);
    });
  }

  /* ---------- viewport readout ---------- */
  function paintViewport() {
    var w = window.innerWidth;
    document.getElementById("viewport-width").textContent = w + "px";
    document.getElementById("breakpoint-name").textContent =
      w >= 1024 ? "Desktop (1024px and up)" : w >= 768 ? "Tablet (768px and up)" : "Mobile (below 768px)";
  }

  /* ---------- run ---------- */
  var clsTracker = measureCLS();

  function run() {
    paintViewport();
    renderChecklist();
    measureLCP(function (lcp) {
      paintGauge("lcp", lcp, function (v) { return v.toFixed(2) + "s"; }, [2.5, 4.0]);
    });
    /* CLS keeps accumulating; paint the live value after a beat */
    window.setTimeout(function () {
      var v = clsTracker.live ? clsTracker.live() : null;
      paintGauge("cls", v, function (x) { return x.toFixed(3); }, [0.1, 0.25]);
    }, 1200);
  }

  document.getElementById("rerun-audit").addEventListener("click", function () {
    run();
  });
  window.addEventListener("resize", paintViewport);

  run();
})();
