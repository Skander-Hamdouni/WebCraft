/* ============ WEBCRAFT — export.js ============ */

import JSZip from 'jszip';
import { state } from './store.js';
import { elDefs, templates, defaultTexts } from './defs.js';
import { goPage } from './navigation.js';
import { showToast } from './ui.js';
import { loadUserSites } from './supabase-data.js';

// ---- Helpers ----
function getSiteName() {
  var el = document.getElementById('site-title');
  return el ? el.value : 'Mon Site';
}

function extractColors() {
  var colors = {};
  Object.values(state.els).forEach(function(d) {
    if (d.type === 'nav'  && !colors.primary)   colors.primary   = d.bg;
    if (d.type === 'hero' && !colors.secondary)  colors.secondary = d.bg;
    if (d.type === 'cta'  && !colors.accent)     colors.accent    = d.bg;
  });
  colors.bg   = '#fafaf8';
  colors.text = '#1a1a1a';
  return colors;
}

function getContentHint(type) {
  var hints = {
    nav: '<h1>Navigation</h1>\n      <ul>\n        <li><a href="#home">Home</a></li>\n        <li><a href="#about">About</a></li>\n        <li><a href="#contact">Contact</a></li>\n      </ul>',
    hero: '<h2>Hero Title</h2>\n      <p>Welcome to our site.</p>\n      <a href="#" class="cta-btn">Get Started →</a>',
    text: '<h3>Section Title</h3>\n      <p>Add your content here.</p>',
    image: '<figure>\n        <img src="assets/image.jpg" alt="Sample image">\n        <figcaption>Image caption</figcaption>\n      </figure>',
    cta: '<h3>Ready to join us?</h3>\n      <p>Take the next step.</p>\n      <a href="#" class="cta-btn cta-btn--primary">Start Now →</a>',
    footer: '<p>&copy; 2025 ' + getSiteName() + '. All rights reserved.</p>'
  };
  return hints[type] || '<p>Content placeholder</p>';
}

// ---- Export HTML/CSS ----
export function generateSemanticHTML() {
  var name = getSiteName();
  var bodyContent = '';

  Object.values(state.els).forEach(function(d, i) {
    var tag = d.type === 'nav' ? 'nav' : d.type === 'footer' ? 'footer' : 'section';
    var bemClass = 'block-' + d.type + ' block-' + d.type + '__' + i;
    bodyContent += '\n  <' + tag + ' class="' + bemClass + '">\n'
      + '    <div class="block-' + d.type + '__inner">\n'
      + '      ' + getContentHint(d.type) + '\n'
      + '    </div>\n'
      + '  </' + tag + '>\n';
  });

  return '<!DOCTYPE html>\n'
    + '<html lang="fr">\n'
    + '<head>\n'
    + '  <meta charset="UTF-8">\n'
    + '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
    + '  <title>' + name + '</title>\n'
    + '  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&display=swap" rel="stylesheet">\n'
    + '  <link rel="stylesheet" href="style.css">\n'
    + '</head>\n'
    + '<body>' + bodyContent + '</body>\n'
    + '</html>';
}

export function generateCSS() {
  var colorMap = extractColors();
  var css = ':root {\n'
    + '  --color-primary: '   + (colorMap.primary   || '#1a1a1a') + ';\n'
    + '  --color-secondary: ' + (colorMap.secondary || '#1D9E75') + ';\n'
    + '  --color-accent: '    + (colorMap.accent    || '#D85A30') + ';\n'
    + '  --color-bg: '        + (colorMap.bg        || '#fafaf8') + ';\n'
    + '  --color-text: '      + (colorMap.text      || '#1a1a1a') + ';\n'
    + '  --font-body: \'DM Sans\', sans-serif;\n'
    + '  --spacing-unit: 1rem;\n'
    + '}\n\n';

  css += '*, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }\n\n';
  css += 'html, body { width: 100%; height: 100%; }\n\n';
  css += 'body { font-family: var(--font-body); color: var(--color-text); background: var(--color-bg); line-height: 1.6; }\n\n';
  css += 'a { color: var(--color-secondary); text-decoration: none; }\na:hover { text-decoration: underline; }\n\n';

  Object.values(state.els).forEach(function(d) {
    css += '.block-' + d.type + ' { background-color: ' + d.bg + '; padding: 2rem; }\n'
      + '.block-' + d.type + '__inner { max-width: 1200px; margin: 0 auto; }\n\n';
  });

  css += '@media (max-width: 768px) {\n  body { font-size: 14px; }\n  section, nav, footer { padding: 1rem !important; }\n}\n';
  return css;
}

// ---- Export modal ----
export function showExport() {
  document.getElementById('export-modal').style.display = 'flex';
  updateExportPreview();
}

function updateExportPreview() {
  document.getElementById('export-html-code').textContent = generateSemanticHTML();
  document.getElementById('export-css-code').textContent  = generateCSS();
}

export function switchExpTab(tab, el) {
  document.querySelectorAll('.exp-tab').forEach(function(t) { t.classList.remove('active'); });
  el.classList.add('active');
  var htmlBlock = document.getElementById('export-html-code').parentElement;
  var cssBlock  = document.getElementById('export-css-code').parentElement;
  htmlBlock.style.display = tab === 'html' ? 'block' : 'none';
  cssBlock.style.display  = tab === 'css'  ? 'block' : 'none';
}

export function copyCode(codeId) {
  var text = document.getElementById(codeId).textContent;
  var btn = event.target;
  navigator.clipboard.writeText(text).then(function() {
    var original = btn.textContent;
    btn.textContent = 'Copié !';
    setTimeout(function() { btn.textContent = original; }, 1500);
  }).catch(function() { alert('Copiez manuellement le code ci-dessus.'); });
}

export function copyActiveExport() {
  var activeTab = document.querySelector('.exp-tab.active');
  var codeId = activeTab.textContent === 'HTML' ? 'export-html-code' : 'export-css-code';
  copyCode(codeId);
}

export function downloadZip() {
  var zip = new JSZip();
  zip.file('index.html', generateSemanticHTML());
  zip.file('style.css', generateCSS());
  zip.folder('assets');
  zip.generateAsync({ type: 'blob' }).then(function(content) {
    var link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = getSiteName().replace(/\s+/g, '-').toLowerCase() + '.zip';
    link.click();
  });
}

export function copyElCode() {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var btn = document.getElementById('el-copy-btn');
  navigator.clipboard.writeText(document.getElementById('pp-code').textContent).then(function() {
    btn.textContent = 'Copié !';
    setTimeout(function() { btn.textContent = 'Copier le HTML de cet élément'; }, 1500);
  }).catch(function() {});
}

