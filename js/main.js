/* IR Systems — the only script on the page.
   Reveal-on-scroll for the hero and section blocks. The heat strip runs on
   pure CSS, so nothing here is required for the page to look finished. */

(function () {
  'use strict';

  function initReveal() {
    var items = document.querySelectorAll('.reveal');
    if (!items.length) return;

    var reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (reduced || !('IntersectionObserver' in window)) {
      items.forEach(function (el) {
        el.classList.add('is-visible');
      });
      return;
    }

    document.querySelectorAll('[data-reveal-group]').forEach(function (group) {
      var STEP_MS = 90;
      var CAP_MS = 360;
      var groupItems = group.querySelectorAll('.reveal');
      groupItems.forEach(function (el, i) {
        el.style.setProperty('--reveal-delay', Math.min(i * STEP_MS, CAP_MS) + 'ms');
      });
    });

    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        });
      },
      { threshold: 0.16, rootMargin: '0px 0px -8% 0px' }
    );

    items.forEach(function (el) {
      io.observe(el);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initReveal);
  } else {
    initReveal();
  }
})();
