/* IR Systems — the only script on the page.
   Copies a palette hex to the clipboard. The heat strip runs on pure CSS, so
   nothing here is required for the page to look finished. */

(function () {
  'use strict';

  var RESET_MS = 1400;

  function flash(button, text, ok) {
    var label = button.querySelector('.copy__label');
    if (!label) return;

    if (!button.dataset.idle) button.dataset.idle = label.textContent;

    label.textContent = text;
    label.classList.toggle('copy__state', ok);

    window.clearTimeout(button.resetTimer);
    button.resetTimer = window.setTimeout(function () {
      label.textContent = button.dataset.idle;
      label.classList.remove('copy__state');
    }, RESET_MS);
  }

  /* Clipboard API needs a secure context; fall back to a throwaway textarea
     so the button still works when the page is opened over plain http. */
  function copy(value) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(value);
    }

    return new Promise(function (resolve, reject) {
      var field = document.createElement('textarea');
      field.value = value;
      field.setAttribute('readonly', '');
      field.style.position = 'fixed';
      field.style.opacity = '0';
      document.body.appendChild(field);
      field.select();

      var done = document.execCommand('copy');
      document.body.removeChild(field);
      done ? resolve() : reject();
    });
  }

  document.addEventListener('click', function (event) {
    var button = event.target.closest('.copy');
    if (!button) return;

    copy(button.dataset.copy).then(
      function () {
        flash(button, 'скопировано', true);
      },
      function () {
        flash(button, 'не вышло', false);
      }
    );
  });

  /* Reveal-on-scroll, used by index.html (the public page). No-op on any
     page without .reveal elements (guideline.html included), so it is safe
     to load everywhere. Elements settle in with a short stagger within
     whichever [data-reveal-group] wraps them, and appear immediately for
     anyone who asked for reduced motion. */
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
