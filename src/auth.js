/* ============ WEBCRAFT — auth.js ============ */

import { createClient } from '@supabase/supabase-js';
import { state } from './store.js';
import { goPage, updateNav } from './navigation.js';
import { showToast } from './ui.js';

export function initSupabase() {
  state.supabase = createClient(
    import.meta.env.VITE_SUPABASE_URL,
    import.meta.env.VITE_SUPABASE_ANON_KEY
  );

  state.supabase.auth.getUser()
    .catch(function() { goPage('landing'); })
    .then(function(result) {
      if (!result) return;
      if (result.data.user) {
        state.currentUser = result.data.user;
        localStorage.setItem('sb_user', JSON.stringify(state.currentUser));
        updateNav(true);
        import('./supabase-data.js').then(function(m) { m.loadUserData(); });
        goPage('dashboard');
      } else {
        var stored = localStorage.getItem('sb_user');
        if (stored) {
          state.currentUser = JSON.parse(stored);
          updateNav(true);
          import('./supabase-data.js').then(function(m) { m.loadUserData(); });
          goPage('dashboard');
        } else {
          goPage('landing');
        }
      }
    });
}

export function handleSignIn() {
  var email    = document.getElementById('signin-email').value.trim();
  var password = document.getElementById('signin-password').value;
  var errorEl  = document.getElementById('signin-error');

  if (!email || !password) {
    errorEl.textContent = 'Veuillez remplir tous les champs';
    errorEl.style.display = 'block';
    return;
  }

  state.supabase.auth.signInWithPassword({ email, password }).then(function(result) {
    if (result.error) {
      errorEl.textContent = result.error.message;
      errorEl.style.display = 'block';
    } else {
      state.currentUser = result.data.user;
      localStorage.setItem('sb_user', JSON.stringify(state.currentUser));
      clearLoginForm();
      updateNav(true);
      import('./supabase-data.js').then(function(m) { m.loadUserData(); });
      goPage('dashboard');
    }
  });
}

export function handleSignUp() {
  var name         = document.getElementById('signup-name').value.trim();
  var email        = document.getElementById('signup-email').value.trim();
  var password     = document.getElementById('signup-password').value;
  var referralCode = document.getElementById('signup-referral').value.trim();
  var errorEl      = document.getElementById('signup-error');

  if (!email || !password || password.length < 8) {
    errorEl.textContent = 'Email requis, mot de passe minimum 8 caractères';
    errorEl.style.display = 'block';
    return;
  }

  state.supabase.auth.signUp({
    email, password,
    options: { data: { display_name: name, referral_code: referralCode || '' } }
  }).then(function(result) {
    if (result.error) {
      errorEl.textContent = result.error.message;
      errorEl.style.display = 'block';
    } else {
      state.currentUser = result.data.user;
      localStorage.setItem('sb_user', JSON.stringify(state.currentUser));
      if (referralCode) {
        import('./supabase-data.js').then(function(m) { m.linkReferral(state.currentUser.id, referralCode); });
      }
      clearLoginForm();
      updateNav(true);
      import('./supabase-data.js').then(function(m) { m.loadUserData(); });
      goPage('dashboard');
    }
  });
}

export function handleLogout() {
  state.supabase.auth.signOut().then(function() {
    state.currentUser = null;
    state.currentSite = null;
    state.els = {};
    localStorage.removeItem('sb_user');
    clearInterval(state.autoSaveInterval);
    updateNav(false);
    goPage('landing');
  });
}

export function handleGoogleSignIn() { alert('Google Sign-In coming soon!'); }
export function handleGithubSignIn()  { alert('GitHub Sign-In coming soon!'); }

export function clearLoginForm() {
  ['signin-email','signin-password','signup-name','signup-email','signup-password','signup-referral'].forEach(function(id) {
    document.getElementById(id).value = '';
  });
  document.getElementById('signin-error').style.display = 'none';
  document.getElementById('signup-error').style.display = 'none';
}
