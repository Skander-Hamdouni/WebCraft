/* ============ WEBCRAFT — landing.js ============ */

export function initLanding() {
  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) entry.target.classList.add('in-view');
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach(function(el, i) {
    el.style.transitionDelay = ((i % 3) * 0.1) + 's';
    observer.observe(el);
  });
}
