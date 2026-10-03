/* CourseHub courses page — filter / sort / save / details dialog.
   One state object + one pure render function, event delegation,
   re-renders wrapped in document.startViewTransition when available. */
(function () {
  "use strict";

  if (document.body.getAttribute("data-page") !== "courses") return;
  var NS = (window.CourseHub = window.CourseHub || {});

  var state = { q: "", level: "all", duration: "any", sort: "featured" };

  var cardsEl = document.getElementById("course-cards");
  var countEl = document.getElementById("results-count");
  var emptyEl = document.getElementById("empty-state");
  var form = document.getElementById("filters-form");
  var detailsEl = document.getElementById("filters-details");
  var activeEl = document.getElementById("filters-active");
  var dialog = document.getElementById("course-dialog");
  var lastFocus = null;

  function durationBucket(hours) {
    if (hours < 8) return "short";
    if (hours <= 12) return "medium";
    return "long";
  }

  function filtered() {
    var list = (NS.data && NS.data.courses ? NS.data.courses.slice() : []);
    var q = state.q.trim().toLowerCase();
    list = list.filter(function (c) {
      if (state.level !== "all" && c.level !== state.level) return false;
      if (state.duration !== "any" && durationBucket(c.hours) !== state.duration) return false;
      if (q) {
        var hay = (c.title + " " + c.tagline + " " + c.description + " " + c.category + " " + c.level).toLowerCase();
        if (hay.indexOf(q) === -1) return false;
      }
      return true;
    });
    var by = {
      rating: function (a, b) { return b.rating - a.rating || b.students - a.students; },
      shortest: function (a, b) { return a.hours - b.hours; },
      longest: function (a, b) { return b.hours - a.hours; },
      az: function (a, b) { return a.title.localeCompare(b.title); },
      featured: function (a, b) { return (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || b.rating - a.rating; }
    };
    list.sort(by[state.sort] || by.featured);
    return list;
  }

  function activeFilterCount() {
    var n = 0;
    if (state.q.trim()) n++;
    if (state.level !== "all") n++;
    if (state.duration !== "any") n++;
    if (state.sort !== "featured") n++;
    return n;
  }

  function render() {
    if (!cardsEl || !NS.data) return;
    var list = filtered();
    cardsEl.innerHTML = list.map(NS.cardHTML).join("");
    cardsEl.setAttribute("aria-busy", "false");
    var n = list.length;
    countEl.textContent = n === 0
      ? "No courses found."
      : n === 1 ? "1 course found." : n + " courses found.";
    emptyEl.hidden = n !== 0;
    var active = activeFilterCount();
    activeEl.hidden = active === 0;
    activeEl.textContent = active + " active";
  }

  function update() {
    if (document.startViewTransition) {
      document.startViewTransition(function () { render(); });
    } else {
      render();
    }
  }

  function resetFilters() {
    state = { q: "", level: "all", duration: "any", sort: "featured" };
    form.reset();
    update();
  }

  /* ----- filters events (delegated) ----- */
  var searchTimer = null;
  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t.id === "search") {
      if (searchTimer) clearTimeout(searchTimer);
      searchTimer = setTimeout(function () {
        state.q = t.value;
        update();
      }, 180);
    } else if (t.name === "level") {
      state.level = t.value;
      update();
    }
  });
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.id === "duration") { state.duration = t.value; update(); }
    else if (t.id === "sort") { state.sort = t.value; update(); }
    else if (t.name === "level") { state.level = t.value; update(); }
  });
  form.addEventListener("reset", function () {
    window.setTimeout(resetFilters, 0);
  });
  document.getElementById("empty-reset").addEventListener("click", resetFilters);

  /* ----- save toggles + details buttons (delegated on the cards grid) ----- */
  function paintSaveButton(btn, saved, title) {
    btn.setAttribute("aria-pressed", String(saved));
    btn.setAttribute("aria-label", (saved ? "Remove " : "Save ") + title + (saved ? " from" : " to") + " your saved courses");
    var svg = btn.querySelector("svg");
    if (svg) svg.setAttribute("fill", saved ? "currentColor" : "none");
  }

  cardsEl.addEventListener("click", function (e) {
    var saveBtn = e.target.closest("[data-save]");
    if (saveBtn) {
      var id = saveBtn.getAttribute("data-save");
      var course = NS.courseById(id);
      var nowSaved = NS.saved.toggle(id);
      paintSaveButton(saveBtn, nowSaved, course ? course.title : "course");
      NS.toast(nowSaved ? "Saved to your list" : "Removed from your list");
      return;
    }
    var detailsBtn = e.target.closest("[data-details]");
    if (detailsBtn) openDialog(detailsBtn.getAttribute("data-details"), detailsBtn);
  });

  /* ----- native dialog ----- */
  function openDialog(id, opener) {
    var course = NS.courseById(id);
    if (!course || !dialog) return;
    lastFocus = opener || document.activeElement;
    document.getElementById("dialog-title").textContent = course.title;
    document.getElementById("dialog-meta").textContent =
      course.category + " · " + course.level + " · " + course.hours + " hours · " +
      course.lessons + " lessons · ★ " + course.rating.toFixed(1) +
      " (" + course.students.toLocaleString("en-US") + " learners)";
    document.getElementById("dialog-desc").textContent = course.description;
    document.getElementById("dialog-media").innerHTML = NS.thumbSVG(course);
    document.getElementById("dialog-outcomes").innerHTML =
      course.outcomes.map(function (o) { return "<li>" + o.replace(/&/g, "&amp;").replace(/</g, "&lt;") + "</li>"; }).join("");
    var saveBtn = document.getElementById("dialog-save");
    var saved = NS.saved.is(id);
    saveBtn.textContent = saved ? "Saved ✓" : "Save course";
    saveBtn.setAttribute("data-id", id);
    if (typeof dialog.showModal === "function") dialog.showModal();
  }
  function closeDialog() { if (dialog && dialog.open) dialog.close(); }

  document.getElementById("dialog-close").addEventListener("click", closeDialog);
  document.getElementById("dialog-x").addEventListener("click", closeDialog);
  document.getElementById("dialog-save").addEventListener("click", function () {
    var id = this.getAttribute("data-id");
    var course = NS.courseById(id);
    var nowSaved = NS.saved.toggle(id);
    this.textContent = nowSaved ? "Saved ✓" : "Save course";
    var cardBtn = cardsEl.querySelector('[data-save="' + id + '"]');
    if (cardBtn && course) paintSaveButton(cardBtn, nowSaved, course.title);
    NS.toast(nowSaved ? "Saved to your list" : "Removed from your list");
  });
  dialog.addEventListener("click", function (e) {
    if (e.target === dialog) closeDialog();
  });
  dialog.addEventListener("close", function () {
    if (lastFocus && document.contains(lastFocus)) lastFocus.focus();
    lastFocus = null;
  });

  /* ----- details-aside behaviour: sidebar from 1024px, drawer below ----- */
  function syncDetails() {
    if (!window.matchMedia || !detailsEl) return;
    if (window.matchMedia("(min-width: 1024px)").matches) {
      detailsEl.open = true;
    }
  }
  if (window.matchMedia) {
    window.matchMedia("(min-width: 1024px)").addEventListener("change", syncDetails);
  }
  syncDetails();

  /* ----- boot ----- */
  render();
})();
