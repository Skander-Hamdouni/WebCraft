/* ============ WEBCRAFT — canvas.js ============ */

import { state } from './store.js';
import { elDefs, defaultTexts, layerColors } from './defs.js';
import { showToast } from './ui.js';
import { updatePosFields, updateCodePreview, updateSwatches, applyTextStyles, populateTextPanel, initBlockDataFromText, renderBlockFields } from './properties.js';

export function setCanvasBg(color) {
  if (state.pages[state.currentPageId]) state.pages[state.currentPageId].bg = color;
  var canvas = document.getElementById('canvas');
  if (canvas) canvas.style.background = color;
  var picker = document.getElementById('canvas-bg-picker');
  if (picker) picker.value = color;
  saveState();
}

export function applyCanvasBg() {
  var bg = (state.pages[state.currentPageId] || {}).bg || '#ffffff';
  var canvas = document.getElementById('canvas');
  if (canvas) canvas.style.background = bg;
  var picker = document.getElementById('canvas-bg-picker');
  if (picker) picker.value = bg;
}

export function initDefaultCanvas() {
  addEl('nav', 0, 0);
  addEl('hero', 0, 50);
  addEl('text', 30, 210);
  addEl('image', 450, 210);
  addEl('cta', 0, 350);
  addEl('footer', 0, 460);
  renderLayers();
  initMarqueeSelection();
}

export function addEl(type, x, y, text) {
  var id = 'el-' + (++state.elCounter);
  var def = elDefs[type];
  var canvasW = state.mobileMode ? 375 : 900;
  var data = {
    id, type,
    label: def.label,
    x: Math.round(x / 10) * 10,
    y: Math.round(y / 10) * 10,
    w: def.fullWidth ? canvasW : def.w, h: def.h, bg: def.bg,
    text: text || defaultTexts[type] || '',
    zIndex: Object.keys(state.els).length,
    paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
    marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
    imageData: null,
    color: '#1a1a1a'
  };
  state.els[id] = data;
  saveState();
  renderEl(data);
  updateCanvasHeight();
  renderLayers();
}

export function renderEl(d) {
  var canvas = document.getElementById('canvas');
  var existing = document.getElementById(d.id);
  if (existing) existing.remove();

  var el = document.createElement('div');
  el.className = 'canvas-el';
  el.id = d.id;
  el.style.left = d.x + 'px';
  el.style.top  = d.y + 'px';
  el.style.width = d.w + 'px';
  el.style.minHeight = d.h + 'px';
  el.style.zIndex = d.zIndex || 0;
  el.style.padding = (d.paddingTop||0)+'px '+(d.paddingRight||0)+'px '+(d.paddingBottom||0)+'px '+(d.paddingLeft||0)+'px';
  el.style.margin  = (d.marginTop||0)+'px '+(d.marginRight||0)+'px '+(d.marginBottom||0)+'px '+(d.marginLeft||0)+'px';

  el.innerHTML =
    '<div class="el-handle">' + d.label
    + '<button class="el-dup" title="Dupliquer" onclick="window.__wc.duplicateEl(\'' + d.id + '\'); event.stopPropagation();">⧉</button>'
    + '<button class="el-del" title="Supprimer"  onclick="window.__wc.delEl(\'' + d.id + '\'); event.stopPropagation();">✕</button>'
    + '</div>'
    + getElementContent(d)
    + '<div class="resize-nub" id="rn-' + d.id + '"></div>';

  var inner = el.querySelector('[class*="-inner"]');
  if (inner && d.bg) inner.style.background = d.bg;
  applyTextStyles(el, d);

  el.addEventListener('click', function(e) {
    e.stopPropagation();
    if (e.ctrlKey || e.metaKey) toggleElSelection(d.id);
    else selectElById(d.id);
  });

  if (d.type !== 'image' && d.type !== 'divider' && d.type !== 'spacer') {
    el.addEventListener('dblclick', function(e) {
      e.stopPropagation();
      if (_blockItemSel[d.type]) {
        enterGroupMode(d.id);
      } else {
        enableEditMode(el, d);
      }
    });
  }

  if (d.type === 'image') {
    var imgArea = el.querySelector('.el-img-inner');
    if (imgArea) {
      imgArea.addEventListener('click', function(e) {
        e.stopPropagation();
        document.getElementById('image-upload-' + d.id).click();
      });
    }
  }

  makeDraggable(el, d);
  makeResizable(el, d);
  canvas.appendChild(el);
  _applyItemPositions(el, d);
  // If this block is the one being group-edited, re-enter group mode after re-render
  if (state.groupEditingId === d.id) {
    _activateGroupItems(el, d);
  }
}