export function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// ---- Preview ----
var STATUS_BAR_SCRIPT = '(function(){'
  + 'function updateSB(){'
  + 'var bar=document.querySelector(".iphone-status-bar");'
  + 'if(!bar)return;'
  + 'bar.style.visibility="hidden";'
  + 'var el=document.elementFromPoint(window.innerWidth/2,bar.offsetHeight/2);'
  + 'bar.style.visibility="visible";'
  + 'if(!el||el===bar||bar.contains(el))el=document.body;'
  + 'var bg="";var cur=el;'
  + 'while(cur&&cur!==document.documentElement){'
  + 'var c=getComputedStyle(cur).backgroundColor;'
  + 'if(c&&c!=="rgba(0, 0, 0, 0)"&&c!=="transparent"){bg=c;break;}'
  + 'cur=cur.parentElement;}'
  + 'if(!bg)bg="rgb(255,255,255)";'
  + 'var m=bg.match(/rgba?\\((\\d+),\\s*(\\d+),\\s*(\\d+)/);'
  + 'if(!m)return;'
  + 'var lum=(0.299*+m[1]+0.587*+m[2]+0.114*+m[3])/255;'
  + 'bar.style.setProperty("--sb-color",lum>0.5?"#000000":"#ffffff");}'
  + 'updateSB();'
  + 'window.addEventListener("scroll",updateSB,{passive:true});'
  + '})();';

var ANIM_KEYFRAMES = '<style>'
  + '@keyframes fadeIn { 0%{opacity:0} 100%{opacity:1} }'
  + '@keyframes slideInLeft { 0%{transform:translateX(-100px);opacity:0} 100%{transform:translateX(0);opacity:1} }'
  + '@keyframes slideInRight { 0%{transform:translateX(100px);opacity:0} 100%{transform:translateX(0);opacity:1} }'
  + '@keyframes zoomIn { 0%{transform:scale(0.8);opacity:0} 100%{transform:scale(1);opacity:1} }'
  + '@keyframes spin { 0%{transform:rotate(-180deg)} 100%{transform:rotate(0)} }'
  + '@keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-30px)} }'
  + '</style>';

export function openPreview() {
  var previewPage = document.getElementById('page-preview');
  var previewContainer = document.getElementById('preview-container');
  if (!previewPage || !previewContainer) return;

  var isMobile = state.mobileMode;
  document.getElementById('prev-btn-mobile').classList.toggle('active', isMobile);
  document.getElementById('prev-btn-pc').classList.toggle('active', !isMobile);

  _buildPreview(previewContainer, isMobile);

  document.querySelectorAll('.page').forEach(function(p) { p.classList.remove('active'); });
  previewPage.classList.add('active');
  var appNav = document.querySelector('.app-nav');
  if (appNav) appNav.style.display = 'none';
}

export function switchPreviewTo(device) {
  var isMobile = device === 'mobile';
  document.getElementById('prev-btn-mobile').classList.toggle('active', isMobile);
  document.getElementById('prev-btn-pc').classList.toggle('active', !isMobile);
  _buildPreview(document.getElementById('preview-container'), isMobile);
}

function _buildPreview(container, isMobile) {
  container.innerHTML = '';

  var deviceDiv = document.createElement('div');
  deviceDiv.className = 'preview-device ' + (isMobile ? 'mobile-mode' : 'pc-mode');

  var iframe = document.createElement('iframe');
  iframe.style.cssText = [
    'border:none',
    'display:block',
    'width:100%',
    'height:' + (isMobile ? '100%' : '560px'),  // mobile fills device, pc fills below mac toolbar
    'box-sizing:border-box',
    'border-radius:' + (isMobile ? '30px' : '0'),
    'overflow:hidden'
  ].join(';');

  deviceDiv.appendChild(iframe);
  container.appendChild(deviceDiv);

  var htmlContent = generateCompletePreviewHTML(isMobile);
  var doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(htmlContent); doc.close();
}

export function closePreview() {
  document.getElementById('page-preview').style.display = 'none';
  document.getElementById('page-preview').classList.remove('active');
  goPage('editor');
}

