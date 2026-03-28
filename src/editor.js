/* ============ WEBCRAFT — editor.js ============ */

import { state } from './store.js';
import { templates } from './defs.js';
import { renderCanvas, renderLayers, saveState, updateHistoryUI, addEl, applyCanvasBg } from './canvas.js';
import { goPage } from './navigation.js';
import { showConfirm, showPrompt } from './ui.js';

export function initPagesManager() {
  if (!state.pages['page-1']) {
    state.pages['page-1'] = { id: 'page-1', name: 'Page 1', els: {}, elCounter: 0, bg: '#ffffff' };
  }
}

export function loadTemplate(templateKey) {
  if (!templates[templateKey]) return;

  if (state.currentUser) {
    import('./supabase-data.js').then(function(m) { m.createNewSite(templateKey); });
    return;
  }

  showConfirm('Ceci remplacera tous les éléments actuels.', function() {
    _applyTemplate(templateKey);
  }, 'Charger ce template ?');
  return;
}

function _applyTemplate(templateKey) {

  state.els = {};
  state.elCounter = 0;
  state.selectedEl = null;
  state.undoStack = [];
  state.redoStack = [];

  var canvas = document.getElementById('canvas');
  if (canvas) canvas.innerHTML = '';

  // Use addEl so all blocks decompose into independent elements
  templates[templateKey].blocks.forEach(function(block) {
    addEl(block.type, block.x, block.y, block.text, block.bg);
  });

  document.getElementById('no-sel-msg').style.display = 'block';
  document.getElementById('props-panel').style.display = 'none';
  saveState(); renderLayers(); updateHistoryUI();
  if (state.currentPage !== 'editor') goPage('editor');
}

export function clearCanvas() {
  showConfirm('Effacer le canvas ? Cette action est irréversible.', function() {
    state.els = {};
    state.elCounter = 0;
    state.selectedEl = null;
    state.undoStack = [];
    state.redoStack = [];
    var canvas = document.getElementById('canvas');
    if (canvas) canvas.innerHTML = '';
    document.getElementById('no-sel-msg').style.display = 'block';
    document.getElementById('props-panel').style.display = 'none';
    updateHistoryUI(); renderLayers();
  }, 'Effacer le canvas');
}

export function addPage() {
  showPrompt('Nom de la nouvelle page :', '', function(pageName) {
    state.pageCounter++;
    var newPageId = 'page-' + state.pageCounter;
    state.pages[newPageId] = { id: newPageId, name: pageName, els: {}, elCounter: 0, bg: '#ffffff' };
    renderPagesList();
  }, 'Nouvelle page');
}

export function renamePage(pageId) {
  showPrompt('Nouveau nom :', state.pages[pageId].name, function(newName) {
    state.pages[pageId].name = newName;
    renderPagesList();
  }, 'Renommer la page');
}

export function deletePage(pageId) {
  if (Object.keys(state.pages).length === 1) {
    import('./ui.js').then(function(ui) { ui.showToast('Vous devez avoir au moins une page.', 'error'); });
    return;
  }

  // Compter les liens liés à cette page
  var linksCount = 0;
  Object.entries(state.pageLinks).forEach(function(entry) {
    var linkKey = entry[0], link = entry[1];
    // Lien qui part de cette page (clé commence par "pageId_")
    if (linkKey.startsWith(pageId + '_')) {
      linksCount++;
    }
    // Lien qui arrive à cette page
    if (link.toPage === pageId) {
      linksCount++;
    }
  });

  var confirmMsg = 'Supprimer cette page définitivement ?';
  if (linksCount > 0) {
    confirmMsg = 'Cette page contient ' + linksCount + ' lien(s) qui seront aussi supprimés.\n\nEs-tu certain ?';
  }

  showConfirm(confirmMsg, function() {
    // Supprimer les liens liés à cette page
    Object.keys(state.pageLinks).forEach(function(linkKey) {
      var link = state.pageLinks[linkKey];
      // Supprimer si c'est un lien qui part de cette page
      if (linkKey.startsWith(pageId + '_')) {
        delete state.pageLinks[linkKey];
      }
      // Supprimer si c'est un lien qui arrive à cette page
      if (link.toPage === pageId) {
        delete state.pageLinks[linkKey];
      }
    });

    delete state.pages[pageId];
    if (state.currentPageId === pageId) switchPage(Object.keys(state.pages)[0]);
    renderPagesList();
  }, 'Supprimer la page');
}

