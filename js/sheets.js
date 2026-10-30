/* ===============================================================
   sheets.js — project and certificate detail sheets.

   A thin wrapper over the native <dialog>. The browser supplies
   focus trapping, Escape to close, an inert background and focus
   restoration to the trigger. This adds only three things:
   opening the right sheet, closing on a backdrop click, and
   suppressing the fallback navigation on certificate links.

   Certificate cards are real <a href="…-full.jpg"> elements, so
   with JavaScript disabled they still open the scan directly.

   The scroll lock is CSS (html:has(dialog.sheet[open])) rather
   than a class toggled here — the dialog `close` event is not
   dispatched reliably in every engine, and a stuck lock would
   freeze the page.

   Sheet content is real markup in index.html, not data rendered
   by script, so it stays readable without JavaScript.
   =============================================================== */
(function () {
  document.addEventListener('click', function (e) {
    var trigger = e.target.closest('[data-sheet]');
    if (trigger) {
      var dlg = document.getElementById(trigger.dataset.sheet);
      if (!dlg || typeof dlg.showModal !== 'function') return;  // let the href win
      e.preventDefault();
      dlg.showModal();
      var body = dlg.querySelector('.sheet-body');
      if (body) body.scrollTop = 0;
      return;
    }
    // A backdrop click lands on the <dialog> itself; content clicks land on
    // .sheet-inner or deeper, so comparing the target is enough.
    if (e.target.tagName === 'DIALOG' && e.target.classList.contains('sheet')) {
      e.target.close();
    }
  });
})();