function generateCompletePreviewHTML(isMobile) {
  var css     = generatePreviewCSS();
  var editorW = state.mobileMode ? 375 : 900;
  var canvasW = isMobile ? 375 : 900;
  var ratio   = canvasW / editorW;
  var sbOffset = isMobile ? 44 : 0;

  // ── Snapshot de toutes les pages ──────────────────────────────────────
  var allPageIds = Object.keys(state.pages);
  if (allPageIds.length === 0) allPageIds = [state.currentPageId || 'page-1'];
  var firstPageId = state.currentPageId || allPageIds[0];

  var allEls = {}, pageNames = {};
  allPageIds.forEach(function(pid) {
    allEls[pid]    = (pid === state.currentPageId) ? state.els : ((state.pages[pid] || {}).els || {});
    pageNames[pid] = (state.pages[pid] || {}).name || pid;
  });

  // ── CSS multi-pages ───────────────────────────────────────────────────
  var multiCSS =
    '.preview-page{display:none;width:' + canvasW + 'px;}'
    + '.preview-page.pp-active{display:block;}'
    + '.preview-page--ext.pp-active{display:flex!important;}'
    + '.canvas-wrap{position:relative;width:' + canvasW + 'px;overflow:hidden;background:#fff;}'
    + '#pv-nav{position:fixed;top:0;left:0;width:' + canvasW + 'px;z-index:9998;display:none;align-items:center;gap:.6rem;padding:.4rem .85rem;background:rgba(10,10,10,.88);backdrop-filter:blur(8px);box-sizing:border-box;}'
    + '#pv-nav button{background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;padding:.22rem .65rem;border-radius:4px;cursor:pointer;font-size:.7rem;}'
    + '#pv-nav button:hover{background:rgba(255,255,255,.22);}'
    + '#pv-nav-label{color:#ccc;font-size:.7rem;flex:1;}'
    + '.ext-page{display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;gap:1.3rem;text-align:center;background:#f5f5f4;padding:2.5rem;box-sizing:border-box;}'
    + '.ext-icon{font-size:3.5rem;}'
    + '.ext-label{font-size:.75rem;color:#aaa;letter-spacing:.05em;text-transform:uppercase;}'
    + '.ext-url{font-size:.88rem;font-weight:700;color:#1a1a1a;max-width:340px;word-break:break-all;padding:.7rem 1rem;background:#fff;border:1px solid #e8e8e8;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,.05);}'
    + '.ext-open{display:inline-block;padding:.55rem 1.3rem;background:#06b6d4;color:#fff;border:none;border-radius:7px;font-size:.82rem;font-weight:600;cursor:pointer;text-decoration:none;}'
    + '.ext-back{background:none;border:1px solid #ddd;padding:.4rem 1rem;border-radius:5px;cursor:pointer;font-size:.75rem;color:#555;}';

  // ── HEAD ─────────────────────────────────────────────────────────────
  var html = '<!DOCTYPE html><html lang="fr"><head>'
    + '<meta charset="UTF-8">'
    + '<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    + '<link rel="preconnect" href="https://fonts.googleapis.com">'
    + '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>'
    + '<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Syne:wght@600;700;800&family=Inter:wght@400;500;600&family=Roboto:wght@400;500;700&family=Montserrat:wght@400;600;700&family=Poppins:wght@400;500;600&family=Lato:wght@400;700&family=Open+Sans:wght@400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Merriweather:ital,wght@0,400;0,700;1,400&display=swap" rel="stylesheet">'
    + '<style>' + css + '</style>'
    + ANIM_KEYFRAMES
    + '<style>'
    + 'html,body{margin:0;padding:0;background:#fff;width:' + canvasW + 'px;overflow-x:hidden;overflow-y:auto;}'
    + (isMobile ? 'body{padding-top:' + sbOffset + 'px;}' : '')
    + multiCSS
    + '</style>'
    + '</head><body>';

  // Status bar mobile (position:fixed — une seule instance suffit)
  if (isMobile) {
    html += '<div class="iphone-status-bar">'
      + '<div class="status-left"><span>9:41</span></div>'
      + '<div class="status-right">'
      + '<div class="signal-dots"><div class="signal-dot"></div><div class="signal-dot"></div><div class="signal-dot"></div><div class="signal-dot"></div></div>'
      + '<span style="font-size:14px;">📡</span>'
      + '<div class="battery"><div class="battery-level"></div></div>'
      + '</div></div>';
  }

  // Barre de navigation (apparaît après tout changement de page)
  html += '<div id="pv-nav"><button onclick="pvGoBack()">← Retour</button><span id="pv-nav-label"></span></div>';

  // Variables pour les scripts injectés en fin de body
  var hoverCSS    = '';
  var scrollItems = [];
  var clickItems  = [];
  var linkItems   = [];   // { elId, toPage, url }
  var textStyleCSS = '';

  // ── GÉNÉRER CHAQUE PAGE ───────────────────────────────────────────────
  allPageIds.forEach(function(pid) {
    var isFirst = pid === firstPageId;
    var els = allEls[pid];

    var canvasH = 400;
    Object.values(els).forEach(function(d) {
      var b = d.y + (d.h || 100) + (d.paddingTop || 0) + (d.paddingBottom || 0);
      if (b > canvasH) canvasH = b;
    });

    var pageBgColor = (state.pages[pid] || {}).bg || '#ffffff';
    html += '<div class="preview-page' + (isFirst ? ' pp-active' : '') + '" id="pp-' + pid + '">';
    html += '<div class="canvas-wrap" style="height:' + canvasH + 'px;background:' + pageBgColor + ';">';

    Object.values(els).forEach(function(d) {
      // Animations
      var animData  = state.elementAnimations[d.id];
      var uniqueElId = 'pp-' + pid + '-' + d.id;
      var animStyle = '';
      if (animData && animData.type) {
        var animValue = animData.type + ' ' + (animData.duration || 600) + 'ms ease-in-out';
        var trigger   = animData.trigger || 'load';
        if      (trigger === 'load')   { animStyle = 'animation:' + animValue + ' forwards;'; }
        else if (trigger === 'hover')  { hoverCSS += '#' + uniqueElId + '{cursor:pointer;}'; clickItems.push({ id: uniqueElId, anim: animValue, trigger: 'hover' }); }
        else if (trigger === 'scroll') { scrollItems.push({ id: uniqueElId, anim: animValue }); }
        else if (trigger === 'click')  { clickItems.push({ id: uniqueElId, anim: animValue, trigger: 'click' }); }
      }

      // Liens de page (clé composite: pageId_elId)
      var link = (state.pageLinks || {})[pid + '_' + d.id];
      if (link) linkItems.push({ elId: d.id, pageId: pid, toPage: link.toPage || null, url: link.url || null });

      var tag  = d.type === 'nav' ? 'nav' : d.type === 'footer' ? 'footer' : 'section';
      var elX  = Math.round(d.x * ratio);
      var elW  = Math.round(d.w * ratio);
      var elStyle = [
        'position:absolute',
        'left:' + elX + 'px',
        'top:' + d.y + 'px',
        'width:' + elW + 'px',
        'min-height:' + d.h + 'px',
        'box-sizing:border-box',
        'overflow:hidden',
        d.bg ? 'background:' + d.bg : '',
        'padding:' + (d.paddingTop||0) + 'px ' + (d.paddingRight||0) + 'px ' + (d.paddingBottom||0) + 'px ' + (d.paddingLeft||0) + 'px',
        'margin:' + (d.marginTop||0) + 'px ' + (d.marginRight||0) + 'px ' + (d.marginBottom||0) + 'px ' + (d.marginLeft||0) + 'px',
        'z-index:' + (d.zIndex || 0),
        link ? 'cursor:pointer;' : '',
        animStyle
      ].filter(Boolean).join(';');

      html += '<' + tag + ' id="pp-' + pid + '-' + d.id + '" style="' + elStyle + '">'
        + elDefs[d.type].html(d)
        + '</' + tag + '>';

      // Styles texte
      var rules = [];
      if (d.fontFamily)                                        rules.push('font-family:"' + d.fontFamily + '",sans-serif');
      if (d.fontSize)                                          rules.push('font-size:' + d.fontSize + 'px');
      if (d.textColor)                                         rules.push('color:' + d.textColor);
      if (d.fontWeight)                                        rules.push('font-weight:' + d.fontWeight);
      if (d.fontStyle)                                         rules.push('font-style:' + d.fontStyle);
      if (d.textDecoration)                                    rules.push('text-decoration:' + d.textDecoration);
      if (d.textAlign)                                         rules.push('text-align:' + d.textAlign);
      if (d.lineHeight)                                        rules.push('line-height:' + d.lineHeight);
      if (d.letterSpacing != null && d.letterSpacing !== '')   rules.push('letter-spacing:' + d.letterSpacing + 'px');
      if (d.textTransform && d.textTransform !== 'none')       rules.push('text-transform:' + d.textTransform);
      if (d.textShadow)                                        rules.push('text-shadow:' + d.textShadow);
      if (rules.length > 0) textStyleCSS += '#pp-' + pid + '-' + d.id + ' [class*="-inner"]{' + rules.join(';') + ';}';
    });

    html += '</div>'; // .canvas-wrap
    html += '</div>'; // .preview-page
  });

  // ── Pseudo-page URL externe ───────────────────────────────────────────
  html += '<div class="preview-page preview-page--ext" id="pp-__ext__">'
    + '<div class="ext-page">'
    + '<div class="ext-icon">🔗</div>'
    + '<div class="ext-label">Lien externe — simulation de prévisualisation</div>'
    + '<div class="ext-url" id="pv-ext-url"></div>'
    + '<a class="ext-open" id="pv-ext-open" href="#" target="_blank">Ouvrir dans un nouvel onglet →</a>'
    + '<button class="ext-back" onclick="pvGoBack()">← Retour</button>'
    + '</div></div>';

  // ── Styles texte + hover CSS ──────────────────────────────────────────
  if (textStyleCSS) html += '<style>' + textStyleCSS + '</style>';
  if (hoverCSS)     html += '<style>' + hoverCSS + '</style>';

  // ── Script navigation + liens ─────────────────────────────────────────
  var navScript = '(function(){'
    + 'var _h=[];'
    + 'var _c=' + JSON.stringify(firstPageId) + ';'
    + 'var _n=' + JSON.stringify(pageNames) + ';'
    + 'function _show(pid){'
    + 'document.querySelectorAll(".preview-page").forEach(function(p){p.classList.remove("pp-active");p.style.display="none";});'
    + 'var t=document.getElementById("pp-"+pid);'
    + 'if(!t)return;'
    + 't.classList.add("pp-active");'
    + 't.style.display=(pid==="__ext__")?"flex":"block";'
    + '}'
    + 'window.pvGoTo=function(pid){'
    + '_h.push(_c);_c=pid;_show(pid);'
    + 'var nb=document.getElementById("pv-nav");if(nb)nb.style.display="flex";'
    + 'var nl=document.getElementById("pv-nav-label");if(nl)nl.textContent=_n[pid]||pid;'
    + '};'
    + 'window.pvGoExt=function(url){'
    + '_h.push(_c);_c="__ext__";_show("__ext__");'
    + 'var ul=document.getElementById("pv-ext-url");if(ul)ul.textContent=url;'
    + 'var ob=document.getElementById("pv-ext-open");if(ob)ob.href=url;'
    + 'var nb=document.getElementById("pv-nav");if(nb)nb.style.display="flex";'
    + 'var nl=document.getElementById("pv-nav-label");if(nl)nl.textContent="Lien externe";'
    + '};'
    + 'window.pvGoBack=function(){'
    + 'if(!_h.length)return;'
    + '_c=_h.pop();_show(_c);'
    + 'var nb=document.getElementById("pv-nav");'
    + 'if(!_h.length){if(nb)nb.style.display="none";}'
    + 'else{if(nb)nb.style.display="flex";var nl=document.getElementById("pv-nav-label");if(nl)nl.textContent=_n[_c]||_c;}'
    + '};';

  // Gestionnaires de clic sur chaque élément lié
  linkItems.forEach(function(li) {
    var uniqueElId = 'pp-' + li.pageId + '-' + li.elId;
    var v = '_lel_' + uniqueElId.replace(/-/g, '_').replace(/\./g, '_');
    navScript += 'var ' + v + '=document.getElementById("' + uniqueElId + '");';
    navScript += 'if(' + v + ')' + v + '.addEventListener("click",function(e){e.stopPropagation();';
    if (li.toPage) navScript += 'pvGoTo("' + li.toPage + '");';
    else if (li.url) navScript += 'pvGoExt(' + JSON.stringify(li.url) + ');';
    navScript += '});';
  });

  navScript += '})();';
  html += '<script>' + navScript + '<\/script>';

  // ── Script animations (scroll + hover + click) ────────────────────────
  if (scrollItems.length > 0 || clickItems.length > 0) {
    var animScript = '(function(){';
    if (scrollItems.length > 0) {
      animScript += 'var io=new IntersectionObserver(function(entries){'
        + 'entries.forEach(function(e){'
        + 'if(!e.isIntersecting)return;'
        + 'var id=e.target.id;'
        + scrollItems.map(function(s) {
            return 'if(id==="' + s.id + '"){e.target.style.animation="none";setTimeout(function(){e.target.style.animation="' + s.anim + ' forwards";},10);}';
          }).join('')
        + 'io.unobserve(e.target);'
        + '});'
        + '},{threshold:0.15});'
        + scrollItems.map(function(s) {
            return 'var _si=document.getElementById("' + s.id + '");if(_si)io.observe(_si);';
          }).join('');
    }
    clickItems.forEach(function(item) {
      var evt = item.trigger === 'hover' ? 'mouseenter' : 'click';
      animScript += '(function(){var el=document.getElementById("' + item.id + '");if(!el)return;'
        + 'el.addEventListener("' + evt + '",function(){this.style.animation="none";var s=this;setTimeout(function(){s.style.animation="' + item.anim + '";},10);});})();';
    });
    animScript += '})();';
    html += '<script>' + animScript + '<\/script>';
  }

  if (isMobile) html += '<script>' + STATUS_BAR_SCRIPT + '<\/script>';

  // ── Scripts interactivité ─────────────────────────────────────────────
  var interactScript = '(function(){'
    // FAQ toggle
    + 'document.querySelectorAll(".faq-q").forEach(function(q){'
    + 'q.style.cursor="pointer";'
    + 'q.addEventListener("click",function(){'
    + 'var ans=q.parentElement.querySelector(".faq-answer");'
    + 'var plus=q.querySelector(".faq-plus");'
    + 'if(!ans)return;'
    + 'var open=ans.style.display!=="none";'
    + 'ans.style.display=open?"none":"block";'
    + 'if(plus)plus.textContent=open?"+":"−";'
    + '});});'
    // Newsletter / form button feedback
    + 'document.querySelectorAll(".el-newsletter-inner button,.el-form-inner button").forEach(function(btn){'
    + 'btn.addEventListener("click",function(){'
    + 'var orig=btn.textContent;'
    + 'btn.textContent="Merci !";'
    + 'btn.style.background="#1D9E75";'
    + 'setTimeout(function(){btn.textContent=orig;btn.style.background="";},2500);'
    + '});});'
    // Progress bars animation on load
    + 'document.querySelectorAll(".progress-fill").forEach(function(bar){'
    + 'var w=bar.style.width;'
    + 'bar.style.width="0";'
    + 'bar.style.transition="width 1s ease";'
    + 'setTimeout(function(){bar.style.width=w;},200);'
    + '});'
    // Countdown timer
    + '(function(){'
    + 'var boxes=document.querySelectorAll(".cd-num");'
    + 'if(!boxes.length)return;'
    + 'var end=new Date().getTime()+(12*86400+8*3600+45*60+30)*1000;'
    + 'function tick(){'
    + 'var now=new Date().getTime();'
    + 'var diff=Math.max(0,Math.floor((end-now)/1000));'
    + 'var d=Math.floor(diff/86400);'
    + 'var h=Math.floor((diff%86400)/3600);'
    + 'var m=Math.floor((diff%3600)/60);'
    + 'var s=diff%60;'
    + 'var vals=[d,h,m,s];'
    + 'boxes.forEach(function(b,i){if(vals[i]!==undefined)b.textContent=String(vals[i]).padStart(2,"0");});'
    + '}'
    + 'tick();setInterval(tick,1000);'
    + '})();'
    + '})();';

  html += '<script>' + interactScript + '<\/script>';

  html += '</body></html>';
  return html;
}

