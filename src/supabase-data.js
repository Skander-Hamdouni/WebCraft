/* ============ WEBCRAFT — supabase-data.js ============ */

import { state } from './store.js';
import { elDefs, defaultTexts, templates } from './defs.js';
import { goPage } from './navigation.js';
import { showToast, animateCount } from './ui.js';
import { renderCanvas, renderLayers, updateHistoryUI } from './canvas.js';

export function loadUserData() {
  if (!state.currentUser) return;

  var greeting = document.getElementById('dash-greeting');
  if (greeting) {
    var name = (state.currentUser.user_metadata && state.currentUser.user_metadata.display_name)
      ? state.currentUser.user_metadata.display_name
      : state.currentUser.email.split('@')[0];
    greeting.textContent = 'Bonjour, ' + name + ' 👋';
  }

  // Membre depuis
  var memberSince = document.getElementById('stat-member-since');
  if (memberSince && state.currentUser.created_at) {
    var d = new Date(state.currentUser.created_at);
    memberSince.textContent = d.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
  }

  state.supabase.from('profiles')
    .select('referral_code').eq('id', state.currentUser.id).single()
    .then(function(result) {
      if (result.data) {
        var refLink = 'webcraft.io/ref/' + result.data.referral_code;
        var refInput = document.getElementById('referral-link');
        if (refInput) refInput.value = refLink;
        var refStat = document.getElementById('stat-referral');
        if (refStat) refStat.textContent = result.data.referral_code;
      }
    });

  loadUserSites();
}

