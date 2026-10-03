/* CourseHub blueprint page — "Show landmarks" and "Grayscale test" toggles. */
(function () {
  "use strict";

  if (document.body.getAttribute("data-page") !== "blueprint") return;
  var NS = (window.CourseHub = window.CourseHub || {});

  function wireToggle(id, fn) {
    var btn = document.getElementById(id);
    if (!btn) return;
    btn.addEventListener("click", function () {
      var on = btn.getAttribute("aria-pressed") !== "true";
      btn.setAttribute("aria-pressed", String(on));
      fn(on);
      NS.toast(on ? btn.textContent.trim() + ": on" : btn.textContent.trim() + ": off");
    });
  }

  wireToggle("landmarks-toggle", function (on) {
    document.body.classList.toggle("show-landmarks", on);
  });

  wireToggle("grayscale-toggle", function (on) {
    /* Applied to <html> so the fixed nav chrome is included without
       disturbing fixed positioning. */
    document.documentElement.classList.toggle("grayscale-test", on);
  });
})();