export function switchPage(pageId) {
  if (!state.pages[pageId]) return;
  state.pages[state.currentPageId].els = state.els;
  state.pages[state.currentPageId].elCounter = state.elCounter;
  state.currentPageId = pageId;
  state.els = state.pages[pageId].els || {};
  state.elCounter = state.pages[pageId].elCounter || 0;
  state.selectedEl = null;
  applyCanvasBg();
  renderCanvas(); renderPagesList(); updateHistoryUI();
  document.getElementById('no-sel-msg').style.display = 'block';
  document.getElementById('props-panel').style.display = 'none';
}

export function renderPagesList() {
  // Garantir qu'il y a toujours au moins une page
  if (Object.keys(state.pages).length === 0) {
    state.pages[state.currentPageId] = { id: state.currentPageId, name: 'Page 1', els: state.els, elCounter: state.elCounter };
  }
  var pagesList = document.getElementById('pages-list');
  if (!pagesList) return;
  pagesList.innerHTML = '';
  Object.keys(state.pages).forEach(function(pageId) {
    var page = state.pages[pageId];
    var item = document.createElement('div');
    item.className = 'page-item' + (state.currentPageId === pageId ? ' active' : '');
    item.innerHTML = '<span class="page-name" onclick="window.__wc.switchPage(\'' + pageId + '\')">' + page.name + '</span>'
      + '<div class="page-actions">'
      + '<button class="page-btn" onclick="window.__wc.renamePage(\'' + pageId + '\'); event.stopPropagation();">✎</button>'
      + '<button class="page-btn del" onclick="window.__wc.deletePage(\'' + pageId + '\'); event.stopPropagation();">✕</button>'
      + '</div>';
    pagesList.appendChild(item);
  });
}

export function startDrag(type) {
  state.dragType = type;
  var thumb = document.querySelector('.b-thumb[ondragstart*="' + type + '"]');
  if (thumb) thumb.classList.add('is-dragging');
  var wrap = document.getElementById('canvas-wrap');
  if (wrap) wrap.classList.add('drag-over');
}

export function endDrag() {
  state.dragType = null;
  document.querySelectorAll('.b-thumb').forEach(function(t) { t.classList.remove('is-dragging'); });
  var wrap = document.getElementById('canvas-wrap');
  if (wrap) wrap.classList.remove('drag-over');
}

export function dropOnCanvas(e) {
  if (!state.dragType) return;
  e.preventDefault();
  var canvas = document.getElementById('canvas');
  var rect = canvas.getBoundingClientRect();
  var wrap = document.getElementById('canvas-wrap');
  var x = Math.max(0, e.clientX - rect.left + wrap.scrollLeft - 10);
  var y = Math.max(0, e.clientY - rect.top  + wrap.scrollTop  - 10);
  addEl(state.dragType, Math.round(x), Math.round(y));
  state.dragType = null;
}

export function switchETab(tab, el) {
  document.querySelectorAll('.e-ptab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  document.getElementById('etab-blocs').style.display      = tab === 'blocs'      ? 'grid' : 'none';
  document.getElementById('etab-animations').style.display = tab === 'animations' ? 'flex' : 'none';
  document.getElementById('etab-pages').style.display      = tab === 'pages'      ? 'flex' : 'none';
  if (tab === 'animations' && state.selectedEl) {
    var animControls = document.getElementById('anim-controls');
    if (animControls) animControls.style.display = 'block';
  }
  if (tab === 'pages') renderPagesList();
}

export function toggleDevice() {
  var fromW = state.mobileMode ? 375 : 900;
  var toW   = state.mobileMode ? 900 : 375;
  var ratio = toW / fromW;

  state.mobileMode = !state.mobileMode;

  // Redimensionner tous les éléments proportionnellement
  Object.values(state.els).forEach(function(d) {
    d.x = Math.round(d.x * ratio / 10) * 10;
    d.w = Math.max(20, Math.round(d.w * ratio / 10) * 10);
  });

  var canvas = document.getElementById('canvas');
  canvas.style.width = toW + 'px';
  document.getElementById('device-btn').textContent = state.mobileMode ? '🖥 Desktop' : '📱 Mobile';

  renderCanvas();
  renderLayers();
  saveState();
}