export function loadUserSites() {
  if (!state.currentUser) return;

  state.supabase.from('sites')
    .select('*').eq('user_id', state.currentUser.id).order('updated_at', { ascending: false })
    .then(function(result) {
      if (result.error) { console.error('Sites load error:', result.error); return; }

      var sites = result.data || [];
      var grid = document.getElementById('sites-grid');
      if (!grid) return;

      var newCard = grid.querySelector('.new-site-card');
      grid.innerHTML = '';
      if (newCard) grid.appendChild(newCard);

      var statEl = document.getElementById('stat-sites');
      animateCount(statEl, sites.length);

      // Dernière màj : le premier site est le plus récent (trié par updated_at desc)
      var lastUpd = document.getElementById('stat-lastupdate');
      if (lastUpd) {
        if (sites.length > 0 && sites[0].updated_at) {
          var upd = new Date(sites[0].updated_at);
          var now = new Date();
          var diffMs = now - upd;
          var diffMin = Math.floor(diffMs / 60000);
          var diffH   = Math.floor(diffMin / 60);
          var diffD   = Math.floor(diffH / 24);
          if (diffMin < 1)       lastUpd.textContent = "À l'instant";
          else if (diffMin < 60) lastUpd.textContent = 'Il y a ' + diffMin + ' min';
          else if (diffH < 24)   lastUpd.textContent = 'Il y a ' + diffH + 'h';
          else if (diffD < 7)    lastUpd.textContent = 'Il y a ' + diffD + 'j';
          else                   lastUpd.textContent = upd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
        } else {
          lastUpd.textContent = 'Aucun site';
        }
      }

      // Extraire les éléments de préview pour chaque site avant de générer les cartes
      var sitePreviews = sites.map(function(site) {
        var siteData;
        if (!site.data) {
          siteData = { els: {}, pages: {} };
        } else if (typeof site.data === 'string') {
          try { siteData = JSON.parse(site.data); } catch(e) { siteData = { els: {}, pages: {} }; }
        } else {
          siteData = site.data;
        }
        var els = {};
        if (siteData.pages && Object.keys(siteData.pages).length > 0) {
          var firstPageId = Object.keys(siteData.pages)[0];
          els = (siteData.pages[firstPageId] && siteData.pages[firstPageId].els) || {};
        } else {
          els = siteData.els || {};
        }
        return els;
      });

      sites.forEach(function(site, idx) {
        var card = document.createElement('div');
        card.className = 'site-card';
        card.onclick = function() { loadSiteForEditing(site); };

        var hasContent = Object.keys(sitePreviews[idx]).length > 0;

        card.innerHTML = '<div class="site-thumb">'
          + (hasContent
              ? '<iframe class="site-mini-frame"></iframe>'
              : '<div class="site-thumb-empty"><span>Site vide</span></div>')
          + '<div class="site-thumb-overlay">'
          + '<button onclick="event.stopPropagation();window.__wc.loadSiteForEditing(' + JSON.stringify(site).replace(/"/g,'&quot;') + ')">Éditer</button>'
          + '<button onclick="event.stopPropagation();window.__wc.viewSite(\'' + site.id + '\',\'' + (site.published_url || '') + '\')">Voir</button>'
          + '<button onclick="event.stopPropagation();window.__wc.deleteSite(\'' + site.id + '\')">Supprimer</button>'
          + '</div></div>'
          + '<div class="site-info">'
          + '<div class="site-name">' + (site.name || 'Untitled') + '</div>'
          + '<div class="site-meta">'
          + '<span class="site-url">' + site.id.substring(0, 8) + '.webcraft.io</span>'
          + '<span class="site-status ' + (site.status === 'live' ? 'live' : 'draft') + '">' + (site.status || 'Brouillon') + '</span>'
          + '</div></div>';

        grid.appendChild(card);
      });

      // Générer les previews dans les iframes après insertion dans le DOM
      import('./export.js').then(function(exp) {
        sites.forEach(function(site, idx) {
          var els = sitePreviews[idx];
          if (!Object.keys(els).length) return;
          var card = grid.querySelectorAll('.site-card')[idx];
          if (!card) return;
          var iframe = card.querySelector('.site-mini-frame');
          if (!iframe) return;
          var html = exp.getSitePreviewHTMLFromEls(els);
          if (!html) return;
          var container = iframe.parentElement;
          var scale = container.offsetWidth / 900;
          iframe.style.transform = 'scale(' + scale + ')';
          iframe.style.height = Math.ceil(150 / scale) + 'px';
          var doc = iframe.contentDocument || iframe.contentWindow.document;
          doc.open(); doc.write(html); doc.close();
        });
      });
    });
}

export function loadSiteForEditing(site) {
  if (!site) { console.error('No site provided'); return; }

  // Quitter le mode architecte s'il est actif avant de charger un nouveau site
  import('./architect.js').then(function(arch) { arch.exitArchitectMode(); });

  state.currentSite = site;

  var siteData;
  if (!site.data) {
    siteData = { els: {}, elCounter: 0 };
  } else if (typeof site.data === 'string') {
    try { siteData = JSON.parse(site.data); } catch(e) { siteData = { els: {}, elCounter: 0 }; }
  } else {
    siteData = site.data;
  }

  state.els       = (siteData.els && typeof siteData.els === 'object') ? siteData.els : {};
  state.elCounter = parseInt(siteData.elCounter) || Object.keys(state.els).length || 0;
  state.selectedEl = null;
  state.undoStack  = [];
  state.redoStack  = [];

  // Restaurer les pages sauvegardées, ou créer page-1 par défaut avec les éléments chargés
  if (siteData.pages && typeof siteData.pages === 'object' && Object.keys(siteData.pages).length > 0) {
    state.pages = siteData.pages;
    state.currentPageId = siteData.currentPageId || Object.keys(siteData.pages)[0];
  } else {
    state.pages = {};
    state.pages[state.currentPageId] = { id: state.currentPageId, name: 'Page 1', els: state.els, elCounter: state.elCounter };
  }

  // Restaurer les liens inter-pages
  state.pageLinks = (siteData.pageLinks && typeof siteData.pageLinks === 'object') ? siteData.pageLinks : {};

  var titleInput = document.getElementById('site-title');
  if (titleInput) titleInput.value = site.name || 'Untitled';

  clearInterval(state.autoSaveInterval);
  state.autoSaveInterval = setInterval(autoSaveCanvas, 30000);

  goPage('editor');

  setTimeout(function() {
    import('./canvas.js').then(function(c) { c.applyCanvasBg(); });
    if (Object.keys(state.els).length > 0) {
      renderCanvas(); renderLayers(); updateHistoryUI();
    }
  }, 100);
}

export function autoSaveCanvas() {
  if (!state.currentSite || !state.currentUser) return;

  var savingInd = document.getElementById('saving-indicator');
  if (savingInd) savingInd.style.display = 'inline';

  // Synchroniser la page courante avant de sauvegarder
  if (state.pages[state.currentPageId]) {
    state.pages[state.currentPageId].els = state.els;
    state.pages[state.currentPageId].elCounter = state.elCounter;
  }

  state.supabase.from('sites')
    .update({ name: document.getElementById('site-title').value, data: { els: state.els, elCounter: state.elCounter, pages: state.pages, currentPageId: state.currentPageId, pageLinks: state.pageLinks }, updated_at: new Date().toISOString() })
    .eq('id', state.currentSite.id)
    .then(function(result) {
      if (result.error) console.error('Auto-save error:', result.error);
      if (savingInd) savingInd.style.display = 'none';
      var saveBtn = document.getElementById('save-btn');
      if (saveBtn) {
        saveBtn.textContent = '✓ Enregistré';
        saveBtn.style.background = 'rgba(34,197,94,.35)';
      }
    });
}

var _pendingTemplateKey = null;

export function createNewSite(templateKey) {
  if (!state.currentUser) return;
  _pendingTemplateKey = templateKey;
  var input = document.getElementById('name-modal-input');
  if (input) { input.value = ''; }
  document.getElementById('name-modal').style.display = 'flex';
  setTimeout(function() { if (input) input.focus(); }, 50);
}

export function closeNameModal() {
  document.getElementById('name-modal').style.display = 'none';
  _pendingTemplateKey = null;
}

export function confirmNameModal() {
  var input = document.getElementById('name-modal-input');
  var siteName = input ? input.value.trim() : '';
  if (!siteName) { input && input.focus(); return; }
  var templateKey = _pendingTemplateKey;
  document.getElementById('name-modal').style.display = 'none';
  _pendingTemplateKey = null;
  _doCreateSite(templateKey, siteName);
}

function _doCreateSite(templateKey, siteName) {
  var template = templates[templateKey];
  var siteData = { els: {}, elCounter: 0, pageLinks: {} };
  var localElCounter = 0;

  if (template) {
    template.blocks.forEach(function(block) {
      var id = 'el-' + (++localElCounter);
      var def = elDefs[block.type];
      var data = {
        id, type: block.type, label: def.label,
        x: Math.round(block.x / 10) * 10, y: Math.round(block.y / 10) * 10,
        w: def.w, h: def.h,
        bg: block.bg || def.bg,
        text: block.text || defaultTexts[block.type] || '',
        zIndex: Object.keys(siteData.els).length,
        paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
        marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
        imageData: null, color: '#1a1a1a'
      };
      siteData.els[id] = data;
    });
    siteData.elCounter = localElCounter;
  }

  state.supabase.from('sites')
    .insert({ user_id: state.currentUser.id, name: siteName, data: siteData, status: 'draft' })
    .select()
    .then(function(result) {
      if (result.error) { showToast('Erreur : ' + result.error.message, 'error'); return; }
      if (!result.data || !result.data[0]) { showToast('Erreur : Données vides retournées', 'error'); return; }

      var newSiteId = result.data[0].id;
      state.supabase.from('sites').select('*').eq('id', newSiteId).eq('user_id', state.currentUser.id).single()
        .then(function(fetchResult) {
          if (fetchResult.error) { showToast('Erreur : Impossible de récupérer le site', 'error'); return; }
          showToast('Site créé avec succès !', 'success');
          loadSiteForEditing(fetchResult.data);
        });
    });
}

export function deleteSite(siteId) {
  import('./ui.js').then(function(ui) {
    ui.showConfirm('Supprimer ce site définitivement ?', function() {
      state.supabase.from('sites').delete().eq('id', siteId).eq('user_id', state.currentUser.id)
        .then(function(result) {
          if (result.error) showToast('Erreur : ' + result.error.message, 'error');
          else { showToast('Site supprimé.', 'info'); loadUserSites(); }
        });
    }, 'Supprimer le site');
  });
}

export function viewSite(siteId, publishedUrl) {
  if (publishedUrl) {
    window.open(publishedUrl, '_blank', 'noopener');
  } else {
    showToast('Ce site n\'est pas encore publié.', 'info');
  }
}

export function loadProfilePage() {
  if (!state.currentUser) return;

  var u = state.currentUser;
  var name = (u.user_metadata && u.user_metadata.display_name)
    ? u.user_metadata.display_name
    : u.email.split('@')[0];

  var initials = name.split(' ').map(function(w) { return w[0]; }).join('').substring(0, 2).toUpperCase();

  var avatar = document.getElementById('profile-avatar');
  if (avatar) avatar.textContent = initials;

  var profileName = document.getElementById('profile-name');
  if (profileName) profileName.textContent = name;

  var profileEmail = document.getElementById('profile-email');
  if (profileEmail) profileEmail.textContent = u.email;

  document.getElementById('pf-name').textContent  = name;
  document.getElementById('pf-email').textContent = u.email;
  document.getElementById('pf-id').textContent    = u.id.substring(0, 18) + '…';

  if (u.created_at) {
    var d = new Date(u.created_at);
    document.getElementById('pf-since').textContent = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  state.supabase.from('profiles')
    .select('referral_code, plan').eq('id', u.id).single()
    .then(function(result) {
      if (!result.data) return;

      var code = result.data.referral_code || '—';
      var plan = result.data.plan || 'gratuit';

      var refCode = document.getElementById('pf-referral-code');
      if (refCode) refCode.textContent = code;
      var refLink = document.getElementById('pf-referral-link');
      if (refLink) refLink.textContent = 'webcraft.io/ref/' + code;

      var planLabels = { gratuit: 'Gratuit', pro: 'Pro', equipe: 'Équipe', team: 'Équipe' };
      var planDescs  = {
        gratuit: '3 sites max · Export HTML/CSS · Hébergement Vercel',
        pro:     'Sites illimités · Domaine custom · Sans branding',
        equipe:  'Tout le plan Pro · 5 membres · Collaboration temps réel',
        team:    'Tout le plan Pro · 5 membres · Collaboration temps réel'
      };
      var planColors = { gratuit: '#6b7280', pro: '#7F77DD', equipe: '#1D9E75', team: '#1D9E75' };

      var planLabel = planLabels[plan] || plan;

      var badge = document.getElementById('profile-plan-badge');
      if (badge) { badge.textContent = planLabel; badge.style.background = planColors[plan] || '#6b7280'; }
      var ppbName = document.getElementById('ppb-name');
      if (ppbName) ppbName.textContent = planLabel;
      var ppbDesc = document.getElementById('ppb-desc');
      if (ppbDesc) ppbDesc.textContent = planDescs[plan] || '';
    });
}

export function copyProfileReferral() {
  var el = document.getElementById('pf-referral-link');
  if (!el) return;
  navigator.clipboard.writeText(el.textContent).then(function() {
    var btn = document.getElementById('pf-copy-btn');
    if (btn) { btn.textContent = '✓ Copié !'; setTimeout(function() { btn.textContent = 'Copier le lien'; }, 2000); }
  });
}

export function linkReferral(userId, referralCode) {
  state.supabase.from('profiles').select('id').eq('referral_code', referralCode).single()
    .then(function(result) {
      if (result.data) {
        state.supabase.from('profiles').update({ referred_by: result.data.id }).eq('id', userId);
      }
    });
}
