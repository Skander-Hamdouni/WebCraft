/* ============ WEBCRAFT — ui.js ============ */

import { state } from './store.js';

export function showToast(msg, type) {
  type = type || 'info';
  var wrap = document.querySelector('.toast-wrap');
  if (!wrap) {
    wrap = document.createElement('div');
    wrap.className = 'toast-wrap';
    document.body.appendChild(wrap);
  }
  var t = document.createElement('div');
  var icons = { success: '✓', error: '✕', info: '✦' };
  t.className = 'toast ' + type;
  t.innerHTML = '<span>' + (icons[type] || '✦') + '</span> ' + msg;
  wrap.appendChild(t);
  setTimeout(function() {
    t.classList.add('out');
    setTimeout(function() { t.remove(); }, 200);
  }, 2800);
}

export function animateCount(el, target) {
  var start = 0;
  var step = Math.ceil(target / (600 / 16));
  var interval = setInterval(function() {
    start += step;
    if (start >= target) { start = target; clearInterval(interval); }
    el.textContent = start;
  }, 16);
}

export function switchLoginTab(tab, el) {
  document.querySelectorAll('.ltab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('signin-form').style.display = tab === 'signin' ? 'flex' : 'none';
  document.getElementById('signup-form').style.display = tab === 'signup' ? 'flex' : 'none';
}

export function filterTpl(cat, btn) {
  document.querySelectorAll('.filter-btn').forEach(function(b) { b.classList.remove('active'); });
  btn.classList.add('active');
  document.querySelectorAll('.tpl-card').forEach(function(c) {
    c.style.display = (cat === 'all' || c.dataset.cat === cat) ? 'block' : 'none';
  });
}

export function copyParrain() {
  var refInput = document.getElementById('referral-link');
  var btn = document.getElementById('parrain-copy-btn');
  var refLink = refInput ? refInput.value : 'webcraft.io/ref/';
  navigator.clipboard.writeText(refLink).then(function() {
    btn.textContent = 'Copié !';
    setTimeout(function() { btn.textContent = 'Partager mon lien'; }, 1500);
  }).catch(function() {
    btn.textContent = 'Copié !';
    setTimeout(function() { btn.textContent = 'Partager mon lien'; }, 1500);
  });
}

// ---- Generic confirm/prompt dialogs ----
var _confirmCb = null;
var _promptCb  = null;

export function showConfirm(msg, onOk, title) {
  _confirmCb = onOk;
  document.getElementById('gc-title').textContent = title || 'Confirmation';
  document.getElementById('gc-msg').textContent   = msg;
  document.getElementById('generic-confirm-modal').style.display = 'flex';
}
export function _genericConfirmOk() {
  document.getElementById('generic-confirm-modal').style.display = 'none';
  if (_confirmCb) { var cb = _confirmCb; _confirmCb = null; cb(); }
}
export function _genericConfirmCancel() {
  document.getElementById('generic-confirm-modal').style.display = 'none';
  _confirmCb = null;
}

export function showPrompt(msg, defaultVal, onOk, title) {
  _promptCb = onOk;
  document.getElementById('gp-title').textContent = title || 'Saisie';
  document.getElementById('gp-msg').textContent   = msg;
  var input = document.getElementById('gp-input');
  input.value = defaultVal || '';
  document.getElementById('generic-prompt-modal').style.display = 'flex';
  setTimeout(function() { input.focus(); input.select(); }, 50);
}
export function _genericPromptOk() {
  var val = document.getElementById('gp-input').value.trim();
  if (!val) return;
  document.getElementById('generic-prompt-modal').style.display = 'none';
  if (_promptCb) { var cb = _promptCb; _promptCb = null; cb(val); }
}
export function _genericPromptCancel() {
  document.getElementById('generic-prompt-modal').style.display = 'none';
  _promptCb = null;
}

export function initKeyboardShortcuts() {
  document.addEventListener('keydown', function(e) {
    if (state.currentPage !== 'editor') return;

    // Import lazily to avoid circular dep at top level
    import('./canvas.js').then(function(canvas) {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        canvas.undo();
      } else if (e.ctrlKey && e.key === 'y') {
        e.preventDefault();
        canvas.redo();
      } else if (e.key === 'Delete' && state.selectedEl) {
        e.preventDefault();
        import('./properties.js').then(function(props) { props.delEl(state.selectedEl); });
      } else if (e.key === 'Escape') {
        e.preventDefault();
        if (state.groupEditingId) {
          canvas.exitGroupMode();
        } else {
          state.selectedEl = null;
          document.querySelectorAll('.canvas-el').forEach(function(x) { x.classList.remove('selected'); });
          document.getElementById('no-sel-msg').style.display = 'block';
          document.getElementById('props-panel').style.display = 'none';
        }
      } else if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key) && state.selectedEl && state.els[state.selectedEl]) {
        e.preventDefault();
        var d = state.els[state.selectedEl];
        var delta = e.shiftKey ? 10 : 1;
        if (e.key === 'ArrowUp')    d.y = Math.max(46, d.y - delta);
        else if (e.key === 'ArrowDown')  d.y += delta;
        else if (e.key === 'ArrowLeft')  d.x = Math.max(0, d.x - delta);
        else if (e.key === 'ArrowRight') d.x += delta;
        var el = document.getElementById(d.id);
        if (el) { el.style.left = d.x + 'px'; el.style.top = d.y + 'px'; }
        import('./properties.js').then(function(props) {
          props.updatePosFields(d);
          props.updateCodePreview(d);
        });
        canvas.saveState();
      }
    });
  });
}
