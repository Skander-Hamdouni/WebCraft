/* ============ WEBCRAFT — architect.js ============ */

import { state } from './store.js';
import { layerColors } from './defs.js';

var _active    = false;
var _editPage  = null;                  // page en cours d'édition de liens
var _positions = {};                    // { pageId: { x, y } } — positions libres des cartes
var CARD_W     = 180;
var CARD_H     = 155;                   // hauteur approximative d'une carte

// Initialise les positions par défaut pour les pages sans position
function _initPositions(pageIds) {
  var cols = Math.max(1, Math.min(pageIds.length, 4));
  pageIds.forEach(function(pid, i) {
    if (!_positions[pid]) {
      _positions[pid] = {
        x: 100 + (i % cols) * 340,
        y: 120 + Math.floor(i / cols) * 320
      };
    }
  });
}

// ───────────────────────────────────────────
//  Toggle global
// ───────────────────────────────────────────
export function toggleArchitectMode() {
  if (_active) exitArchitectMode();
  else enterArchitectMode();
}

export function enterArchitectMode() {
  // S'assurer que la page courante existe dans state.pages
  if (!state.pages[state.currentPageId]) {
    state.pages[state.currentPageId] = { id: state.currentPageId, name: 'Page 1', els: {}, elCounter: 0 };
  }
  // Synchro de la page courante avant d'entrer
  state.pages[state.currentPageId].els       = JSON.parse(JSON.stringify(state.els));
  state.pages[state.currentPageId].elCounter = state.elCounter;

  _active    = true;
  _editPage  = null;

  document.getElementById('editor-main').style.display   = 'none';
  var aiBar = document.getElementById('ai-bar');
  if (aiBar) aiBar.style.display = 'none';
  var ttb = document.getElementById('text-toolbar');
  if (ttb) ttb.style.display = 'none';
  document.getElementById('architect-view').style.display = 'flex';

  var btn = document.getElementById('architect-btn');
  if (btn) btn.classList.add('active');
  var exitBtn = document.getElementById('exit-arch-topbar-btn');
  if (exitBtn) exitBtn.style.display = '';

  renderArchitectMap();
}

export function exitArchitectMode() {
  _active   = false;
  _editPage = null;

  document.getElementById('editor-main').style.display    = '';
  var aiBar = document.getElementById('ai-bar');
  if (aiBar) aiBar.style.display = '';
  var ttb = document.getElementById('text-toolbar');
  if (ttb) ttb.style.display = '';
  document.getElementById('architect-view').style.display = 'none';

  // Fermer les sous-panneaux
  var eo = document.getElementById('arch-edit-overlay');
  if (eo) eo.style.display = 'none';
  var lm = document.getElementById('arch-link-modal');
  if (lm) lm.style.display = 'none';

  var btn = document.getElementById('architect-btn');
  if (btn) btn.classList.remove('active');
  var exitBtn = document.getElementById('exit-arch-topbar-btn');
  if (exitBtn) exitBtn.style.display = 'none';
}

