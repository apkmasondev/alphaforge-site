// AlphaForge site: language + theme switch, localized screenshots, before/after slider, lightbox.
(function () {
  "use strict";

  var root = document.documentElement;
  var SHOTS = ["hero", "compare", "refine", "batch", "light", "blur", "sticker"];
  var TITLES = {
    en: "AlphaForge — local background removal & image toolkit for Windows",
    pl: "AlphaForge — lokalne usuwanie tła i narzędzia do obrazów dla Windows",
  };

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) { /* private mode: just don't remember */ }
  }

  function lang() {
    return root.getAttribute("data-lang") === "pl" ? "pl" : "en";
  }

  // ---------- Language ----------

  // Remember English attribute values once, so switching back restores them.
  var translatable = ["alt", "aria-label"];
  translatable.forEach(function (attr) {
    document.querySelectorAll("[data-pl-" + attr + "]").forEach(function (el) {
      el.setAttribute("data-en-" + attr, el.getAttribute(attr) || "");
    });
  });

  function shotSrc(name, small) {
    return "assets/shots/" + lang() + "-" + name + (small ? "-sm" : "") + ".webp";
  }

  function applyLang() {
    var l = lang();
    root.lang = l;
    document.title = TITLES[l];
    translatable.forEach(function (attr) {
      document.querySelectorAll("[data-pl-" + attr + "]").forEach(function (el) {
        el.setAttribute(attr, el.getAttribute("data-" + l + "-" + attr));
      });
    });
    document.querySelectorAll("img[data-shot]").forEach(function (img) {
      var name = img.getAttribute("data-shot");
      var src = shotSrc(name, img.hasAttribute("data-sm"));
      if (img.getAttribute("src") !== src) img.setAttribute("src", src);
      if (img.hasAttribute("srcset")) img.srcset = shotSrc(name, true) + " 900w, " + shotSrc(name, false) + " 1800w";
    });
    document.querySelectorAll("[data-set-lang]").forEach(function (b) {
      b.setAttribute("aria-pressed", String(b.getAttribute("data-set-lang") === l));
    });
    if (lb.open) showLightbox(lbIndex);
  }

  document.querySelectorAll("[data-set-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      var l = b.getAttribute("data-set-lang");
      root.setAttribute("data-lang", l);
      store("af-lang", l);
      applyLang();
    });
  });

  // ---------- Theme ----------

  var darkQuery = window.matchMedia("(prefers-color-scheme: dark)");

  function effectiveTheme() {
    var t = root.getAttribute("data-theme");
    if (t === "light" || t === "dark") return t;
    return darkQuery.matches ? "dark" : "light";
  }

  document.getElementById("theme-btn").addEventListener("click", function () {
    var next = effectiveTheme() === "dark" ? "light" : "dark";
    root.setAttribute("data-theme", next);
    store("af-theme", next);
  });

  // ---------- Header shadow ----------

  var top = document.querySelector(".top");
  function onScroll() {
    top.classList.toggle("scrolled", window.scrollY > 8);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // ---------- Before / after ----------

  var ba = document.getElementById("ba");
  var range = ba.querySelector(".ba-range");

  function setPos(pct) {
    pct = Math.max(0, Math.min(100, pct));
    ba.style.setProperty("--pos", pct + "%");
    range.value = String(Math.round(pct));
  }

  function posFromEvent(e) {
    var r = ba.getBoundingClientRect();
    return ((e.clientX - r.left) / r.width) * 100;
  }

  var dragging = false;
  ba.addEventListener("pointerdown", function (e) {
    if (e.button !== 0) return;
    dragging = true;
    ba.setPointerCapture(e.pointerId);
    setPos(posFromEvent(e));
  });
  ba.addEventListener("pointermove", function (e) {
    if (dragging) setPos(posFromEvent(e));
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(function (t) {
    ba.addEventListener(t, function () { dragging = false; });
  });
  range.addEventListener("input", function () {
    setPos(Number(range.value));
  });

  // "Blurred (AI)" swaps the cut-out for the app's depth-aware blur result.
  var after = ba.querySelector(".ba-after");
  var cutSrc = after.getAttribute("src"), cutSet = after.getAttribute("srcset");
  document.querySelectorAll("[data-bg]").forEach(function (b) {
    if (b === ba) return;
    b.addEventListener("click", function () {
      var blur = b.getAttribute("data-bg") === "blur";
      after.setAttribute("src", blur ? "assets/demo/dog-blur.webp" : cutSrc);
      after.setAttribute("srcset", blur ? "assets/demo/dog-blur-sm.webp 640w, assets/demo/dog-blur.webp 1100w" : cutSet);
      ba.setAttribute("data-bg", b.getAttribute("data-bg"));
      document.querySelectorAll(".seg-bg [data-bg]").forEach(function (o) {
        o.setAttribute("aria-pressed", String(o === b));
      });
    });
  });

  // ---------- Lightbox ----------

  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-cap");
  var lbIndex = 0;

  function captionFor(name) {
    var btn = document.querySelector(".gallery [data-open='" + name + "']");
    var cap = btn && btn.parentElement.querySelector("figcaption [data-l='" + lang() + "']");
    return cap ? cap.textContent : "";
  }

  function showLightbox(i) {
    lbIndex = (i + SHOTS.length) % SHOTS.length;
    var name = SHOTS[lbIndex];
    var img = document.querySelector("img[data-shot='" + name + "']");
    lbImg.src = shotSrc(name, false);
    lbImg.alt = img ? img.alt : "";
    lbCap.textContent = captionFor(name) + "  ·  " + (lbIndex + 1) + " / " + SHOTS.length;
    if (!lb.open) lb.showModal();
  }

  document.querySelectorAll("[data-open]").forEach(function (b) {
    b.addEventListener("click", function () {
      showLightbox(SHOTS.indexOf(b.getAttribute("data-open")));
    });
  });

  lb.addEventListener("click", function (e) {
    var action = e.target.closest("[data-lb]");
    if (action) {
      var a = action.getAttribute("data-lb");
      if (a === "close") lb.close();
      else showLightbox(lbIndex + (a === "next" ? 1 : -1));
      return;
    }
    if (e.target !== lbImg) lb.close();
  });

  lb.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") showLightbox(lbIndex + 1);
    else if (e.key === "ArrowLeft") showLightbox(lbIndex - 1);
  });

  var touchX = null;
  lb.addEventListener("touchstart", function (e) {
    touchX = e.touches.length === 1 ? e.touches[0].clientX : null;
  }, { passive: true });
  lb.addEventListener("touchend", function (e) {
    if (touchX === null) return;
    var dx = e.changedTouches[0].clientX - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) showLightbox(lbIndex + (dx < 0 ? 1 : -1));
  });

  applyLang();
})();
