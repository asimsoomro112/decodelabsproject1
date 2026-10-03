/* CourseHub join page — interest form.
   Constraint Validation API + custom messages, inline errors linked by
   aria-describedby, error summary with focus management, aria-live success,
   saved to localStorage. No API calls. */
(function () {
  "use strict";

  if (document.body.getAttribute("data-page") !== "join") return;
  var NS = (window.CourseHub = window.CourseHub || {});

  var form = document.getElementById("join-form");
  var summary = document.getElementById("error-summary");
  var errorList = document.getElementById("error-list");
  var errorCount = document.getElementById("error-count");
  var successPanel = document.getElementById("success-panel");
  var MAX = 300;

  /* ----- course select built from the data ----- */
  function buildCourseOptions() {
    var select = document.getElementById("course");
    if (!select || !NS.data) return;
    NS.data.courses.forEach(function (c) {
      var opt = document.createElement("option");
      opt.value = c.id;
      opt.textContent = c.title + " (" + c.level + ", " + c.hours + "h)";
      select.appendChild(opt);
    });
  }

  /* ----- live character counter ----- */
  function initCounter() {
    var area = document.getElementById("message");
    var count = document.getElementById("message-count");
    if (!area || !count) return;
    function paint() {
      var left = MAX - area.value.length;
      count.textContent = left + (left === 1 ? " character remaining" : " characters remaining");
    }
    area.addEventListener("input", paint);
    paint();
  }

  /* ----- custom messages ----- */
  var MESSAGES = {
    name: {
      valueMissing: "Please tell us your name.",
      tooShort: "Your name needs at least 2 characters."
    },
    email: {
      valueMissing: "We need your email to hold your seat.",
      typeMismatch: "That email doesn't look complete — check for an @ and a domain."
    },
    course: { valueMissing: "Choose the course you're most interested in." },
    level: { valueMissing: "Pick the level that fits you best." },
    consent: { valueMissing: "Please agree so we can contact you about courses." }
  };

  function fieldErrorId(field) {
    if (field.name === "level") return "level-error";
    return field.id + "-error";
  }

  function showError(field, message) {
    var p = document.getElementById(fieldErrorId(field));
    if (p) { p.textContent = message; p.hidden = false; }
    if (field.type !== "radio") field.setAttribute("aria-invalid", "true");
    else {
      var group = form.querySelectorAll('input[name="level"]');
      for (var i = 0; i < group.length; i++) group[i].setAttribute("aria-invalid", "true");
    }
  }

  function clearError(field) {
    var p = document.getElementById(fieldErrorId(field));
    if (p) { p.textContent = ""; p.hidden = true; }
    if (field.type !== "radio") field.removeAttribute("aria-invalid");
    else {
      var group = form.querySelectorAll('input[name="level"]');
      for (var i = 0; i < group.length; i++) group[i].removeAttribute("aria-invalid");
    }
  }

  function validateField(field) {
    var key = field.name === "level" ? "level" : field.name;
    var msgs = MESSAGES[key];
    if (!msgs) return true;
    var v = field.validity;
    clearError(field);
    if (v.valid) return true;
    var message = "Please fix this field.";
    if (v.valueMissing && msgs.valueMissing) message = msgs.valueMissing;
    else if (v.typeMismatch && msgs.typeMismatch) message = msgs.typeMismatch;
    else if (v.tooShort && msgs.tooShort) message = msgs.tooShort;
    showError(field, message);
    return false;
  }

  function validatableFields() {
    return [
      document.getElementById("name"),
      document.getElementById("email"),
      document.getElementById("course"),
      form.querySelector('input[name="level"]'),
      document.getElementById("consent")
    ].filter(Boolean);
  }

  function labelFor(field) {
    if (field.name === "level") return "Your current level";
    var label = form.querySelector('label[for="' + field.id + '"]');
    return label ? label.textContent.replace(/\s*\(optional\)\s*/i, "").trim() : field.name;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = validatableFields();
    var errors = [];
    fields.forEach(function (f) {
      if (!validateField(f)) errors.push({ field: f, label: labelFor(f) });
    });

    if (errors.length) {
      errorCount.textContent = errors.length;
      errorList.innerHTML = "";
      errors.forEach(function (item) {
        var li = document.createElement("li");
        var a = document.createElement("a");
        var target = item.field.type === "radio"
          ? form.querySelector('input[name="level"]')
          : item.field;
        var tid = target.id || (target.id = "field-" + item.field.name);
        a.href = "#" + tid;
        a.textContent = item.label + ": " + document.getElementById(fieldErrorId(item.field)).textContent;
        a.addEventListener("click", function (ev) {
          ev.preventDefault();
          target.focus();
        });
        li.appendChild(a);
        errorList.appendChild(li);
      });
      summary.hidden = false;
      summary.focus();
      return;
    }

    summary.hidden = true;
    var record = {
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim(),
      course: document.getElementById("course").value,
      level: (form.querySelector('input[name="level"]:checked') || {}).value || "",
      message: document.getElementById("message").value.trim(),
      savedAt: new Date().toISOString()
    };
    var ok = NS.store.write("coursehub-join", JSON.stringify(record));
    var course = NS.courseById(record.course);
    document.getElementById("success-name").textContent = record.name.split(" ")[0];
    document.getElementById("success-detail").textContent =
      "We've saved your interest in " + (course ? "“" + course.title + "”" : "your chosen course") +
      " (" + record.level + "). " +
      (ok ? "Saved on this device. A real backend arrives in Project 2."
          : "Your browser blocked local storage, so we couldn't save this — nothing was sent anywhere.");
    form.hidden = true;
    successPanel.hidden = false;
    successPanel.focus();
    NS.toast("Seat saved");
  });

  /* Clear a field's error as soon as the user fixes it */
  form.addEventListener("input", function (e) {
    var t = e.target;
    if (t.form !== form) return;
    if (t.validity && t.validity.valid) clearError(t);
  });
  form.addEventListener("change", function (e) {
    var t = e.target;
    if (t.name === "level" || t.name === "consent" || t.name === "course") {
      if (t.type === "radio") {
        var checked = form.querySelector('input[name="level"]:checked');
        if (checked) clearError(checked);
      } else if (t.validity.valid) clearError(t);
    }
  });

  buildCourseOptions();
  initCounter();
})();
