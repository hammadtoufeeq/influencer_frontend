/*! exit-intent-popup.js | Web Component, no dependencies, works in any framework */
(function () {
  if (typeof window === "undefined" || customElements.get("exit-intent-popup")) return;

  var TPL = '<style>' +
  ':host{--ei-bg:#fff;--ei-text:#1f2937;--ei-accent:#4f46e5;--ei-overlay:rgba(15,23,42,.55);--ei-font:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif}' +
  '.ov{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;padding:1rem;background:var(--ei-overlay);font-family:var(--ei-font);z-index:99999;opacity:0;visibility:hidden;transition:opacity .35s ease,visibility .35s}' +
  '.ov.show{opacity:1;visibility:visible}' +
  '.box{position:relative;width:100%;max-width:26rem;background:var(--ei-bg);color:var(--ei-text);border-radius:1rem;padding:2.5rem 1.75rem 2rem;text-align:center;box-shadow:0 20px 50px rgba(0,0,0,.25);transform:translateY(24px) scale(.96);transition:transform .35s ease}' +
  '.show .box{transform:none}' +
  'h2{margin:0 0 .6rem;font-size:1.6rem;color:var(--ei-accent)}p{margin:0;line-height:1.6}' +
  'button{position:absolute;top:.6rem;right:.8rem;width:2.2rem;height:2.2rem;border:0;border-radius:50%;background:transparent;color:var(--ei-text);font-size:1.6rem;line-height:1;cursor:pointer}' +
  'button:hover,button:focus-visible{background:rgba(0,0,0,.08);outline:none}' +
  '@media(max-width:480px){.box{padding:2.2rem 1.25rem 1.5rem}h2{font-size:1.35rem}}' +
  '@media(prefers-reduced-motion:reduce){.ov,.box{transition:none}}' +
  '</style>' +
  '<div class="ov" role="dialog" aria-modal="true" aria-labelledby="t" aria-hidden="true">' +
  '<div class="box"><button type="button" aria-label="Close">&times;</button><h2 id="t"></h2><p></p></div></div>';

  class ExitIntentPopup extends HTMLElement {
    connectedCallback() {
      if (this._init) return; this._init = true;
      var r = this.attachShadow({ mode: "open" });
      r.innerHTML = TPL;
      this.ov = r.querySelector(".ov");
      this.shown = false; this.ready = false;
      var self = this, delay = +(this.getAttribute("delay") || 2000);
      this.once = this.getAttribute("once") !== "false";
      r.querySelector("h2").textContent = this.getAttribute("heading") || "Thank you for visiting!";
      r.querySelector("p").textContent = this.getAttribute("message") ||
        "We're glad you stopped by. Wishing you a wonderful day, and we hope to see you again soon.";
      this.t = setTimeout(function () { self.ready = true; }, delay);

      this.onLeave = function (e) { if (e.clientY <= 0) self.show(); };
      this.onKey = function (e) { if (e.key === "Escape" && self.shown) self.hide(); };
      document.documentElement.addEventListener("mouseleave", this.onLeave);
      document.addEventListener("keydown", this.onKey);
      r.querySelector("button").addEventListener("click", function () { self.hide(); });
      this.ov.addEventListener("click", function (e) { if (e.target === self.ov) self.hide(); });

      if (this.getAttribute("mobile-scroll") !== "false" && "ontouchstart" in window) {
        var y = window.pageYOffset, t = Date.now();
        this.onScroll = function () {
          var ny = window.pageYOffset, nt = Date.now(), v = (y - ny) / Math.max(nt - t, 1);
          if (v > 1.5 && y > window.innerHeight * .5) self.show();
          y = ny; t = nt;
        };
        window.addEventListener("scroll", this.onScroll, { passive: true });
      }
    }
    disconnectedCallback() {
      clearTimeout(this.t);
      document.documentElement.removeEventListener("mouseleave", this.onLeave);
      document.removeEventListener("keydown", this.onKey);
      if (this.onScroll) window.removeEventListener("scroll", this.onScroll);
      this._init = false;
    }
    show(force) {
      var k = "ei_shown", seen = false;
      try { seen = this.once && sessionStorage.getItem(k); } catch (e) {}
      if (this.shown || (!force && (!this.ready || seen))) return;
      this.shown = true; this.last = document.activeElement;
      try { sessionStorage.setItem(k, "1"); } catch (e) {}
      this.ov.setAttribute("aria-hidden", "false"); this.ov.classList.add("show");
      this.shadowRoot.querySelector("button").focus();
    }
    hide() {
      this.ov.classList.remove("show"); this.ov.setAttribute("aria-hidden", "true");
      this.shown = false; if (this.last && this.last.focus) this.last.focus();
    }
  }
  customElements.define("exit-intent-popup", ExitIntentPopup);

  // Optional: <script src="exit-intent-popup.js" data-auto></script> adds it automatically
  var s = document.currentScript;
  if (s && s.hasAttribute("data-auto")) {
    var add = function () {
      var el = document.createElement("exit-intent-popup");
      ["heading", "message", "delay", "once", "mobile-scroll"].forEach(function (a) {
        var v = s.getAttribute("data-" + a); if (v !== null) el.setAttribute(a, v);
      });
      document.body.appendChild(el);
    };
    document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", add) : add();
  }
})();