// CSS selector for draggable/selectable sub-items per block type
var _blockItemSel = {
  features: '.feature-item',
  team: '.team-card',
  steps: '.step-item',
  stats: '.stat-box',
  progress: '.progress-item',
  faq: '.faq-item',
  logobar: '.logo-item',
  section: '.section-col',
  pricing: '.pricing-card',
  gallery: '.gallery-item',
  list: 'li'
};

// Apply stored x/y positions to sub-items (free layout mode)
function _applyItemPositions(el, d) {
  var sel = _blockItemSel[d.type];
  if (!sel || !d.items) return;
  var hasPositions = d.items.some(function(i) { return i.x !== undefined; });
  if (!hasPositions) return;
  var inner = el.querySelector('[class*="-inner"]');
  if (inner) inner.style.position = 'relative';
  var subEls = el.querySelectorAll(sel);
  subEls.forEach(function(subEl, idx) {
    var item = d.items[idx];
    if (item && item.x !== undefined) {
      subEl.style.position = 'absolute';
      subEl.style.left = item.x + 'px';
      subEl.style.top = item.y + 'px';
      subEl.style.margin = '0';
    }
  });
}

// Activate interactive sub-items after entering group mode
function _activateGroupItems(el, d) {
  var sel = _blockItemSel[d.type];
  if (!sel) return;
  el.classList.add('block-group-editing');
  var subEls = el.querySelectorAll(sel);
  subEls.forEach(function(subEl, idx) {
    subEl.classList.add('group-sub-item');
    _makeSubItemDraggable(subEl, el, d, idx);
  });
}

