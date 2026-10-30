/* ===============================================================
   nav.js — orientation only.

   Marks which section you are currently reading in both the top
   bar and the wide-screen index rail. No animation, no scroll
   hijacking, no smooth-scroll of its own — the browser already
   handles anchor jumps.

   Deliberately never clears the mark when nothing intersects:
   between two sections the previous one stays lit, which reads
   as continuous progress rather than a flicker to nothing.
   =============================================================== */
(function () {
  var links = Array.prototype.slice.call(
    document.querySelectorAll('.bar-nav a[href^="#"], .rail a[href^="#"]'));
  if (!links.length || !('IntersectionObserver' in window)) return;

  var byId = {};
  links.forEach(function (a) {
    var id = a.getAttribute('href').slice(1);
    (byId[id] = byId[id] || []).push(a);
  });

  var targets = Object.keys(byId)
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);
  if (!targets.length) return;

  /* aria-current carries the state for anyone not seeing the accent mark.
     "true" rather than "page": these are sections of one document, not pages. */
  function setActive(id) {
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('is-active', on);
      if (on) { a.setAttribute('aria-current', 'true'); }
      else    { a.removeAttribute('aria-current'); }
    });
  }

  var bar = parseInt(getComputedStyle(document.documentElement)
    .getPropertyValue('--bar'), 10) || 46;

  var io = new IntersectionObserver(function (entries) {
    // Of everything currently crossing the band, take the highest on the page.
    var hits = entries.filter(function (e) { return e.isIntersecting; });
    if (!hits.length) return;
    hits.sort(function (x, y) {
      return x.boundingClientRect.top - y.boundingClientRect.top;
    });
    setActive(hits[0].target.id);
  }, { rootMargin: '-' + bar + 'px 0px -62% 0px', threshold: 0 });

  targets.forEach(function (t) { io.observe(t); });

  // Clicking a link should mark it at once rather than waiting for the scroll.
  links.forEach(function (a) {
    a.addEventListener('click', function () {
      setActive(a.getAttribute('href').slice(1));
    });
  });
})();