function generatePreviewCSS() {
  var colorMap = extractColors();
  var css = '* { margin: 0; padding: 0; box-sizing: border-box; }'
    + 'html { width: 100%; }'
    + 'body { width: 100%; font-family: "DM Sans", sans-serif; overflow-x: hidden; overflow-y: auto; }'
    + 'h1,h2,h3,h4,h5,h6 { margin: 0; font-family: "Syne", sans-serif; }'
    + 'p { margin: 0 0 1rem 0; }'
    + 'a { color: #06b6d4; text-decoration: none; }'
    + 'img { max-width: 100%; height: auto; display: block; }'
    + '.cta-btn { display: inline-block; padding: .75rem 1.5rem; background: #06b6d4; color: white; border-radius: 6px; font-weight: 600; }'
    // Status bar
    + '.iphone-status-bar { --sb-color: #000000; display: flex; justify-content: space-between; align-items: center; height: 44px; padding: 8px 16px 0 16px; background: transparent; font-size: 12px; font-weight: 600; color: var(--sb-color); width: 100%; box-sizing: border-box; position: fixed; top: 0; left: 0; z-index: 9999; transition: color 0.2s; }'
    + '.status-left { display: flex; gap: 4px; align-items: center; }'
    + '.status-right { display: flex; gap: 6px; align-items: center; }'
    + '.signal-dots { display: flex; gap: 2px; }'
    + '.signal-dot { width: 2px; height: 8px; background: var(--sb-color); border-radius: 1px; transition: background 0.2s; }'
    + '.battery { width: 24px; height: 12px; border: 1.5px solid var(--sb-color); border-radius: 2px; position: relative; padding: 1px; transition: border-color 0.2s; }'
    + '.battery::after { content: ""; position: absolute; right: -4px; top: 50%; transform: translateY(-50%); width: 2px; height: 5px; background: var(--sb-color); border-radius: 0 1px 1px 0; transition: background 0.2s; }'
    + '.battery-level { width: 16px; height: 8px; background: var(--sb-color); border-radius: 1px; transition: background 0.2s; }'
    // Elements
    + '.el-nav-inner{display:flex;align-items:center;justify-content:space-between;width:100%;padding:.5rem .8rem;border-radius:6px;}'
    + '.en-logo{font-family:"Syne",sans-serif;font-size:.75rem;font-weight:700;color:white;}'
    + '.en-links{display:flex;gap:.6rem;} .en-links span{font-size:.62rem;color:#aaa;}'
    + '.en-btn{background:#D85A30;color:white;border:none;border-radius:4px;padding:3px 9px;font-size:.62rem;font-weight:600;}'
    + '.el-hero-inner{text-align:center;padding:1.8rem 1.5rem;border-radius:6px;position:relative;overflow:hidden;}'
    + '.el-hero-inner h2{font-size:1.4rem;font-weight:800;color:#085041;margin-bottom:.5rem;letter-spacing:-.01em;line-height:1.2;}'
    + '.el-hero-inner p{font-size:.8rem;color:#0F6E56;line-height:1.6;max-width:400px;margin:0 auto .9rem;opacity:.85;}'
    + '.el-hero-inner button{background:linear-gradient(135deg,#1D9E75,#15745a);color:white;border:none;border-radius:6px;padding:.45rem 1.2rem;font-size:.78rem;font-weight:600;box-shadow:0 2px 8px rgba(29,158,117,.3);}'
    + '.el-txt-inner{padding:.8rem;border-radius:6px;} .el-txt-inner h3{font-size:.9rem;font-weight:700;color:#3C3489;margin-bottom:.3rem;} .el-txt-inner p{font-size:.72rem;color:#534AB7;line-height:1.5;}'
    + '.el-cta-inner{text-align:center;padding:1.2rem 1.5rem;border-radius:6px;position:relative;overflow:hidden;}'
    + '.el-cta-inner h3{font-size:1.05rem;font-weight:800;color:white;margin-bottom:.5rem;letter-spacing:-.01em;}'
    + '.el-cta-inner button{background:linear-gradient(135deg,#D85A30,#b8420a);color:white;border:none;border-radius:6px;padding:.45rem 1.3rem;font-size:.78rem;font-weight:600;box-shadow:0 2px 10px rgba(216,90,48,.4);}'
    + '.el-footer-inner{display:flex;justify-content:space-between;align-items:center;padding:.7rem 1rem;border-radius:6px;} .el-footer-inner span{font-size:.68rem;color:#999;} .el-footer-inner .f-logo{font-weight:700;color:#333;}'
    + '.el-heading-inner{display:flex;align-items:center;justify-content:center;padding:.6rem 1rem;border-radius:6px;} .el-heading-inner h2{font-size:1.1rem;font-weight:800;color:#3C3489;}'
    + '.el-card-inner{display:flex;flex-direction:column;gap:.5rem;padding:1rem;border-radius:6px;height:100%;box-sizing:border-box;}'
    + '.el-card-inner::before{content:"";display:block;width:32px;height:4px;border-radius:20px;background:linear-gradient(90deg,#7F77DD,#1D9E75);margin-bottom:.1rem;}'
    + '.el-card-inner h4{font-size:.88rem;font-weight:700;color:#3C3489;margin:0;} .el-card-inner p{font-size:.72rem;color:#534AB7;line-height:1.5;margin:0;}'
    + '.el-section-inner{display:grid;grid-template-columns:1fr 1fr 1fr;gap:.8rem;padding:1rem;border-radius:6px;height:100%;} .section-col{background:rgba(255,255,255,.5);padding:.6rem;border-radius:5px;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;} .section-col h4{font-size:.8rem;font-weight:700;color:#1a1a1a;margin-bottom:.3rem;} .section-col p{font-size:.68rem;color:#444;line-height:1.3;}'
    + '.el-testimonial-inner{display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center;padding:1rem;border-radius:6px;} .testimonial-text{font-size:.75rem;font-style:italic;color:#712B13;line-height:1.6;margin-bottom:.5rem;} .testimonial-author{font-size:.68rem;font-weight:700;color:#3D1610;}'
    + '.el-stats-inner{display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:.6rem;padding:.8rem;border-radius:6px;}'
    + '.stat-box{background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.2);border-radius:8px;padding:.7rem .5rem;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;}'
    + '.stat-box .stat-number{font-size:1.3rem;font-weight:800;color:#085041;margin-bottom:.15rem;line-height:1;}'
    + '.stat-box p{font-size:.62rem;color:rgba(8,80,65,.75);font-weight:600;margin:0;}'
    + '.el-form-inner{display:flex;flex-direction:column;gap:.6rem;padding:1rem;border-radius:6px;} .el-form-inner input,.el-form-inner textarea{border:1px solid rgba(60,52,137,.2);border-radius:4px;padding:.5rem;font-size:.72rem;background:rgba(255,255,255,.6);color:#3C3489;width:100%;box-sizing:border-box;} .el-form-inner button{background:#3C3489;color:white;border:none;border-radius:4px;padding:.5rem .8rem;font-size:.72rem;font-weight:600;}'
    + '.el-banner-inner{display:flex;align-items:center;justify-content:center;gap:.8rem;padding:.5rem 1rem;border-radius:6px;} .el-banner-inner span{font-size:.75rem;font-weight:500;color:#fff;} .el-banner-inner button{background:rgba(255,255,255,.25);border:1px solid rgba(255,255,255,.4);color:#fff;border-radius:4px;padding:.2rem .7rem;font-size:.68rem;}'
    + '.el-alert-inner{display:flex;align-items:center;gap:.6rem;padding:.6rem 1rem;border-radius:6px;border-left:4px solid #f59e0b;} .el-alert-inner .alert-icon{font-size:1rem;} .el-alert-inner span{font-size:.75rem;color:#92400e;line-height:1.4;}'
    + '.el-divider-inner{display:flex;align-items:center;height:100%;padding:0 1rem;} .el-divider-inner hr{width:100%;border:none;border-top:2px solid #ddd;}'
    + '.el-spacer-inner{width:100%;height:100%;}'
    + '.el-gallery-inner{display:grid;grid-template-columns:repeat(3,1fr);gap:.4rem;padding:.6rem;border-radius:6px;height:100%;box-sizing:border-box;} .gallery-item{background:#d0d0d0;border-radius:4px;min-height:60px;}'
    + '.el-video-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:.6rem;border-radius:6px;} .video-play-btn{width:48px;height:48px;background:rgba(255,255,255,.2);border:2px solid rgba(255,255,255,.5);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:1.2rem;color:#fff;} .el-video-inner p{font-size:.8rem;color:rgba(255,255,255,.7);margin:0;}'
    + '.el-quote-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:1rem;border-radius:6px;height:100%;box-sizing:border-box;} .quote-mark{font-size:2.5rem;font-family:Georgia,serif;color:#7F77DD;line-height:.8;margin-bottom:.4rem;} .quote-text{font-size:.78rem;font-style:italic;color:#534AB7;line-height:1.6;margin:0 0 .4rem;} .quote-source{font-size:.68rem;font-weight:700;color:#3C3489;margin:0;}'
    + '.el-list-inner{padding:.8rem 1rem;border-radius:6px;} .el-list-inner h4{font-size:.85rem;font-weight:700;color:#1a1a1a;margin:0 0 .5rem;} .el-list-inner ul{margin:0;padding-left:1.2rem;display:flex;flex-direction:column;gap:.3rem;} .el-list-inner li{font-size:.72rem;color:#444;line-height:1.4;}'
    + '.el-table-inner{padding:.6rem;border-radius:6px;overflow:hidden;} .el-table-inner table{width:100%;border-collapse:collapse;font-size:.7rem;} .el-table-inner th{background:#1a1a1a;color:#fff;padding:.4rem .6rem;text-align:left;font-weight:600;} .el-table-inner td{padding:.35rem .6rem;border-bottom:1px solid #e8e8e8;color:#333;} .el-table-inner tr:nth-child(even) td{background:#f9f9f8;}'
    + '.el-features-inner{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6rem;padding:.8rem;border-radius:6px;} .feature-item{text-align:center;padding:.7rem .5rem;background:rgba(255,255,255,.55);border-radius:8px;border:1px solid rgba(255,255,255,.4);} .feature-icon{font-size:1.5rem;margin-bottom:.4rem;display:block;} .feature-item h4{font-size:.8rem;font-weight:700;color:#1a1a1a;margin:0 0 .25rem;} .feature-item p{font-size:.65rem;color:#555;margin:0;line-height:1.4;}'
    + '.el-pricing-inner{display:grid;grid-template-columns:repeat(3,1fr);gap:.6rem;padding:.8rem;border-radius:6px;}'
    + '.pricing-section-title{grid-column:1/-1;font-family:"Syne",sans-serif;font-size:.9rem;font-weight:800;color:#fff;text-align:center;margin:0 0 .4rem;}'
    + '.pricing-card{background:#fff;border-radius:10px;padding:.8rem;border:1px solid #e8e8e8;position:relative;display:flex;flex-direction:column;gap:.3rem;box-shadow:0 2px 8px rgba(0,0,0,.06);}'
    + '.pricing-card.pricing-featured{border-color:#7F77DD;background:linear-gradient(160deg,#f3f2ff 0%,#fff 100%);box-shadow:0 4px 20px rgba(127,119,221,.2);}'
    + '.pricing-badge{position:absolute;top:-.45rem;right:.7rem;background:linear-gradient(135deg,#7F77DD,#534AB7);color:#fff;font-size:.55rem;font-weight:700;padding:.15rem .6rem;border-radius:20px;}'
    + '.pricing-name{font-size:.78rem;font-weight:700;color:#1a1a1a;} .pricing-price{font-size:1.1rem;font-weight:800;color:#1a1a1a;line-height:1;} .pricing-price span{font-size:.65rem;font-weight:400;color:#888;}'
    + '.pricing-card ul{margin:.2rem 0 0;padding:0;list-style:none;display:flex;flex-direction:column;gap:.25rem;flex:1;} .pricing-card li{font-size:.62rem;color:#555;}'
    + '.pricing-card button{background:#1a1a1a;color:#fff;border:none;border-radius:5px;padding:.35rem .6rem;font-size:.65rem;font-weight:600;margin-top:.3rem;}'
    + '.pricing-featured button{background:linear-gradient(135deg,#7F77DD,#534AB7);box-shadow:0 2px 8px rgba(127,119,221,.3);}'
    + '.el-team-inner{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:.6rem;padding:.8rem;border-radius:6px;}'
    + '.team-card{text-align:center;padding:.5rem;background:rgba(255,255,255,.55);border-radius:8px;border:1px solid rgba(255,255,255,.4);}'
    + '.team-avatar{width:48px;height:48px;border-radius:50%;background:linear-gradient(135deg,#7F77DD,#1D9E75);margin:0 auto .5rem;box-shadow:0 2px 8px rgba(0,0,0,.15);}'
    + '.team-card:nth-child(1) .team-avatar{background:linear-gradient(135deg,#7F77DD,#D4537E);}'
    + '.team-card:nth-child(2) .team-avatar{background:linear-gradient(135deg,#1D9E75,#06b6d4);}'
    + '.team-card:nth-child(3) .team-avatar{background:linear-gradient(135deg,#D85A30,#EF9F27);}'
    + '.team-card:nth-child(4) .team-avatar{background:linear-gradient(135deg,#534AB7,#1D9E75);}'
    + '.team-card h4{font-size:.74rem;font-weight:700;color:#1a1a1a;margin:0 0 .15rem;} .team-card p{font-size:.62rem;color:#888;margin:0;font-style:italic;}'
    + '.el-steps-inner{display:flex;align-items:flex-start;justify-content:center;gap:.4rem;padding:.9rem;border-radius:6px;}'
    + '.step-item{text-align:center;flex:1;padding:.3rem;} .step-num{width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#7F77DD,#534AB7);color:#fff;font-size:.85rem;font-weight:800;display:flex;align-items:center;justify-content:center;margin:0 auto .5rem;box-shadow:0 3px 10px rgba(127,119,221,.35);}'
    + '.step-item h4{font-size:.77rem;font-weight:700;color:#3C3489;margin:0 0 .2rem;} .step-item p{font-size:.62rem;color:#534AB7;margin:0;line-height:1.4;} .step-arrow{font-size:1rem;color:rgba(127,119,221,.4);flex-shrink:0;margin-top:1rem;}'
    + '.el-logobar-inner{display:flex;flex-direction:column;align-items:center;gap:.5rem;padding:.6rem 1rem;border-radius:6px;} .logobar-label{font-size:.65rem;color:#999;text-transform:uppercase;letter-spacing:.05em;margin:0;} .logobar-logos{display:flex;gap:1rem;align-items:center;} .logo-item{font-size:.75rem;font-weight:700;color:#aaa;padding:.3rem .7rem;border:1px solid #ddd;border-radius:4px;}'
    + '.el-progress-inner{padding:.8rem 1rem;border-radius:6px;} .progress-item{display:flex;align-items:center;gap:.6rem;margin-bottom:.4rem;} .progress-label{font-size:.68rem;color:#534AB7;width:90px;flex-shrink:0;} .progress-bar{flex:1;height:7px;background:rgba(60,52,137,.15);border-radius:20px;overflow:hidden;} .progress-fill{height:100%;background:#7F77DD;border-radius:20px;} .progress-pct{font-size:.65rem;font-weight:700;color:#3C3489;width:30px;text-align:right;flex-shrink:0;}'
    + '.el-faq-inner{padding:.8rem 1rem;border-radius:6px;} .faq-item{border-bottom:1px solid rgba(0,0,0,.08);} .faq-q{display:flex;justify-content:space-between;align-items:center;padding:.45rem 0;font-size:.72rem;color:#333;cursor:pointer;} .faq-plus{font-size:.9rem;font-weight:700;color:#7F77DD;}'
    + '.el-newsletter-inner{text-align:center;padding:1.2rem 1.5rem;border-radius:6px;position:relative;overflow:hidden;}'
    + '.el-newsletter-inner h3{font-size:1rem;font-weight:800;color:#fff;margin:0 0 .25rem;letter-spacing:-.01em;} .el-newsletter-inner p{font-size:.74rem;color:rgba(255,255,255,.6);margin:0 0 .8rem;}'
    + '.newsletter-form{display:flex;gap:.4rem;justify-content:center;} .newsletter-form input{border:1px solid rgba(255,255,255,.15);border-radius:6px;padding:.45rem .9rem;font-size:.74rem;background:rgba(255,255,255,.08);color:#fff;width:190px;} .newsletter-form button{background:linear-gradient(135deg,#06b6d4,#0891b2);color:#fff;border:none;border-radius:6px;padding:.45rem 1rem;font-size:.74rem;font-weight:600;}'
    + '.el-countdown-inner{text-align:center;padding:1rem;border-radius:6px;} .el-countdown-inner h4{font-size:.82rem;color:rgba(255,255,255,.65);margin:0 0 .7rem;font-weight:400;letter-spacing:.02em;}'
    + '.countdown-boxes{display:flex;align-items:center;justify-content:center;gap:.5rem;} .cd-box{background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.12);border-radius:8px;padding:.5rem .7rem;text-align:center;min-width:48px;} .cd-num{font-size:1.4rem;font-weight:800;color:#fff;line-height:1;letter-spacing:-.02em;} .cd-label{font-size:.5rem;color:rgba(255,255,255,.45);text-transform:uppercase;letter-spacing:.08em;margin-top:.2rem;} .cd-sep{font-size:1.3rem;font-weight:700;color:rgba(255,255,255,.35);margin-bottom:.8rem;}'
    + '.el-map-inner{display:flex;align-items:center;justify-content:center;height:100%;border-radius:6px;background:linear-gradient(135deg,#d0e8d0,#c8d8e8);} .map-placeholder{text-align:center;padding:1rem;} .map-pin{font-size:2rem;display:block;margin-bottom:.4rem;} .map-placeholder p{font-size:.78rem;font-weight:600;color:#333;margin:0 0 .2rem;} .map-hint{font-size:.62rem;color:#888;}'
    + '.el-social-inner{display:flex;align-items:center;justify-content:center;gap:1rem;padding:.7rem;border-radius:6px;} .social-label{font-size:.72rem;color:rgba(255,255,255,.6);margin:0;} .social-links{display:flex;gap:.4rem;} .social-btn{width:28px;height:28px;border-radius:50%;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#fff;font-size:.72rem;font-weight:700;display:flex;align-items:center;justify-content:center;}';

  Object.keys(colorMap).forEach(function(type) {
    css += '.' + type + ' { color: ' + colorMap[type] + '; }';
  });
  return css;
}

