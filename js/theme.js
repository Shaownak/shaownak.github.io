/* ===============================================================
   theme.js — the light/dark switch.
   The theme itself is applied by the inline script in <head>, before
   first paint. This file only wires the button, so a slow network
   cannot cause a flash of the wrong surface.

   Three states, deliberately not exposed as three buttons: no stored
   value means "follow the OS", which is the default and the state most
   visitors should stay in. Pressing the button stores an explicit
   choice; it never writes a value that merely matches the OS, so a
   visitor who has not chosen keeps following their system when it
   changes from day to night.
   =============================================================== */
(function () {
  var root = document.documentElement;
  var btn  = document.querySelector('.bar-theme');
  if (!btn) return;

  var osDark = window.matchMedia('(prefers-color-scheme: dark)');

  function isDark() {
    var set = root.getAttribute('data-theme');
    return set ? set === 'dark' : osDark.matches;
  }

  /* The label names the destination, not the current state: a button
     reading "Dark" takes you to dark. aria-pressed carries the state. */
  function sync() {
    var dark = isDark();
    btn.setAttribute('aria-pressed', dark ? 'true' : 'false');
    btn.querySelector('.bar-theme-txt').textContent = dark ? 'Light' : 'Dark';
    btn.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }

  /* Cross-fade the switch. The class carries colour transitions on every
     element (see "MOTION" in main.css), so it is on for the switch only.
     Skipped under reduced motion, where the theme simply changes. */
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)');
  var fadeTimer;

  btn.addEventListener('click', function () {
    var next = isDark() ? 'light' : 'dark';
    if (!calm.matches) {
      root.classList.add('theme-fade');
      clearTimeout(fadeTimer);
      fadeTimer = setTimeout(function () { root.classList.remove('theme-fade'); }, 450);
    }
    root.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch (_) {}
    sync();
  });

  /* Still following the OS? Then track it. */
  var onOS = function () { if (!root.getAttribute('data-theme')) sync(); };
  if (osDark.addEventListener) osDark.addEventListener('change', onOS);
  else if (osDark.addListener) osDark.addListener(onOS);

  sync();
})();
