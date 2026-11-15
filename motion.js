/* Subtle motion: fade-in on scroll and counting figures. No library. Does nothing if the visitor prefers reduced motion. */
(function () {
  if (!('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  var main = document.querySelector('main');
  if (!main) return;

  var ITEMS = '.facts > div, .work > li, .gallery > *, .masonry > figure, .pubs > li, .programme > li, .duo > *';
  var SKIP = '.hero, .page-intro, script, style';
  var targets = [];
  (function collect(el) {
    Array.prototype.forEach.call(el.children, function (c) {
      if (c.matches(SKIP)) return;
      if (c.matches(ITEMS)) { targets.push(c); return; }
      var container = /^(SECTION|ARTICLE)$/.test(c.tagName) || c.classList.contains('wrap') || c.querySelector(ITEMS);
      if (container && c.children.length) collect(c); else targets.push(c);
    });
  })(main);

  var vh = window.innerHeight;
  var pending = targets.filter(function (t) {
    var r = t.getBoundingClientRect();
    return r.top >= vh * 0.92 || r.bottom <= 0;   // leave what is already on screen alone
  });
  pending.forEach(function (t) { t.classList.add('reveal'); });

  var io = new IntersectionObserver(function (entries) {
    var n = 0;
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var t = e.target;
      t.style.setProperty('--d', Math.min(n++, 6) * 70 + 'ms');
      t.classList.add('in');
      io.unobserve(t);
      setTimeout(function () { t.classList.remove('reveal', 'in'); t.style.removeProperty('--d'); }, 1400);
    });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.01 });
  pending.forEach(function (t) { io.observe(t); });

  /* Figures count up once when they come into view */
  var nums = document.querySelectorAll('.facts strong');
  var cio = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      cio.unobserve(e.target);
      var el = e.target, m = /^(\d+)(.*)$/.exec(el.textContent.trim());
      if (!m) return;
      var end = +m[1], suffix = m[2], t0 = null, dur = 1100;
      el.setAttribute('aria-label', el.textContent.trim());
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min((ts - t0) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(end * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      el.textContent = '0' + suffix;
      requestAnimationFrame(step);
    });
  }, { threshold: 0.6 });
  Array.prototype.forEach.call(nums, function (n) { cio.observe(n); });
})();