// ---- Export modal live preview ----
export function showLivePreview() {
  var iframe = document.getElementById('preview-iframe');
  var doc = iframe.contentDocument || iframe.contentWindow.document;
  var html = generateCompletePreviewHTML(false);
  doc.open(); doc.write(html); doc.close();
  iframe.style.width = '100%';
  document.querySelectorAll('.preview-device-btn').forEach(function(b) { b.classList.remove('active'); });
  var firstBtn = document.querySelector('.preview-device-btn');
  if (firstBtn) firstBtn.classList.add('active');
  document.getElementById('preview-modal').style.display = 'flex';
}

export function switchPreviewDevice(device, el) {
  document.querySelectorAll('.preview-device-btn').forEach(function(b) { b.classList.remove('active'); });
  if (el) el.classList.add('active');
  var isMobile = device === 'mobile';
  var iframe = document.getElementById('preview-iframe');
  iframe.style.width = isMobile ? '375px' : '100%';
  var doc = iframe.contentDocument || iframe.contentWindow.document;
  var html = generateCompletePreviewHTML(isMobile);
  doc.open(); doc.write(html); doc.close();
}

function _buildTemplateEls(key) {
  var template = templates[key];
  if (!template) return null;
  var tempEls = {};
  var counter = 0;
  template.blocks.forEach(function(block) {
    var id = 'el-' + (++counter);
    var def = elDefs[block.type];
    tempEls[id] = {
      id: id, type: block.type, label: def.label,
      x: block.x, y: block.y, w: def.w, h: def.h,
      bg: block.bg || def.bg,
      text: block.text || defaultTexts[block.type] || '',
      zIndex: counter,
      paddingTop: 0, paddingRight: 0, paddingBottom: 0, paddingLeft: 0,
      marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0,
      imageData: null, color: '#1a1a1a'
    };
  });
  return tempEls;
}