// ───────────────────────────────────────────
//  Carte des pages (position absolue + drag)
// ───────────────────────────────────────────
export function renderArchitectMap() {
  var canvas = document.getElementById('arch-canvas');
  var detail = document.getElementById('arch-detail');
  if (!canvas) return;

  if (detail) {
    detail.innerHTML = '<div class="arch-det-empty">'
      + '<div style="font-size:2rem;margin-bottom:.6rem;">🗺</div>'
      + 'Cliquez sur une flèche pour voir les liens,<br>ou sur <strong>🔗 Liens</strong> pour en ajouter.<br><br>'
      + '<span style="font-size:.65rem;color:#bbb;">Glissez les cartes pour les repositionner.</span>'
      + '</div>';
  }

  // Supprimer les anciennes cartes (garder le SVG)
  canvas.querySelectorAll('.arch-card').forEach(function(c) { c.remove(); });

  var pageIds = Object.keys(state.pages);
  _initPositions(pageIds);

  pageIds.forEach(function(pageId) {
    var page = state.pages[pageId];
    var pos  = _positions[pageId];
    var isCurrent = pageId === state.currentPageId;

    var linkCount = Object.values(state.pageLinks).filter(function(l) {
      return l.fromPage === pageId;
    }).length;

    var card = document.createElement('div');
    card.className = 'arch-card' + (isCurrent ? ' arch-card--current' : '');
    card.id = 'arch-card-' + pageId;
    card.style.left = pos.x + 'px';
    card.style.top  = pos.y + 'px';

    card.innerHTML =
      '<div class="arch-card-handle" title="Glisser pour déplacer">· · · · ·</div>'
      + '<div class="arch-card-thumb">' + _miniThumb(page.els || {}) + '</div>'
      + '<div class="arch-card-footer">'
      + '<div>'
      + '<div class="arch-card-name">' + page.name + '</div>'
      + (isCurrent ? '<div class="arch-card-badge">Active</div>' : '')
      + (linkCount > 0 ? '<div class="arch-card-badge arch-card-badge--link">' + linkCount + ' lien(s)</div>' : '')
      + '</div>'
      + '<button class="arch-card-edit-btn" onclick="archEditPageLinks(\'' + pageId + '\'); event.stopPropagation();" title="Gérer les liens">🔗 Liens</button>'
      + '</div>';

    _makeDraggable(card, pageId);
    canvas.appendChild(card);
  });

  _drawArrows();
}

// Mini-vignette de la page (blocs colorés)
function _miniThumb(els) {
  var W = 900, H = 600, TW = 156, TH = 100;
  var html = '';
  Object.values(els).forEach(function(d) {
    var x = Math.round(d.x / W * TW);
    var y = Math.round(d.y / H * TH);
    var w = Math.max(4, Math.round(d.w / W * TW));
    var h = Math.max(3, Math.round((d.h || 60) / H * TH));
    var color = layerColors[d.type] || '#94a3b8';
    html += '<div style="position:absolute;left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px;background:' + color + ';border-radius:1px;opacity:.85;"></div>';
  });
  return html;
}

