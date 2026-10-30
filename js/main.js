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

/* ---------------------------------------------------------------
   The hero label types itself out once, while the name below comes
   into focus. Each character is its own span, revealed in turn, with
   a zero-width caret moved along ahead of them, so nothing reflows
   and the line wraps on a phone exactly as the static text would.
   Screen readers get one hidden copy of the whole label instead of
   the spans. Skipped under reduced motion: the label is just there.
   --------------------------------------------------------------- */
(function () {
  var el = document.querySelector('.hero-eyebrow');
  if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var text = el.textContent;
  var said = document.createElement('span');
  said.className = 'vh';
  said.textContent = text;
  var shown = document.createElement('span');
  shown.setAttribute('aria-hidden', 'true');
  var chars = [];
  for (var i = 0; i < text.length; i++) {
    var c = document.createElement('span');
    c.className = 't-ch';
    c.textContent = text[i];
    shown.appendChild(c);
    chars.push(c);
  }
  var caret = document.createElement('span');
  caret.className = 't-caret';
  shown.insertBefore(caret, chars[0]);

  el.textContent = '';
  el.appendChild(said);
  el.appendChild(shown);
  el.classList.add('typing');

  var n = 0;
  function step() {
    chars[n].classList.add('on');
    n++;
    if (n < chars.length) {
      shown.insertBefore(caret, chars[n]);
      /* a beat longer after each separator, as a hand would pause */
      setTimeout(step, text[n - 1] === '·' ? 80 : 17);
    } else {
      shown.appendChild(caret);
      caret.classList.add('done');
    }
  }
  setTimeout(step, 150);
})();

