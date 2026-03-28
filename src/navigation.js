/* ============ WEBCRAFT — navigation.js ============ */

import { state } from './store.js';

export function updateNav(loggedIn) {
  document.getElementById('nb-login').style.display     = loggedIn ? 'none'         : 'inline-block';
  document.getElementById('nb-dashboard').style.display = loggedIn ? 'inline-block' : 'none';
  document.getElementById('nb-templates').style.display = loggedIn ? 'inline-block' : 'none';
  document.getElementById('nb-editor').style.display    = loggedIn ? 'inline-block' : 'none';
  document.getElementById('nb-new').style.display       = loggedIn ? 'inline-block' : 'none';
  document.getElementById('nb-profile').style.display   = loggedIn ? 'inline-block' : 'none';
  document.getElementById('nb-logout').style.display    = loggedIn ? 'inline-block' : 'none';
}

export function goPage(p) {
  if ((p === 'dashboard' || p === 'editor' || p === 'profile') && !state.currentUser) {
    goPage('login');
    return;
  }

  var appNav = document.querySelector('.app-nav');
  if (p === 'editor' || p === 'landing' || p === 'login') {
    appNav.style.display = 'none';
  } else {
    appNav.style.display = '';
  }

  window.scrollTo(0, 0);

  document.querySelectorAll('.page').forEach(function(x) { x.classList.remove('active'); });
  var targetPage = document.getElementById('page-' + p);
  if (targetPage) targetPage.classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(function(b) { b.classList.remove('active'); });
  var nb = document.getElementById('nb-' + p);
  if (nb) nb.classList.add('active');

  state.currentPage = p;

  if (p === 'dashboard') {
    import('./supabase-data.js').then(function(m) { m.loadUserData(); });
    import('./export.js').then(function(m) { m.initQuickTemplatePreviews(); });
  }

  if (p === 'profile') {
    import('./supabase-data.js').then(function(m) { m.loadProfilePage(); });
  }

  if (p === 'templates') {
    import('./export.js').then(function(m) { m.initTemplateMiniPreviews(); });
  }

  if (p === 'editor') {
    import('./canvas.js').then(function(canvas) { canvas.initMarqueeSelection(); });
    if (!state.currentSite) {
      import('./editor.js').then(function(editor) {
        editor.initPagesManager();
        editor.renderPagesList();
        if (Object.keys(state.els).length === 0) {
          import('./canvas.js').then(function(canvas) { canvas.initDefaultCanvas(); });
        }
      });
    } else {
      import('./editor.js').then(function(editor) { editor.renderPagesList(); });
    }
  }
}