// ───────────────────────────────────────────
//  Drag des cartes
// ───────────────────────────────────────────
function _makeDraggable(card, pageId) {
  card.addEventListener('mousedown', function(e) {
    if (e.target.closest('button')) return; // ne pas draguer si clic sur un bouton
    e.preventDefault();

    var startX   = e.clientX;
    var startY   = e.clientY;
    var origX    = _positions[pageId].x;
    var origY    = _positions[pageId].y;

    card.classList.add('is-dragging');

    function onMove(e2) {
      var newX = Math.max(10, origX + (e2.clientX - startX));
      var newY = Math.max(10, origY + (e2.clientY - startY));
      _positions[pageId] = { x: newX, y: newY };
      card.style.left = newX + 'px';
      card.style.top  = newY + 'px';
      _drawArrows();
    }

    function onUp() {
      card.classList.remove('is-dragging');
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup',   onUp);
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup',   onUp);
  });
}

// ───────────────────────────────────────────
//  Collision et routage dynamique des flèches
// ───────────────────────────────────────────
function _checkLineBoxCollision(x1, y1, x2, y2, boxX, boxY, boxW, boxH) {
  // Ajouter une marge autour de la boîte
  var margin = 30;
  boxX -= margin;
  boxY -= margin;
  boxW += margin * 2;
  boxH += margin * 2;

  // Vérifier si les extrémités sont dans la boîte
  if ((x1 > boxX && x1 < boxX + boxW && y1 > boxY && y1 < boxY + boxH) ||
      (x2 > boxX && x2 < boxX + boxW && y2 > boxY && y2 < boxY + boxH)) {
    return true;
  }

  // Vérifier l'intersection du segment avec les bords
  function lineIntersectsRect(px1, py1, px2, py2) {
    // Test contre les 4 côtés du rectangle
    var sides = [
      { x: boxX, y: boxY, x2: boxX + boxW, y2: boxY },               // top
      { x: boxX, y: boxY + boxH, x2: boxX + boxW, y2: boxY + boxH }, // bottom
      { x: boxX, y: boxY, x2: boxX, y2: boxY + boxH },               // left
      { x: boxX + boxW, y: boxY, x2: boxX + boxW, y2: boxY + boxH }  // right
    ];
    for (var i = 0; i < sides.length; i++) {
      if (_segmentsIntersect(px1, py1, px2, py2, sides[i].x, sides[i].y, sides[i].x2, sides[i].y2)) {
        return true;
      }
    }
    return false;
  }
  return lineIntersectsRect(x1, y1, x2, y2);
}

function _segmentsIntersect(x1, y1, x2, y2, x3, y3, x4, y4) {
  var ccw = function(ax, ay, bx, by, cx, cy) {
    return (cy - ay) * (bx - ax) > (by - ay) * (cx - ax);
  };
  return ccw(x1, y1, x3, y3, x4, y4) !== ccw(x2, y2, x3, y3, x4, y4) &&
         ccw(x1, y1, x2, y2, x3, y3) !== ccw(x1, y1, x2, y2, x4, y4);
}

function _computeArrowPath(x1, y1, x2, y2, fromPageId, toPageId) {
  // Vérifier les collisions avec les autres pages
  var pageIds = Object.keys(state.pages);
  var collisions = [];

  pageIds.forEach(function(pid) {
    if (pid === fromPageId || pid === toPageId) return;
    var pos = _positions[pid];
    if (!pos) return;
    if (_checkLineBoxCollision(x1, y1, x2, y2, pos.x, pos.y, CARD_W, CARD_H)) {
      collisions.push(pos);
    }
  });

  // Si pas de collision, utiliser un chemin simple
  if (collisions.length === 0) {
    var dx = Math.min(120, Math.abs(x2 - x1) * 0.5);
    return 'M' + x1 + ',' + y1
      + ' C' + (x1 + dx) + ',' + y1
      + ' '  + (x2 - dx) + ',' + y2
      + ' '  + x2 + ',' + y2;
  }

  // Avec collisions : router au-dessus ou au-dessous
  var fpPos = _positions[fromPageId];
  var tpPos = _positions[toPageId];
  
  // Déterminer si router en haut ou en bas
  var avgYObstacle = collisions.reduce(function(sum, c) { return sum + c.y; }, 0) / collisions.length;
  var avgYPath = (y1 + y2) / 2;
  var routeUp = avgYObstacle > avgYPath;

  // Déterminer l'offset vertical
  var verticalOffset = 150;
  var wayY = routeUp ? Math.min.apply(Math, collisions.map(function(c) { return c.y; })) - verticalOffset
                     : Math.max.apply(Math, collisions.map(function(c) { return c.y + CARD_H; })) + verticalOffset;

  // Créer un chemin qui contourne par le haut/bas
  var midX = (x1 + x2) / 2;
  return 'M' + x1 + ',' + y1
    + ' Q' + midX + ',' + (y1 - verticalOffset * 0.3)
    + ' ' + midX + ',' + wayY
    + ' T' + x2 + ',' + y2;
}

// ───────────────────────────────────────────
//  SVG flèches (coordonnées issues de _positions)
// ───────────────────────────────────────────
function _drawArrows() {
  var svg = document.getElementById('arch-svg');
  if (!svg) return;

  // Supprimer les anciennes flèches
  svg.querySelectorAll('.arch-arrow, .arch-arrow-hit').forEach(function(e) { e.remove(); });

  // Regrouper les liens par fromPage→toPage
  var conns = {};
  Object.entries(state.pageLinks).forEach(function(entry) {
    var linkKey = entry[0], link = entry[1];
    if (!link.toPage) return;
    
    // Extraire elId de la clé (format: "pageId_elId")
    var lastUnderscoreIdx = linkKey.lastIndexOf('_');
    var elId = linkKey.substring(lastUnderscoreIdx + 1);
    
    var key = link.fromPage + '→' + link.toPage;
    if (!conns[key]) conns[key] = { fromPage: link.fromPage, toPage: link.toPage, items: [] };
    var fromEls = (state.pages[link.fromPage] || {}).els || {};
    var elData  = fromEls[elId];
    conns[key].items.push({ elId: elId, label: elData ? (elData.label || elData.type) : elId });
  });

  // Détecter les connections bidirectionnelles
  var drawnConns = new Set(); // Pour éviter de redessiner les bidirectionnelles

  Object.values(conns).forEach(function(conn) {
    var bidirKey1 = conn.fromPage + '↔' + conn.toPage;
    var bidirKey2 = conn.toPage + '↔' + conn.fromPage;
    
    if (drawnConns.has(bidirKey1) || drawnConns.has(bidirKey2)) {
      return; // Déjà dessinée comme bidirectionnelle
    }

    var reverseKey = conn.toPage + '→' + conn.fromPage;
    var hasReverseLink = !!conns[reverseKey];
    var reverseConn = conns[reverseKey];

    var fp = _positions[conn.fromPage];
    var tp = _positions[conn.toPage];
    if (!fp || !tp) return;

    // Point de départ : bord droit du centre de la carte source
    var x1 = fp.x + CARD_W;
    var y1 = fp.y + CARD_H / 2;
    // Point d'arrivée : bord gauche du centre de la carte cible
    var x2 = tp.x;
    var y2 = tp.y + CARD_H / 2;

    // Calcul du chemin dynamique (évite les obstacles)
    var dPath = _computeArrowPath(x1, y1, x2, y2, conn.fromPage, conn.toPage);

    // Flèche visible tiretée
    var pathEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    pathEl.setAttribute('d', dPath);
    pathEl.setAttribute('class', 'arch-arrow' + (hasReverseLink ? ' arch-arrow--bidir' : ''));
    
    if (hasReverseLink) {
      // Bidirectionnelle : les deux flèches (une de chaque côté)
      pathEl.setAttribute('marker-end', 'url(#arch-arrowhead)');
      pathEl.setAttribute('marker-start', 'url(#arch-arrowhead-left)');
      pathEl.dataset.bidir = 'true';
      pathEl.dataset.reverseConn = JSON.stringify(reverseConn);
      drawnConns.add(bidirKey1);
    } else {
      // Unidirectionnelle : une seule flèche
      pathEl.setAttribute('marker-end', 'url(#arch-arrowhead)');
    }
    
    pathEl.dataset.key = conn.fromPage + '→' + conn.toPage;
    pathEl.dataset.forwardConn = JSON.stringify(conn);
    svg.appendChild(pathEl);

    // Zone de clic large (invisible)
    var hitEl = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    hitEl.setAttribute('d', dPath);
    hitEl.setAttribute('class', 'arch-arrow-hit');
    hitEl.style.pointerEvents = 'all';
    hitEl.addEventListener('click', (function(pathElement) {
      return function(e) { e.stopPropagation(); _selectArrow(pathElement); };
    })(pathEl));
    svg.appendChild(hitEl);
  });
}

function _selectArrow(pathEl) {
  document.querySelectorAll('.arch-arrow').forEach(function(a) { 
    a.classList.remove('arch-arrow--sel');
    if (a.dataset.bidir === 'true') {
      a.setAttribute('marker-end', 'url(#arch-arrowhead)');
      a.setAttribute('marker-start', 'url(#arch-arrowhead-left)');
    }
  });
  pathEl.classList.add('arch-arrow--sel');
  
  // Mettre à jour les marqueurs pour la sélection
  if (pathEl.dataset.bidir === 'true') {
    pathEl.setAttribute('marker-end', 'url(#arch-arrowhead-sel)');
    pathEl.setAttribute('marker-start', 'url(#arch-arrowhead-left-sel)');
  }

  var detail   = document.getElementById('arch-detail');
  if (!detail) return;

  var forwardConn = JSON.parse(pathEl.dataset.forwardConn || '{}');
  var reverseConn = pathEl.dataset.bidir === 'true' ? JSON.parse(pathEl.dataset.reverseConn || '{}') : null;

  // Si bidirectionnelle, afficher les deux directions
  if (reverseConn && reverseConn.items && reverseConn.items.length > 0) {
    var fromName = (state.pages[forwardConn.fromPage] || {}).name || forwardConn.fromPage;
    var toName   = (state.pages[forwardConn.toPage]   || {}).name || forwardConn.toPage;

    var html = '<div class="arch-det-title">🔗 ' + fromName + ' ↔ ' + toName + '</div>'
      + '<div class="arch-det-sub">Lien bidirectionnel</div>';

    // Direction 1 : fromPage → toPage
    html += '<div style="margin-top:1rem; padding-top:1rem; border-top:1px solid #eee;">'
      + '<div style="font-size:.8rem;color:#666;margin-bottom:.5rem;font-weight:500;">' 
      + fromName + ' → ' + toName + ' (' + forwardConn.items.length + ')</div>'
      + '<div class="arch-det-list">';
    
    forwardConn.items.forEach(function(item) {
      html += '<div class="arch-det-item">'
        + '<span class="arch-det-icon">⤷</span>'
        + '<span class="arch-det-label">' + item.label + '</span>'
        + '<button class="arch-det-del" onclick="archRemoveLink(\'' + item.elId + '\',\'' + forwardConn.fromPage + '\')">✕</button>'
        + '</div>';
    });
    html += '</div></div>';

    // Direction 2 : toPage → fromPage
    html += '<div style="margin-top:1rem; padding-top:1rem; border-top:1px solid #eee;">'
      + '<div style="font-size:.8rem;color:#666;margin-bottom:.5rem;font-weight:500;">' 
      + toName + ' → ' + fromName + ' (' + reverseConn.items.length + ')</div>'
      + '<div class="arch-det-list">';

    reverseConn.items.forEach(function(item) {
      html += '<div class="arch-det-item">'
        + '<span class="arch-det-icon">⤷</span>'
        + '<span class="arch-det-label">' + item.label + '</span>'
        + '<button class="arch-det-del" onclick="archRemoveLink(\'' + item.elId + '\',\'' + reverseConn.fromPage + '\')">✕</button>'
        + '</div>';
    });
    html += '</div></div>';

    detail.innerHTML = html;
  } else {
    // Unidirectionnelle : affichage classique
    var fromName = (state.pages[forwardConn.fromPage] || {}).name || forwardConn.fromPage;
    var toName   = (state.pages[forwardConn.toPage]   || {}).name || forwardConn.toPage;

    var html = '<div class="arch-det-title">🔗 ' + fromName + ' → ' + toName + '</div>'
      + '<div class="arch-det-sub">' + forwardConn.items.length + ' lien(s) actif(s)</div>'
      + '<div class="arch-det-list">';

    forwardConn.items.forEach(function(item) {
      html += '<div class="arch-det-item">'
        + '<span class="arch-det-icon">⤷</span>'
        + '<span class="arch-det-label">' + item.label + '</span>'
        + '<button class="arch-det-del" onclick="archRemoveLink(\'' + item.elId + '\',\'' + forwardConn.fromPage + '\')">✕</button>'
        + '</div>';
    });

    html += '</div>';
    detail.innerHTML = html;
  }
}

// ───────────────────────────────────────────
//  Overlay d'édition des liens d'une page
// ───────────────────────────────────────────
export function archEditPageLinks(pageId) {
  _editPage = pageId;
  var overlay = document.getElementById('arch-edit-overlay');
  if (!overlay) return;
  overlay.style.display = 'flex';
  _renderEditOverlay(pageId);
}

function _renderEditOverlay(pageId) {
  var overlay = document.getElementById('arch-edit-overlay');
  var page    = state.pages[pageId];
  if (!overlay || !page) return;

  var els = page.els || {};
  var elCount = Object.keys(els).length;

  var html = '<div class="arch-edit-header">'
    + '<div class="arch-breadcrumb">'
    + '<button class="arch-back-btn" onclick="archCloseEditOverlay()">🗺 Vue principale</button>'
    + '<span class="arch-breadcrumb-sep">›</span>'
    + '<span class="arch-breadcrumb-current">Liens de : <strong>' + page.name + '</strong></span>'
    + '</div>'
    + '<span class="arch-edit-hint">Cliquez un élément pour définir son lien</span>'
    + '</div>';

  if (elCount === 0) {
    html += '<div style="padding:2rem;color:#aaa;font-size:.78rem;text-align:center;">Cette page ne contient aucun élément.<br>Ajoutez des éléments depuis l\'éditeur.</div>';
  } else {
    html += '<div class="arch-edit-els">';
    Object.values(els).forEach(function(d) {
      var link = state.pageLinks[pageId + '_' + d.id];
      var hasLink = !!link;
      var linkLabel = '';
      if (link) {
        if (link.toPage && state.pages[link.toPage]) linkLabel = '→ ' + state.pages[link.toPage].name;
        else if (link.url) linkLabel = '→ ' + link.url;
        else linkLabel = '→ ?';
      }
      html += '<div class="arch-el-card' + (hasLink ? ' arch-el-card--linked' : '') + '" onclick="archOpenLinkDialog(\'' + d.id + '\',\'' + pageId + '\')">'
        + '<div class="arch-el-card-icon">' + _typeIcon(d.type) + '</div>'
        + '<div class="arch-el-card-type">' + (d.label || d.type) + '</div>'
        + (hasLink
            ? '<div class="arch-el-card-link">' + linkLabel + '</div>'
            : '<div class="arch-el-card-none">Aucun lien</div>')
        + '</div>';
    });
    html += '</div>';
  }

  overlay.innerHTML = html;
}

function _typeIcon(type) {
  var icons = { nav: '▭', hero: '★', text: 'T', image: '⬜', cta: '◉', footer: '▁' };
  return icons[type] || '□';
}

export function archCloseEditOverlay() {
  var overlay = document.getElementById('arch-edit-overlay');
  if (overlay) overlay.style.display = 'none';
  _editPage = null;
  renderArchitectMap();
}

// ───────────────────────────────────────────
//  Dialog de lien
// ───────────────────────────────────────────
export function archOpenLinkDialog(elId, fromPageId) {
  var modal = document.getElementById('arch-link-modal');
  if (!modal) return;

  modal.dataset.elId     = elId;
  modal.dataset.fromPage = fromPageId;

  // Remplir la liste des pages cibles
  var select = document.getElementById('arch-link-page-sel');
  select.innerHTML = '<option value="">— Aucune page interne —</option>';
  Object.keys(state.pages).forEach(function(pk) {
    if (pk === fromPageId) return;
    var opt = document.createElement('option');
    opt.value       = pk;
    opt.textContent = state.pages[pk].name;
    select.appendChild(opt);
  });

  // Pré-remplir un lien existant
  var existing = state.pageLinks[fromPageId + '_' + elId];
  if (existing && existing.toPage) {
    select.value = existing.toPage;
    document.getElementById('arch-link-url-inp').value = '';
  } else if (existing && existing.url) {
    select.value = '';
    document.getElementById('arch-link-url-inp').value = existing.url;
  } else {
    select.value = '';
    document.getElementById('arch-link-url-inp').value = '';
  }

  modal.style.display = 'flex';
}

export function archConfirmLink() {
  var modal    = document.getElementById('arch-link-modal');
  var elId     = modal.dataset.elId;
  var fromPage = modal.dataset.fromPage;
  var toPage   = document.getElementById('arch-link-page-sel').value;
  var url      = document.getElementById('arch-link-url-inp').value.trim();

  if (!toPage && !url) {
    delete state.pageLinks[fromPage + '_' + elId];
  } else {
    state.pageLinks[fromPage + '_' + elId] = { fromPage: fromPage, toPage: toPage || null, url: url || null };
  }

  archCloseLinkDialog();

  // Rafraîchir l'overlay d'édition si ouvert
  if (_editPage) _renderEditOverlay(_editPage);
}

export function archCloseLinkDialog() {
  var modal = document.getElementById('arch-link-modal');
  if (modal) modal.style.display = 'none';
}

// ───────────────────────────────────────────
//  Supprimer un lien (depuis le panneau détail)
// ───────────────────────────────────────────
export function archRemoveLink(elId, fromPageId) {
  delete state.pageLinks[fromPageId + '_' + elId];
  renderArchitectMap();
}