export function getTemplatePreviewHTML(key) {
  var tempEls = _buildTemplateEls(key);
  if (!tempEls) return null;
  var savedEls = state.els;
  state.els = tempEls;
  var html = generateCompletePreviewHTML(false);
  state.els = savedEls;
  return html;
}

export function getSitePreviewHTMLFromEls(els) {
  if (!els || Object.keys(els).length === 0) return null;
  var savedEls = state.els;
  state.els = els;
  var html = generateCompletePreviewHTML(false);
  state.els = savedEls;
  return html;
}

export function initTemplateMiniPreviews() {
  document.querySelectorAll('.tpl-mini-frame').forEach(function(iframe) {
    var key = iframe.dataset.tpl;
    var html = getTemplatePreviewHTML(key);
    if (!html) return;
    var container = iframe.parentElement;
    var scale = container.offsetWidth / 900;
    iframe.style.transform = 'scale(' + scale + ')';
    iframe.style.height = Math.ceil(180 / scale) + 'px';
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
  });
}

export function initQuickTemplatePreviews() {
  var row = document.getElementById('quick-tpl-row');
  if (!row) return;
  // Déjà initialisé
  if (row.querySelector('.qtpl-card')) return;

  var picks = [
    { key: 'startup',    name: 'Startup SaaS',     cat: 'Business' },
    { key: 'portfolio',  name: 'Portfolio Créatif', cat: 'Créatif'  },
    { key: 'restaurant', name: 'Restaurant',        cat: 'Local'    }
  ];

  picks.forEach(function(tpl) {
    var card = document.createElement('div');
    card.className = 'qtpl-card';
    card.onclick = function() {
      import('./editor.js').then(function(ed) { ed.loadTemplate(tpl.key); });
    };

    card.innerHTML = '<div class="qtpl-thumb"><iframe class="qtpl-mini-frame"></iframe></div>'
      + '<div class="qtpl-info">'
      + '<div class="qtpl-name">' + tpl.name + '</div>'
      + '<div class="qtpl-cat">' + tpl.cat + '</div>'
      + '</div>';

    row.appendChild(card);

    var iframe = card.querySelector('.qtpl-mini-frame');
    var html = getTemplatePreviewHTML(tpl.key);
    if (!html) return;
    var container = iframe.parentElement;
    var scale = container.offsetWidth / 900;
    iframe.style.transform = 'scale(' + scale + ')';
    iframe.style.height = Math.ceil(120 / scale) + 'px';
    var doc = iframe.contentDocument || iframe.contentWindow.document;
    doc.open(); doc.write(html); doc.close();
  });
}

