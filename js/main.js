/* ===============================================================
   main.js — arrivals on scroll.
   Two kinds of element are watched, with one observer:
     .rise      figures and cards settle into place;
     .sec-head  the section's heavy rule is drawn left to right.
   Each is marked .in once and never unmarked, so nothing replays.
   Under prefers-reduced-motion, or without IntersectionObserver,
   everything is placed immediately. The hero, the rail and the
   detail sheets animate in CSS alone and need nothing from here.
   =============================================================== */
(function () {
  var items = document.querySelectorAll('.rise, .sec-head');

  if (!('IntersectionObserver' in window) ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    items.forEach(function (el) { el.classList.add('in'); });
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('in');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  items.forEach(function (el) { io.observe(el); });
})();