function _makeSubItemDraggable(subEl, blockEl, d, idx) {
  var dragging = false;
  var startMouseX, startMouseY, startItemX, startItemY;

  subEl.addEventListener('mousedown', function(e) {
    if (e.target.closest('button, input, textarea, [contenteditable]')) return;
    e.preventDefault();
    e.stopPropagation();

    // Select this sub-item
    blockEl.querySelectorAll('.group-sub-selected').forEach(function(x) { x.classList.remove('group-sub-selected'); });
    subEl.classList.add('group-sub-selected');

    // Focus in right panel
    var container = document.getElementById('pp-block-fields');
    if (container) {
      var panelItems = container.querySelectorAll('.bf-item');
      panelItems.forEach(function(it, i) { it.classList.toggle('bf-item-focused', i === idx); });
      var target = panelItems[idx];
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    if (!d.items || !d.items[idx]) return;

    dragging = true;
    startMouseX = e.clientX;
    startMouseY = e.clientY;
    startItemX = d.items[idx].x || 0;
    startItemY = d.items[idx].y || 0;

    function onMove(e2) {
      if (!dragging) return;
      var dx = e2.clientX - startMouseX;
      var dy = e2.clientY - startMouseY;
      d.items[idx].x = Math.round((startItemX + dx) / 5) * 5;
      d.items[idx].y = Math.round((startItemY + dy) / 5) * 5;
      subEl.style.left = d.items[idx].x + 'px';
      subEl.style.top = d.items[idx].y + 'px';
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      saveState();
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  subEl.addEventListener('click', function(e) { e.stopPropagation(); });
}

export function enterGroupMode(blockId) {
  if (state.groupEditingId === blockId) return;
  exitGroupMode();
  var el = document.getElementById(blockId);
  var d = state.els[blockId];
  if (!el || !d) return;

  var sel = _blockItemSel[d.type];
  if (!sel) return;

  selectElById(blockId);
  state.groupEditingId = blockId;

  // Initialize positions from DOM if items have none yet
  var subEls = el.querySelectorAll(sel);
  var inner = el.querySelector('[class*="-inner"]');
  var innerRect = (inner || el).getBoundingClientRect();
  var needsInit = !d.items || d.items.some(function(i) { return i.x === undefined; });

  if (needsInit) {
    if (!d.items) d.items = [];
    subEls.forEach(function(subEl, idx) {
      if (!d.items[idx]) d.items[idx] = {};
      if (d.items[idx].x === undefined) {
        var r = subEl.getBoundingClientRect();
        d.items[idx].x = Math.round(r.left - innerRect.left);
        d.items[idx].y = Math.round(r.top - innerRect.top);
      }
    });
    // Re-render so items become absolutely positioned
    renderEl(d);
    saveState();
    // renderEl re-calls _activateGroupItems because groupEditingId is set
    return;
  }

  _activateGroupItems(el, d);
}

export function exitGroupMode() {
  if (!state.groupEditingId) return;
  var el = document.getElementById(state.groupEditingId);
  if (el) {
    el.classList.remove('block-group-editing');
    el.querySelectorAll('.group-sub-item').forEach(function(sub) {
      sub.classList.remove('group-sub-item', 'group-sub-selected');
    });
  }
  state.groupEditingId = null;
}

function getElementContent(d) {
  if (d.type === 'image' && d.imageData) {
    return '<div class="el-img-inner"><img src="' + d.imageData + '" alt="Uploaded image" style="width:100%;height:100%;object-fit:cover;"></div>'
      + '<input type="file" id="image-upload-' + d.id + '" accept="image/*" style="display:none;" onchange="window.__wc.handleImageUpload(this,\'' + d.id + '\')">';
  }
  var content = elDefs[d.type].html(d);
  if (d.type === 'image') {
    return content + '<input type="file" id="image-upload-' + d.id + '" accept="image/*" style="display:none;" onchange="window.__wc.handleImageUpload(this,\'' + d.id + '\')">';
  }
  return content;
}

function _rebuildTextFromHeading(d, newHeadingText) {
  // For complex pipe-separated blocks, only update the first segment
  var complexTypes = ['nav', 'section', 'stats', 'features', 'team', 'steps', 'quote', 'testimonial', 'list', 'table', 'faq', 'progress'];
  if (complexTypes.indexOf(d.type) !== -1 && d.text && d.text.indexOf('|') !== -1) {
    var parts = d.text.split('|');
    parts[0] = newHeadingText;
    return parts.join('|');
  }
  return newHeadingText;
}

// Map block type → which d.fields key the heading (h2/h3/h4) represents
var _headingFieldMap = {
  hero: 'title', heading: 'title', text: 'title', cta: 'title',
  card: 'title', newsletter: 'title', countdown: 'label',
  list: 'title', video: 'title', banner: 'message', alert: 'message',
  map: 'address', social: 'label', logobar: 'label'
};

function enableEditMode(el, d) {
  var heading = el.querySelector('h2, h3, h4');
  if (heading) {
    heading.contentEditable = 'true';
    heading.focus();
    heading.onblur = function() {
      heading.contentEditable = 'false';
      var newText = heading.textContent;
      d.text = _rebuildTextFromHeading(d, newText);
      // Sync structured field if this block uses one
      var fk = _headingFieldMap[d.type];
      if (fk && d.fields) d.fields[fk] = newText;
      var ppText = document.getElementById('pp-text');
      if (ppText) ppText.value = d.text;
      saveState();
      updateCodePreview(d);
      renderBlockFields(d); // Sync right panel
    };
    heading.onkeydown = function(e) { if (e.key === 'Enter') { e.preventDefault(); heading.blur(); } };
  } else {
    // No heading: focus the text field in props panel
    var ppText = document.getElementById('pp-text');
    if (ppText) { ppText.focus(); ppText.select(); }
  }
}

export function handleImageUpload(input, elId) {
  if (!input.files || !input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    if (state.els[elId]) {
      state.els[elId].imageData = e.target.result;
      saveState();
      renderEl(state.els[elId]);
      selectElById(elId);
    }
  };
  reader.readAsDataURL(input.files[0]);
}

function makeDraggable(el, d) {
  var dragging = false;
  el.addEventListener('mousedown', function(e) {
    if (e.target.closest('.el-del, .el-dup, .resize-nub, button, input, [contenteditable="true"]')) return;
    // In group mode, let sub-item dragging handle it
    if (state.groupEditingId === d.id && e.target.closest('.group-sub-item')) return;
    // Ctrl/Meta+drag → laisser le canvas gérer le rectangle de sélection
    if (e.ctrlKey || e.metaKey) return;
    e.preventDefault(); e.stopPropagation();

    // Multi-sélection : drag groupé si l'élément fait partie de la sélection
    var isMulti = state.selectedEls.length > 1 && state.selectedEls.indexOf(d.id) !== -1;
    if (!isMulti) selectElById(d.id);

    dragging = true;
    el.classList.add('dragging');

    var startMouseX = e.clientX;
    var startMouseY = e.clientY;
    var canvasRect  = document.getElementById('canvas').getBoundingClientRect();
    var targets     = isMulti ? state.selectedEls : [d.id];

    // Snapshot des positions initiales de tous les éléments à bouger
    var initPos = {};
    targets.forEach(function(id) {
      if (state.els[id]) initPos[id] = { x: state.els[id].x, y: state.els[id].y };
    });

    function onMove(e2) {
      if (!dragging) return;
      var dx = e2.clientX - startMouseX;
      var dy = e2.clientY - startMouseY;
      targets.forEach(function(id) {
        var data = state.els[id];
        if (!data || !initPos[id]) return;
        data.x = Math.round(Math.max(0, Math.min(initPos[id].x + dx, canvasRect.width - data.w)) / 10) * 10;
        data.y = Math.round(Math.max(0, initPos[id].y + dy) / 10) * 10;
        var domEl = document.getElementById(id);
        if (domEl) { domEl.style.left = data.x + 'px'; domEl.style.top = data.y + 'px'; }
      });
      updatePosFields(d);
      updateCanvasHeight();
    }
    function onUp() {
      if (!dragging) return;
      dragging = false;
      el.classList.remove('dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      updateCanvasHeight();
      saveState();
      updateCodePreview(d);
    }
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function makeResizable(el, d) {
  var nub = el.querySelector('#rn-' + d.id);
  if (!nub) return;
  var ox, oy, ow, oh;

  function onMove(e2) {
    d.w = Math.max(80, Math.round((ow + (e2.clientX - ox)) / 10) * 10);
    d.h = Math.max(40, Math.round((oh + (e2.clientY - oy)) / 10) * 10);
    el.style.width = d.w + 'px';
    el.style.minHeight = d.h + 'px';
    updateCanvasHeight();
  }
  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    updateCanvasHeight(); saveState(); updateCodePreview(d);
  }
  nub.addEventListener('mousedown', function(e) {
    e.preventDefault(); e.stopPropagation();
    ox = e.clientX; oy = e.clientY; ow = d.w; oh = d.h;
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });
}

function toggleElSelection(id) {
  var idx = state.selectedEls.indexOf(id);
  if (idx !== -1) {
    // Retirer de la sélection
    state.selectedEls.splice(idx, 1);
    var domEl = document.getElementById(id);
    if (domEl) domEl.classList.remove('selected');
    if (state.selectedEls.length === 0) {
      state.selectedEl = null;
      _hideAllPanels();
      document.getElementById('no-sel-msg').style.display = 'block';
    } else if (state.selectedEls.length === 1) {
      selectElById(state.selectedEls[0]);
    } else {
      showMultiPanel(state.selectedEls);
    }
  } else {
    // Ajouter à la sélection
    state.selectedEls.push(id);
    state.selectedEl = null;
    var domEl2 = document.getElementById(id);
    if (domEl2) domEl2.classList.add('selected');
    document.getElementById('props-panel').style.display = 'none';
    showMultiPanel(state.selectedEls);
  }
}

export function selectElById(id) {
  // Exit group mode if selecting a different block
  if (state.groupEditingId && state.groupEditingId !== id) exitGroupMode();

  var canvasWrap = document.getElementById('canvas-wrap');
  var savedScroll = canvasWrap ? canvasWrap.scrollTop : 0;

  document.querySelectorAll('.canvas-el').forEach(function(x) { x.classList.remove('selected'); });
  state.selectedEl  = id;
  state.selectedEls = [id];
  document.getElementById('multi-sel-panel').style.display = 'none';
  var el = document.getElementById(id);
  if (el) el.classList.add('selected');

  var d = state.els[id];
  if (!d) return;

  document.getElementById('no-sel-msg').style.display = 'none';
  document.getElementById('props-panel').style.display = 'block';
  document.getElementById('pp-type').value  = d.label;
  document.getElementById('pp-text').value  = d.text;
  document.getElementById('pp-x').value     = Math.round(d.x);
  document.getElementById('pp-y').value     = Math.round(d.y);
  document.getElementById('pp-color').value = d.color || '#1a1a1a';
  document.getElementById('pp-pt').value = d.paddingTop    || 0;
  document.getElementById('pp-pr').value = d.paddingRight  || 0;
  document.getElementById('pp-pb').value = d.paddingBottom || 0;
  document.getElementById('pp-pl').value = d.paddingLeft   || 0;
  document.getElementById('pp-mt').value = d.marginTop     || 0;
  document.getElementById('pp-mr').value = d.marginRight   || 0;
  document.getElementById('pp-mb').value = d.marginBottom  || 0;
  document.getElementById('pp-ml').value = d.marginLeft    || 0;
  updateSwatches(d.bg);
  updateCodePreview(d);
  var textToolbar = document.getElementById('text-toolbar');
  if (textToolbar) textToolbar.style.display = 'flex';
  populateTextPanel(d);
  initBlockDataFromText(d);
  renderBlockFields(d);
  renderLayers();

  var animControls = document.getElementById('anim-controls');
  if (animControls) {
    animControls.style.display = 'block';
    if (state.elementAnimations[id]) {
      document.getElementById('anim-duration').value = state.elementAnimations[id].duration || 600;
    }
  }

  if (canvasWrap) canvasWrap.scrollTop = savedScroll;
}

export function canvasClick(e) {
  if (e.target.id !== 'canvas') return;
  if (_suppressNextCanvasClick) { _suppressNextCanvasClick = false; return; }
  exitGroupMode();
  var canvasWrap = document.getElementById('canvas-wrap');
  var savedScroll = canvasWrap ? canvasWrap.scrollTop : 0;
  document.querySelectorAll('.canvas-el').forEach(function(x) { x.classList.remove('selected'); });
  state.selectedEl  = null;
  state.selectedEls = [];
  _hideAllPanels();
  document.getElementById('no-sel-msg').style.display = 'block';
  if (canvasWrap) canvasWrap.scrollTop = savedScroll;
}

function _hideAllPanels() {
  document.getElementById('props-panel').style.display      = 'none';
  document.getElementById('multi-sel-panel').style.display  = 'none';
  var animControls = document.getElementById('anim-controls');
  if (animControls) animControls.style.display = 'none';
}

// ---- Groupe multi-sélection ----
export function showMultiPanel(ids) {
  var n = ids.length;
  document.getElementById('multi-sel-count').textContent =
    n + ' élément' + (n > 1 ? 's' : '') + ' sélectionné' + (n > 1 ? 's' : '');
  document.getElementById('no-sel-msg').style.display     = 'none';
  document.getElementById('props-panel').style.display    = 'none';
  document.getElementById('multi-sel-panel').style.display = 'block';
  ['pt','pr','pb','pl'].forEach(function(k) {
    var inp = document.getElementById('mpp-' + k);
    if (inp) inp.value = '';
  });
}

export function alignGroup(direction) {
  if (state.selectedEls.length < 2) return;
  var els = state.selectedEls.map(function(id) { return state.els[id]; }).filter(Boolean);
  var minX = Math.min.apply(null, els.map(function(d) { return d.x; }));
  var maxX = Math.max.apply(null, els.map(function(d) { return d.x + d.w; }));
  var minY = Math.min.apply(null, els.map(function(d) { return d.y; }));
  var maxY = Math.max.apply(null, els.map(function(d) { return d.y + (d.h || 100); }));
  var cx   = (minX + maxX) / 2;
  var cy   = (minY + maxY) / 2;
  els.forEach(function(d) {
    if (direction === 'left')     d.x = minX;
    if (direction === 'right')    d.x = maxX - d.w;
    if (direction === 'center-h') d.x = Math.round(cx - d.w / 2);
    if (direction === 'top')      d.y = minY;
    if (direction === 'bottom')   d.y = maxY - (d.h || 100);
    if (direction === 'center-v') d.y = Math.round(cy - (d.h || 100) / 2);
    var domEl = document.getElementById(d.id);
    if (domEl) { domEl.style.left = d.x + 'px'; domEl.style.top = d.y + 'px'; }
  });
  saveState();
}

export function distributeGroup(axis) {
  if (state.selectedEls.length < 3) return;
  var els = state.selectedEls.map(function(id) { return state.els[id]; }).filter(Boolean);
  if (axis === 'h') {
    els.sort(function(a, b) { return a.x - b.x; });
    var totalW = els.reduce(function(s, d) { return s + d.w; }, 0);
    var gap    = (els[els.length-1].x + els[els.length-1].w - els[0].x - totalW) / (els.length - 1);
    var cur    = els[0].x;
    els.forEach(function(d) {
      d.x = Math.round(cur / 10) * 10;
      cur += d.w + gap;
      var domEl = document.getElementById(d.id);
      if (domEl) domEl.style.left = d.x + 'px';
    });
  } else {
    els.sort(function(a, b) { return a.y - b.y; });
    var totalH = els.reduce(function(s, d) { return s + (d.h || 100); }, 0);
    var gap    = (els[els.length-1].y + (els[els.length-1].h || 100) - els[0].y - totalH) / (els.length - 1);
    var cur    = els[0].y;
    els.forEach(function(d) {
      d.y = Math.round(cur / 10) * 10;
      cur += (d.h || 100) + gap;
      var domEl = document.getElementById(d.id);
      if (domEl) domEl.style.top = d.y + 'px';
    });
  }
  saveState();
}

export function setGroupPadding(side, val) {
  if (state.selectedEls.length < 2) return;
  var v = parseInt(val) || 0;
  var prop = { top: 'paddingTop', right: 'paddingRight', bottom: 'paddingBottom', left: 'paddingLeft' }[side];
  if (!prop) return;
  state.selectedEls.forEach(function(id) {
    if (!state.els[id]) return;
    state.els[id][prop] = v;
    var domEl = document.getElementById(id);
    if (domEl) {
      var d = state.els[id];
      domEl.style.padding = (d.paddingTop||0)+'px '+(d.paddingRight||0)+'px '+(d.paddingBottom||0)+'px '+(d.paddingLeft||0)+'px';
    }
  });
}

export function delGroupEls() {
  if (state.selectedEls.length === 0) return;
  state.selectedEls.forEach(function(id) {
    delete state.els[id];
    var domEl = document.getElementById(id);
    if (domEl) domEl.remove();
  });
  state.selectedEls = [];
  state.selectedEl  = null;
  document.getElementById('multi-sel-panel').style.display = 'none';
  document.getElementById('no-sel-msg').style.display = 'block';
  renderLayers();
  saveState();
  updateCanvasHeight();
}

// ---- Marquee (rectangle de sélection) ----
var _suppressNextCanvasClick = false;
var _marqueeInited = false;

export function initMarqueeSelection() {
  if (_marqueeInited) return;
  _marqueeInited = true;

  var canvas = document.getElementById('canvas');
  if (!canvas) return;

  canvas.addEventListener('mousedown', function(e) {
    // Zone vide OU Ctrl/Meta+clic sur n'importe quel élément
    var fromEmpty = (e.target === canvas);
    var fromCtrl  = (e.ctrlKey || e.metaKey) && !!e.target.closest('.canvas-el');
    if (!fromEmpty && !fromCtrl) return;
    if (e.button !== 0) return;
    if (state.trimModeActive) return;

    var wrap     = document.getElementById('canvas-wrap');
    var canvasRect = canvas.getBoundingClientRect();
    var startScrollY = wrap.scrollTop;  // Capture initial scroll position
    var startX = e.clientX - canvasRect.left;
    var startY = e.clientY - canvasRect.top + startScrollY;

    // Créer le rectangle visuel
    var marqueeEl = document.createElement('div');
    marqueeEl.className = 'marquee-rect';
    marqueeEl.style.cssText = 'position:absolute;left:' + startX + 'px;top:' + startY + 'px;width:0;height:0;pointer-events:none;z-index:9998;';
    canvas.appendChild(marqueeEl);

    var moved = false;

    function onMove(e2) {
      var curScrollY = wrap.scrollTop;  // Get current scroll position
      var curX = e2.clientX - canvasRect.left;
      var curY = e2.clientY - canvasRect.top + curScrollY;
      var x1 = Math.min(startX, curX);
      var y1 = Math.min(startY, curY);
      var x2 = Math.max(startX, curX);
      var y2 = Math.max(startY, curY);
      marqueeEl.style.left   = x1 + 'px';
      marqueeEl.style.top    = (y1 - startScrollY) + 'px';  // Adjust for scroll offset
      marqueeEl.style.width  = (x2 - x1) + 'px';
      marqueeEl.style.height = (y2 - y1) + 'px';
      if ((x2 - x1) > 4 || (y2 - y1) > 4) moved = true;
    }

    function onUp(e2) {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      marqueeEl.remove();

      if (!moved) return;  // simple clic — laisser canvasClick gérer

      var curScrollY = wrap.scrollTop;  // Get current scroll position
      var curX = e2.clientX - canvasRect.left;
      var curY = e2.clientY - canvasRect.top + curScrollY;
      var x1 = Math.min(startX, curX);
      var y1 = Math.min(startY, curY);
      var x2 = Math.max(startX, curX);
      var y2 = Math.max(startY, curY);

      _suppressNextCanvasClick = true;

      // Trouver tous les éléments qui intersectent le rectangle
      var hits = Object.values(state.els).filter(function(d) {
        return d.x < x2 && (d.x + d.w) > x1 && d.y < y2 && (d.y + (d.h || 100)) > y1;
      });

      // Déselectionner tout
      document.querySelectorAll('.canvas-el').forEach(function(x) { x.classList.remove('selected'); });
      state.selectedEl  = null;
      state.selectedEls = [];

      if (hits.length === 0) {
        document.getElementById('no-sel-msg').style.display = 'block';
        document.getElementById('props-panel').style.display = 'none';
        return;
      }

      if (hits.length === 1) {
        selectElById(hits[0].id);
        return;
      }

      // Multi-sélection
      state.selectedEls = hits.map(function(d) { return d.id; });
      hits.forEach(function(d) {
        var el = document.getElementById(d.id);
        if (el) el.classList.add('selected');
      });
      showMultiPanel(state.selectedEls);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  });

  // Curseur croix quand Ctrl est enfoncé (mode sélection)
  document.addEventListener('keydown', function(e) {
    if ((e.key === 'Control' || e.key === 'Meta') && canvas) {
      canvas.style.cursor = 'crosshair';
      canvas.querySelectorAll('.canvas-el').forEach(function(el) { el.style.cursor = 'crosshair'; });
    }
  });
  document.addEventListener('keyup', function(e) {
    if ((e.key === 'Control' || e.key === 'Meta') && canvas) {
      canvas.style.cursor = '';
      canvas.querySelectorAll('.canvas-el').forEach(function(el) { el.style.cursor = ''; });
    }
  });
}

export function saveState() {
  var snapshot = JSON.parse(JSON.stringify(state.els));
  state.undoStack.push(snapshot);
  if (state.undoStack.length > state.maxHistorySteps) state.undoStack.shift();
  state.redoStack = [];
  updateHistoryUI();
  var saveBtn = document.getElementById('save-btn');
  if (saveBtn && saveBtn.textContent.includes('Enregistré')) {
    saveBtn.textContent = '💾 Enregistrer';
    saveBtn.style.background = 'rgba(34,197,94,.18)';
  }
}

export function undo() {
  if (state.undoStack.length === 0) return;
  state.redoStack.push(JSON.parse(JSON.stringify(state.els)));
  state.els = state.undoStack.pop();
  renderCanvas();
  updateHistoryUI();
}

export function redo() {
  if (state.redoStack.length === 0) return;
  state.undoStack.push(JSON.parse(JSON.stringify(state.els)));
  state.els = state.redoStack.pop();
  renderCanvas();
  updateHistoryUI();
}

export function renderCanvas() {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;
  canvas.innerHTML = '';
  Object.keys(state.els).forEach(function(key) { renderEl(state.els[key]); });
  updateCanvasHeight();
  renderLayers();
  if (state.selectedEl && state.els[state.selectedEl]) selectElById(state.selectedEl);
}

export function updateCanvasHeight() {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;
  var maxBottom = 520;
  canvas.querySelectorAll('.canvas-el').forEach(function(el) {
    var bottom = (parseInt(el.style.top) || 0) + (parseInt(el.style.minHeight) || el.offsetHeight || 100);
    if (bottom > maxBottom) maxBottom = bottom;
  });
  var current = parseInt(canvas.style.minHeight) || 520;
  canvas.style.minHeight = Math.max(maxBottom + 50, current) + 'px';
}

export function updateHistoryUI() {
  var btn = document.getElementById('history-indicator');
  if (btn) btn.textContent = (state.undoStack.length + state.redoStack.length) + ' steps';
}

export function renderLayers() {
  var panel = document.getElementById('etab-layers');
  if (!panel) return;
  panel.innerHTML = '';
  Object.values(state.els).forEach(function(d) {
    var item = document.createElement('div');
    item.className = 'layer-item' + (state.selectedEl === d.id ? ' sel' : '');
    item.innerHTML = '<div class="layer-dot" style="background:' + (layerColors[d.type] || '#888') + '"></div>' + d.label;
    item.addEventListener('click', function() { selectElById(d.id); });
    panel.appendChild(item);
  });
}

export function bringForward() {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var maxZ = Math.max.apply(null, Object.values(state.els).map(function(d) { return d.zIndex || 0; }));
  state.els[state.selectedEl].zIndex = maxZ + 1;
  saveState(); renderCanvas(); selectElById(state.selectedEl);
}

export function sendBackward() {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var minZ = Math.min.apply(null, Object.values(state.els).map(function(d) { return d.zIndex || 0; }));
  if (state.els[state.selectedEl].zIndex > minZ) {
    state.els[state.selectedEl].zIndex = minZ - 1;
    saveState(); renderCanvas(); selectElById(state.selectedEl);
  }
}

// ---- Canvas extend / trim ----
export function extendCanvasPage() {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;
  var pageHeight = document.getElementById('canvas-wrap')?.clientHeight || 520;
  var current = parseInt(canvas.style.minHeight) || 520;
  canvas.style.minHeight = (current + pageHeight) + 'px';
  showToast('Page étendue', 'success');
}

export function enterTrimMode(e) {
  if (e) e.stopPropagation();
  if (state.trimModeActive) { exitTrimMode(); return; }
  state.trimModeActive = true;
  state.trimModeIgnoreClick = true;
  setTimeout(function() { state.trimModeIgnoreClick = false; }, 150);
  var trimBtn = document.getElementById('trim-btn');
  if (trimBtn) trimBtn.style.background = '#f97316';
  showToast('Mode découpe activé - Bougez votre souris pour choisir la hauteur', 'info');
  var wrap = document.getElementById('canvas-wrap');
  wrap.addEventListener('mousemove', handleTrimMouseMove);
  wrap.addEventListener('click', confirmTrimHeight);
  document.addEventListener('keydown', handleTrimEscape);
}

export function exitTrimMode() {
  state.trimModeActive = false;
  var trimBtn = document.getElementById('trim-btn');
  if (trimBtn) trimBtn.style.background = 'var(--teal)';
  var wrap = document.getElementById('canvas-wrap');
  wrap.removeEventListener('mousemove', handleTrimMouseMove);
  wrap.removeEventListener('click', confirmTrimHeight);
  document.removeEventListener('keydown', handleTrimEscape);
  document.getElementById('trim-line').style.display = 'none';
  document.getElementById('trim-scissors-left').style.display = 'none';
  document.getElementById('trim-scissors-right').style.display = 'none';
  showToast('Mode découpe annulé', 'info');
}

function handleTrimMouseMove(e) {
  if (!state.trimModeActive) return;
  var wrap = document.getElementById('canvas-wrap');
  var y = e.clientY - wrap.getBoundingClientRect().top + wrap.scrollTop;
  var trimLine = document.getElementById('trim-line');
  trimLine.style.top = y + 'px'; trimLine.style.display = 'block';
  var sl = document.getElementById('trim-scissors-left');
  sl.style.top = y + 'px'; sl.style.display = 'block';
  var sr = document.getElementById('trim-scissors-right');
  sr.style.top = y + 'px'; sr.style.display = 'block';
}

function confirmTrimHeight(e) {
  if (!state.trimModeActive || state.trimModeIgnoreClick) return;
  var wrap = document.getElementById('canvas-wrap');
  var y = e.clientY - wrap.getBoundingClientRect().top + wrap.scrollTop;
  // Supprimer seulement les éléments dont le haut (y) est au-dessus du point de coupe
  var toDelete = Object.keys(state.els).filter(function(id) { return state.els[id].y >= y; });
  if (toDelete.length > 0) {
    if (!confirm('Cette action va supprimer ' + toDelete.length + ' élément' + (toDelete.length > 1 ? 's' : '') + '. Continuer?')) {
      exitTrimMode(); return;
    }
  }
  toDelete.forEach(function(id) { delete state.els[id]; });
  document.getElementById('canvas').style.minHeight = (y + 50) + 'px';
  renderCanvas(); saveState();
  showToast('Canvas découpé' + (toDelete.length > 0 ? ' - ' + toDelete.length + ' élément(s) supprimé(s)' : ''), 'success');
  exitTrimMode();
}

function handleTrimEscape(e) { if (e.key === 'Escape' && state.trimModeActive) exitTrimMode(); }

export function trimToLastElement() {
  var canvas = document.getElementById('canvas');
  if (!canvas) return;
  var maxBottom = 0;
  Object.values(state.els).forEach(function(d) {
    var bottom = d.y + (d.h || 100);
    if (bottom > maxBottom) maxBottom = bottom;
  });
  if (maxBottom === 0) { showToast('Aucun élément sur le canvas', 'info'); return; }
  // On coupe juste après le dernier élément — rien à supprimer
  canvas.style.minHeight = (maxBottom + 20) + 'px';
  renderCanvas(); saveState();
  showToast('Canvas ajusté au dernier élément', 'success');
}