export function previewTemplate(key) {
  var tempEls = _buildTemplateEls(key);
  if (!tempEls) return;

  var savedEls = state.els;
  state.els = tempEls;
  var html = generateCompletePreviewHTML(false);
  state.els = savedEls;

  var iframe = document.getElementById('preview-iframe');
  iframe.style.width = '100%';
  var doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
  document.querySelectorAll('.preview-device-btn').forEach(function(b) { b.classList.remove('active'); });
  var firstBtn = document.querySelector('.preview-device-btn');
  if (firstBtn) firstBtn.classList.add('active');
  document.getElementById('preview-modal').style.display = 'flex';
}

// ---- Publish ----
export function publishSite() {
  if (!state.currentSite || !state.currentUser) {
    alert('Vous devez être connecté et avoir un site ouvert pour publier.');
    return;
  }

  var pubBtn = document.querySelector('.et-btn.pub');
  if (pubBtn) { pubBtn.textContent = '⏳ Publication...'; pubBtn.disabled = true; }

  var title = getSiteName();
  var slug  = title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  state.supabase.functions.invoke('deploy-to-vercel', {
    body: { htmlContent: generateSemanticHTML(), cssContent: generateCSS(), siteName: slug }
  }).then(function(result) {
    if (result.error) throw new Error(result.error.message || JSON.stringify(result.error));
    if (result.data && result.data.error) throw new Error(result.data.error);

    var liveUrl = result.data.url;
    return state.supabase.from('sites').update({
      name: title, data: { els: state.els, elCounter: state.elCounter, pages: state.pages, currentPageId: state.currentPageId, pageLinks: state.pageLinks },
      status: 'published', published_url: liveUrl, updated_at: new Date().toISOString()
    }).eq('id', state.currentSite.id).then(function(dbResult) {
      if (dbResult.error) console.warn('DB update error:', dbResult.error);
      state.currentSite.published_url = liveUrl;
      showToast('Site publié avec succès !', 'success');
      document.getElementById('pub-url').innerHTML = '<a href="' + liveUrl + '" target="_blank" rel="noopener">' + liveUrl + '</a>';
      var openBtn = document.getElementById('pub-open-btn');
      if (openBtn) openBtn.onclick = function() { window.open(liveUrl, '_blank'); };
      document.getElementById('publish-modal').style.display = 'flex';
      loadUserSites();
    });
  }).catch(function(err) {
    alert('Erreur de publication : ' + (err.message || err));
  }).finally(function() {
    if (pubBtn) { pubBtn.textContent = 'Publier ✦'; pubBtn.disabled = false; }
  });
}

// ---- AI bar ----
export function triggerAI() {
  var input = document.getElementById('ai-input');
  var v = input.value.trim();
  if (!v) return;
  input.value = '';
  input.placeholder = '⏳ Génération en cours...';
  input.disabled = true;
  var types = ['hero', 'text', 'cta', 'image'];
  var type = types[Math.floor(Math.random() * types.length)];
  var yPos = Math.max(50, Object.keys(state.els).length * 60);
  import('./canvas.js').then(function(canvas) {
    setTimeout(function() {
      canvas.addEl(type, 30, yPos);
      input.placeholder = '✓ Bloc ajouté ! Cliquez pour sélectionner et modifier.';
      input.disabled = false;
      setTimeout(function() { input.placeholder = 'Ex: Génère une section à propos pour un restaurant japonais...'; }, 2500);
    }, 1100);
  });
}
