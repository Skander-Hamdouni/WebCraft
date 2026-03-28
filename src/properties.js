/* ============ WEBCRAFT — properties.js ============ */

import { state } from './store.js';
import { saveState, renderEl, updateCanvasHeight, renderLayers } from './canvas.js';

export function updateSwatches(bg) {
  document.querySelectorAll('.sw').forEach(function(s) {
    var c = s.style.backgroundColor || s.style.background;
    s.classList.toggle('active', c === bg);
  });
}

export function updateCodePreview(d) {
  var code = '<div style="position:absolute;\n'
    + '  left:' + Math.round(d.x) + 'px; top:' + Math.round(d.y) + 'px;\n'
    + '  width:' + d.w + 'px;\n'
    + '  background:' + d.bg + '">\n'
    + '  <!-- ' + d.label + ' -->\n'
    + '</div>';
  document.getElementById('pp-code').textContent = code;
}

export function updateElText(v) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  state.els[state.selectedEl].text = v;
  renderEl(state.els[state.selectedEl]);
  updateCodePreview(state.els[state.selectedEl]);
  saveState();
}

function getTextHint(type) {
  var hints = {
    nav: 'Format: Logo|Lien1|Lien2|Lien3|BoutonCTA',
    hero: 'Titre principal du héro',
    heading: 'Titre de la section',
    text: 'Titre du bloc de texte',
    cta: 'Titre du bouton call-to-action',
    footer: 'Nom du logo dans le footer',
    banner: 'Message de la bannière',
    alert: "Message de l'alerte",
    section: 'Format: Colonne1|Colonne2|Colonne3',
    card: 'Titre de la carte',
    stats: 'Format: 99 Clients|500 Projets|10K Users',
    features: 'Format: ⚡ Rapide|🔒 Sécurisé|🎯 Précis',
    testimonial: 'Format: Texte du témoignage|Nom Auteur',
    quote: 'Format: Texte de la citation|Nom Auteur',
    list: 'Format: Titre|Item 1|Item 2|Item 3',
    table: 'Format: Col A|Col B|Col C',
    team: 'Format: Jean · CEO|Marie · Design|Paul · Dev',
    steps: 'Format: Titre · Description|Titre · Description',
    pricing: 'Titre de la section tarification',
    faq: 'Format: Question 1|Question 2|Question 3',
    progress: 'Format: Design 90|Développement 75|Marketing 60',
    newsletter: 'Titre de la newsletter',
    countdown: "Texte au-dessus du compte à rebours",
    map: 'Adresse à afficher',
    social: 'Texte au-dessus des réseaux sociaux',
    logobar: 'Texte au-dessus des logos',
    video: 'Titre sous le bouton play'
  };
  return hints[type] || '';
}

export function updateTextHint(type) {
  var hint = document.getElementById('pp-text-hint');
  if (!hint) return;
  var text = getTextHint(type);
  hint.textContent = text;
  hint.style.display = text ? 'block' : 'none';
}

export function updateElPos(axis, v) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  var el = document.getElementById(state.selectedEl);
  if (axis === 'x') { d.x = parseInt(v) || 0; el.style.left = d.x + 'px'; }
  else              { d.y = parseInt(v) || 0; el.style.top  = d.y + 'px'; }
  updateCodePreview(d);
}

export function updatePosFields(d) {
  if (state.selectedEl !== d.id) return;
  document.getElementById('pp-x').value = Math.round(d.x);
  document.getElementById('pp-y').value = Math.round(d.y);
}

export function setElBg(c, sw) {
  var targets = state.selectedEls.length > 1 ? state.selectedEls : (state.selectedEl ? [state.selectedEl] : []);
  if (targets.length === 0) return;

  targets.forEach(function(id) {
    if (!state.els[id]) return;
    state.els[id].bg = c;
    var domEl = document.getElementById(id);
    if (domEl) {
      var inner = domEl.querySelector('[class*="-inner"]');
      if (inner) inner.style.background = c;
    }
  });

  document.querySelectorAll('.sw').forEach(function(s) { s.classList.remove('active'); });
  if (sw) sw.classList.add('active');
  if (state.selectedEl && state.els[state.selectedEl]) updateCodePreview(state.els[state.selectedEl]);
  saveState();
}

export function setElColor(c) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  state.els[state.selectedEl].color = c;
  saveState();
  updateCodePreview(state.els[state.selectedEl]);
}

// ---- Styles de texte (type Word) ----

export function applyTextStyles(domEl, d) {
  if (!domEl) return;
  var inner = domEl.querySelector('[class*="-inner"]') || domEl;
  inner.style.fontFamily     = d.fontFamily     || '';
  inner.style.fontSize       = d.fontSize       ? d.fontSize + 'px'       : '';
  inner.style.color          = d.textColor      || '';
  inner.style.fontWeight     = d.fontWeight     || '';
  inner.style.fontStyle      = d.fontStyle      || '';
  inner.style.textDecoration = d.textDecoration || '';
  inner.style.textAlign      = d.textAlign      || '';
  inner.style.lineHeight     = d.lineHeight     || '';
  inner.style.letterSpacing  = (d.letterSpacing != null && d.letterSpacing !== '') ? d.letterSpacing + 'px' : '';
  inner.style.textTransform  = d.textTransform  || '';
  inner.style.textShadow     = d.textShadow     || '';
}

export function updateTextStyle(prop, val) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  if (prop === 'fontSize' || prop === 'lineHeight' || prop === 'letterSpacing') {
    d[prop] = val !== '' ? parseFloat(val) : null;
  } else {
    d[prop] = val || null;
  }
  applyTextStyles(document.getElementById(state.selectedEl), d);
  _syncTextUI(d);
  saveState();
}

export function toggleTextStyle(prop, onVal, offVal) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  d[prop] = (d[prop] === onVal) ? offVal : onVal;
  applyTextStyles(document.getElementById(state.selectedEl), d);
  _syncTextUI(d);
  saveState();
}

export function setTextAlign(align) {
  updateTextStyle('textAlign', align);
}

export function populateTextPanel(d) {
  var set = function(id, val) { var el = document.getElementById(id); if (el) el.value = (val != null && val !== null) ? val : ''; };
  set('pp-font-family',    d.fontFamily    || '');
  set('pp-font-size',      d.fontSize      || '');
  set('pp-text-color',     d.textColor     || '#1a1a1a');
  set('pp-line-height',    d.lineHeight    || '');
  set('pp-letter-spacing', d.letterSpacing != null ? d.letterSpacing : '');
  _syncTextUI(d);
  updateTextHint(d.type);
}

function _syncTextUI(d) {
  var tc = document.getElementById('pp-text-color');
  if (tc && d.textColor) tc.value = d.textColor;

  var toggle = function(id, cond) { var b = document.getElementById(id); if (b) b.classList.toggle('active', !!cond); };
  toggle('tbtn-bold',          d.fontWeight === 'bold');
  toggle('tbtn-italic',        d.fontStyle  === 'italic');
  toggle('tbtn-underline',     d.textDecoration === 'underline');
  toggle('tbtn-strike',        d.textDecoration === 'line-through');
  toggle('tbtn-shadow',        !!d.textShadow);

  ['left','center','right','justify'].forEach(function(a) {
    toggle('tbtn-align-' + a, d.textAlign === a);
  });

  var tt = d.textTransform || 'none';
  ['none','uppercase','lowercase','capitalize'].forEach(function(v) {
    toggle('tbtn-tt-' + v, tt === v);
  });
}

export function updatePadding(side, v) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  var el = document.getElementById(state.selectedEl);
  var val = parseInt(v) || 0;
  if (side === 'top')    d.paddingTop    = val;
  if (side === 'right')  d.paddingRight  = val;
  if (side === 'bottom') d.paddingBottom = val;
  if (side === 'left')   d.paddingLeft   = val;
  el.style.padding = (d.paddingTop||0)+'px '+(d.paddingRight||0)+'px '+(d.paddingBottom||0)+'px '+(d.paddingLeft||0)+'px';
  saveState();
  updateCodePreview(d);
}

export function updateMargin(side, v) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  var el = document.getElementById(state.selectedEl);
  var val = parseInt(v) || 0;
  if (side === 'top')    d.marginTop    = val;
  if (side === 'right')  d.marginRight  = val;
  if (side === 'bottom') d.marginBottom = val;
  if (side === 'left')   d.marginLeft   = val;
  el.style.margin = (d.marginTop||0)+'px '+(d.marginRight||0)+'px '+(d.marginBottom||0)+'px '+(d.marginLeft||0)+'px';
  saveState();
  updateCodePreview(d);
}

export function duplicateEl(id) {
  if (!state.els[id]) return;
  var original = state.els[id];
  var newId = 'el-' + (++state.elCounter);
  var newData = JSON.parse(JSON.stringify(original));
  newData.id = newId;
  newData.x = original.x + 20;
  newData.y = original.y + 20;
  newData.zIndex = (Math.max.apply(null, Object.values(state.els).map(function(d) { return d.zIndex || 0; })) || 0) + 1;
  state.els[newId] = newData;
  saveState();
  renderEl(newData);
  renderLayers();
  import('./canvas.js').then(function(canvas) { canvas.selectElById(newId); });
}

export function delEl(id) {
  var el = document.getElementById(id);
  if (el) el.remove();
  delete state.els[id];
  updateCanvasHeight();
  saveState();
  if (state.selectedEl === id) {
    state.selectedEl = null;
    document.getElementById('no-sel-msg').style.display = 'block';
    document.getElementById('props-panel').style.display = 'none';
  }
  renderLayers();
}

// ---- Champs structurés par type de bloc ----

var STRUCTURED_TYPES = ['nav','hero','heading','text','section','footer','banner','alert',
  'card','cta','video','quote','testimonial','list','features','team','steps',
  'stats','progress','faq','gallery','social','logobar','newsletter','countdown','map','table','pricing',
  'feature_item','team_member','stat_item','step_item','faq_item','progress_item','pricing_plan',
  'gallery_item','logo_item','list_item','section_col'];

var _defaultItems = {
  nav: {text:'Nouveau lien'},
  section: {text:'Nouvelle colonne'},
  list: {text:'Nouvel item'},
  features: {icon:'⭐',title:'Nouvelle fonctionnalité',description:'Description courte.'},
  team: {name:'Prénom Nom',role:'Poste'},
  steps: {title:'Nouvelle étape',description:'Description de l\'étape.'},
  stats: {number:'100',label:'Nouveau'},
  progress: {label:'Nouvelle compétence',value:'50'},
  faq: {question:'Nouvelle question ?',answer:'Réponse ici.'},
  gallery: {imageData:null,label:''},
  logobar: {name:'Logo'},
  table: {col1:'',col2:'',col3:''},
  pricing: {name:'Plan',price:'0€',period:'/mois',features:'✓ Feature 1',buttonText:'Commencer',featured:false}
};

function _ea(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function _eh(s) {
  return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

export function initBlockDataFromText(d) {
  if (d.fields !== undefined || d.items !== undefined) return;
  var text = d.text || '';
  var parts;
  switch(d.type) {
    case 'nav':
      parts = text.split('|');
      d.fields = { logo: parts[0]||'MonSite', ctaText: parts.length>1?parts[parts.length-1]:'CTA' };
      d.items = (parts.length>2?parts.slice(1,parts.length-1):['Accueil','Services','Contact']).map(function(l){return{text:l};});
      break;
    case 'hero':
      d.fields = { title: text||'Bienvenue sur mon site', subtitle: 'Décrivez votre activité en quelques mots accrocheurs.', buttonText: 'Découvrir →' };
      break;
    case 'heading':
      d.fields = { title: text||'Titre de section' };
      break;
    case 'text':
      d.fields = { title: text||'Notre histoire', body: 'Ajoutez ici votre contenu, description, horaires ou tout autre texte.' };
      break;
    case 'banner':
      d.fields = { message: text||'🎉 Offre spéciale — 30% de réduction ce mois-ci !', buttonText: 'En profiter →' };
      break;
    case 'alert':
      d.fields = { message: text||'Information importante à communiquer à vos visiteurs.' };
      break;
    case 'footer':
      d.fields = { logo: text||'MonSite', copyright: '© 2025 · Tous droits réservés', links: 'Contact · CGU' };
      break;
    case 'section':
      parts = text.split('|');
      d.items = (parts.length&&parts[0]?parts:['Colonne 1','Colonne 2','Colonne 3']).map(function(t){return{text:t};});
      break;
    case 'card':
      d.fields = { title: text||'Titre', description: 'Description courte' };
      break;
    case 'cta':
      d.fields = { title: text||'Prêt à nous rejoindre ?', buttonText: 'Commencer gratuitement →' };
      break;
    case 'video':
      d.fields = { title: text||'Titre de la vidéo' };
      break;
    case 'quote':
      parts = text.split('|');
      d.fields = { text: parts[0]||'Une citation inspirante va ici.', author: parts[1]||'Auteur' };
      break;
    case 'testimonial':
      parts = text.split('|');
      d.fields = { text: parts[0]||'Super produit !', author: parts[1]||'Jean Dupont' };
      break;
    case 'list':
      parts = text.split('|');
      d.fields = { title: parts[0]||'Points clés' };
      d.items = (parts.length>1?parts.slice(1):['Premier item','Deuxième item','Troisième item']).map(function(t){return{text:t};});
      break;
    case 'features':
      d.items = (text||'⚡ Rapide|🔒 Sécurisé|🎯 Précis|💡 Intuitif').split('|').map(function(item){
        var si=item.search(/\s/);
        return{icon:si>-1?item.slice(0,si):item,title:si>-1?item.slice(si+1).trim():'',description:'Description courte de la fonctionnalité.'};
      });
      break;
    case 'team':
      d.items = (text||'Jean · CEO|Marie · Design|Paul · Dev|Sofia · Marketing').split('|').map(function(item){
        var di=item.indexOf('·');
        return{name:di>-1?item.slice(0,di).trim():item.trim(),role:di>-1?item.slice(di+1).trim():''};
      });
      break;
    case 'steps':
      d.items = (text||'Créer · Créez votre compte|Configurer · Personnalisez|Lancer · Publiez').split('|').map(function(item){
        var di=item.indexOf('·');
        return{title:di>-1?item.slice(0,di).trim():item.trim(),description:di>-1?item.slice(di+1).trim():''};
      });
      break;
    case 'stats':
      d.items = (text||'99 Clients|500 Projets|10K Users').split('|').map(function(item){
        var si=item.indexOf(' ');
        return{number:si>-1?item.slice(0,si).trim():item.trim(),label:si>-1?item.slice(si+1).trim():''};
      });
      break;
    case 'progress':
      d.items = (text||'Design 90|Développement 75|Marketing 60').split('|').map(function(item){
        var si=item.lastIndexOf(' ');
        return{label:si>-1?item.slice(0,si).trim():item.trim(),value:si>-1?item.slice(si+1).trim():'50'};
      });
      break;
    case 'faq':
      d.items = (text||'Comment ça fonctionne ?|Quel est le prix ?|Essai gratuit ?|Support ?').split('|').map(function(q){return{question:q.trim(),answer:''};});
      break;
    case 'gallery':
      d.items = [{imageData:null,label:''},{imageData:null,label:''},{imageData:null,label:''},{imageData:null,label:''},{imageData:null,label:''},{imageData:null,label:''}];
      break;
    case 'social':
      d.fields = { label: text||'Suivez-nous' };
      break;
    case 'logobar':
      d.fields = { label: text||'Ils nous font confiance' };
      d.items = [{name:'Logo A'},{name:'Logo B'},{name:'Logo C'},{name:'Logo D'},{name:'Logo E'}];
      break;
    case 'newsletter':
      d.fields = { title: text||'Restez informé', body: 'Recevez les dernières actualités dans votre boîte mail.' };
      break;
    case 'countdown':
      d.fields = { label: text||"L'offre se termine dans" };
      break;
    case 'map':
      d.fields = { address: text||'12 Rue de la Paix, Paris' };
      break;
    case 'table':
      parts = text.split('|');
      d.fields = { col1: parts[0]||'Col A', col2: parts[1]||'Col B', col3: parts[2]||'Col C' };
      d.items = [
        {col1:'Ligne 1 A',col2:'Ligne 1 B',col3:'Ligne 1 C'},
        {col1:'Ligne 2 A',col2:'Ligne 2 B',col3:'Ligne 2 C'},
        {col1:'Ligne 3 A',col2:'Ligne 3 B',col3:'Ligne 3 C'}
      ];
      break;
    case 'pricing':
      d.fields = { sectionTitle: text||'Tarification' };
      d.items = [
        {name:'Gratuit',price:'0€',period:'/mois',features:'✓ Fonctionnalité 1\n✓ Fonctionnalité 2',buttonText:'Commencer',featured:false},
        {name:'Pro',price:'29€',period:'/mois',features:'✓ Tout le Gratuit\n✓ Fonctionnalité 3\n✓ Fonctionnalité 4',buttonText:'Essayer',featured:true},
        {name:'Business',price:'99€',period:'/mois',features:'✓ Tout le Pro\n✓ Support dédié',buttonText:'Contacter',featured:false}
      ];
      break;
    case 'feature_item':
      if (!d.fields) d.fields = { icon: '⭐', title: 'Titre', description: 'Description.' };
      break;
    case 'team_member':
      if (!d.fields) d.fields = { name: 'Prénom Nom', role: 'Poste' };
      break;
    case 'stat_item':
      if (!d.fields) d.fields = { number: '99', label: 'Clients' };
      break;
    case 'step_item':
      if (!d.fields) d.fields = { num: '1', title: 'Étape', description: 'Description.' };
      break;
    case 'faq_item':
      if (!d.fields) d.fields = { question: 'Question ?', answer: 'Réponse.' };
      break;
    case 'progress_item':
      if (!d.fields) d.fields = { label: 'Compétence', value: '75' };
      break;
    case 'pricing_plan':
      if (!d.fields) d.fields = { name: 'Plan', price: '0€', period: '/mois', features: '✓ Feature 1\n✓ Feature 2', buttonText: 'Commencer', featured: false };
      break;
    case 'gallery_item':
      break;
    case 'logo_item':
      if (!d.fields) d.fields = { name: 'Logo' };
      break;
    case 'list_item':
      if (!d.fields) d.fields = { text: d.text || 'Item de liste' };
      break;
    case 'section_col':
      if (!d.fields) d.fields = { text: d.text || 'Contenu de la colonne' };
      break;
  }
}

function _fieldInput(label, key, val) {
  return '<div class="bf-row">'
    +'<label class="bf-label">'+label+'</label>'
    +'<input type="text" class="bf-input" value="'+_ea(val)+'" '
    +'oninput="window.__wc.updateBlockField(\''+key+'\',this.value)">'
    +'</div>';
}

function _fieldTextarea(label, key, val) {
  return '<div class="bf-row">'
    +'<label class="bf-label">'+label+'</label>'
    +'<textarea class="bf-textarea" rows="3" '
    +'oninput="window.__wc.updateBlockField(\''+key+'\',this.value)">'+_eh(val)+'</textarea>'
    +'</div>';
}

function _fieldItemsList(items, fields, addLabel, minItems) {
  var min = minItems !== undefined ? minItems : 1;
  var html = '<div class="bf-items-list">';
  items.forEach(function(item, i) {
    html += '<div class="bf-item">';
    html += '<div class="bf-item-header">'
      +'<span class="bf-item-num">#'+(i+1)+'</span>'
      +'<div class="bf-item-actions">'
      +(i > 0 ? '<button class="bf-item-move" onclick="window.__wc.moveBlockItemUp('+i+')" title="Monter">↑</button>' : '<button class="bf-item-move" disabled>↑</button>')
      +(i < items.length-1 ? '<button class="bf-item-move" onclick="window.__wc.moveBlockItemDown('+i+')" title="Descendre">↓</button>' : '<button class="bf-item-move" disabled>↓</button>')
      +(items.length > min ? '<button class="bf-item-del" onclick="window.__wc.removeBlockItem('+i+')" title="Supprimer">✕</button>' : '')
      +'</div>'
      +'</div>';
    fields.forEach(function(f) {
      var val = item[f.key] !== undefined ? String(item[f.key]) : '';
      if (f.type === 'textarea') {
        html += '<div class="bf-row">'
          +'<label class="bf-label">'+f.label+'</label>'
          +'<textarea class="bf-textarea" rows="2" '
          +'oninput="window.__wc.updateBlockItem('+i+',\''+f.key+'\',this.value)">'+_eh(val)+'</textarea>'
          +'</div>';
      } else {
        html += '<div class="bf-row">'
          +'<label class="bf-label">'+f.label+'</label>'
          +'<input type="text" class="bf-input" value="'+_ea(val)+'" '
          +'oninput="window.__wc.updateBlockItem('+i+',\''+f.key+'\',this.value)">'
          +'</div>';
      }
    });
    html += '</div>';
  });
  html += '</div>';
  html += '<button class="bf-add-btn" onclick="window.__wc.addBlockItem()">+ '+addLabel+'</button>';
  return html;
}

function _fieldGalleryItems(items, elId) {
  var html = '<div class="bf-gallery-grid">';
  items.forEach(function(item, i) {
    var thumb = item.imageData
      ? '<img src="'+item.imageData+'" style="width:100%;height:100%;object-fit:cover;" alt="">'
      : '<span style="font-size:1.4rem;color:#aaa;">🖼</span>';
    html += '<div class="bf-gallery-item">'
      +'<div class="bf-gallery-thumb" id="gthumb-'+i+'" style="cursor:pointer;">'
      +thumb+'</div>'
      +'<input type="file" id="gupload-'+elId+'-'+i+'" accept="image/*" style="display:none;" onchange="window.__wc.handleGalleryItemUpload(this,\''+elId+'\','+i+')">'
      +'<button class="bf-item-del bf-gallery-del" onclick="window.__wc.removeBlockItem('+i+')">✕</button>'
      +'</div>';
  });
  html += '</div>';
  html += '<button class="bf-add-btn" onclick="window.__wc.addBlockItem()">+ Ajouter une image</button>';
  return html;
}

export function renderBlockFields(d) {
  var container = document.getElementById('pp-block-fields');
  if (!container) return;

  var textRow = document.querySelector('.pp-text-row');
  var isStructured = STRUCTURED_TYPES.indexOf(d.type) !== -1;
  if (textRow) textRow.style.display = isStructured ? 'none' : '';

  if (!isStructured) { container.innerHTML = ''; return; }

  initBlockDataFromText(d);
  var f = d.fields || {};
  var items = d.items || [];
  var id = d.id;
  var html = '';

  switch(d.type) {
    case 'nav':
      html += _fieldInput('Logo / Nom du site','logo',f.logo||'');
      html += _fieldInput('Bouton CTA','ctaText',f.ctaText||'');
      html += '<div class="bf-section-label">Liens de navigation</div>';
      html += _fieldItemsList(items,[{key:'text',label:'Lien',type:'input'}],'Ajouter un lien',1);
      break;
    case 'hero':
      html += _fieldInput('Titre','title',f.title||'');
      html += _fieldInput('Sous-titre','subtitle',f.subtitle||'');
      html += _fieldInput('Texte du bouton','buttonText',f.buttonText||'');
      break;
    case 'heading':
      html += _fieldInput('Titre','title',f.title||'');
      break;
    case 'text':
      html += _fieldInput('Titre','title',f.title||'');
      html += _fieldTextarea('Contenu','body',f.body||'');
      break;
    case 'section':
      html += '<div class="bf-section-label">Colonnes</div>';
      html += _fieldItemsList(items,[{key:'text',label:'Contenu',type:'textarea'}],'Ajouter une colonne',1);
      break;
    case 'footer':
      html += _fieldInput('Logo','logo',f.logo||'');
      html += _fieldInput('Copyright','copyright',f.copyright||'');
      html += _fieldInput('Liens footer','links',f.links||'');
      break;
    case 'banner':
      html += _fieldInput('Message','message',f.message||'');
      html += _fieldInput('Texte du bouton','buttonText',f.buttonText||'');
      break;
    case 'alert':
      html += _fieldInput('Message','message',f.message||'');
      break;
    case 'card':
      html += _fieldInput('Titre','title',f.title||'');
      html += _fieldTextarea('Description','description',f.description||'');
      break;
    case 'cta':
      html += _fieldInput('Titre','title',f.title||'');
      html += _fieldInput('Texte du bouton','buttonText',f.buttonText||'');
      break;
    case 'video':
      html += _fieldInput('Titre','title',f.title||'');
      break;
    case 'quote':
      html += _fieldTextarea('Citation','text',f.text||'');
      html += _fieldInput('Auteur','author',f.author||'');
      break;
    case 'testimonial':
      html += _fieldTextarea('Témoignage','text',f.text||'');
      html += _fieldInput('Auteur','author',f.author||'');
      break;
    case 'list':
      html += _fieldInput('Titre de la liste','title',f.title||'');
      html += '<div class="bf-section-label">Items</div>';
      html += _fieldItemsList(items,[{key:'text',label:'Item',type:'input'}],'Ajouter un item',1);
      break;
    case 'features':
      html += _fieldItemsList(items,[
        {key:'icon',label:'Icône (emoji)',type:'input'},
        {key:'title',label:'Titre',type:'input'},
        {key:'description',label:'Description',type:'input'}
      ],'Ajouter une fonctionnalité',1);
      break;
    case 'team':
      html += _fieldItemsList(items,[
        {key:'name',label:'Nom',type:'input'},
        {key:'role',label:'Rôle / Poste',type:'input'}
      ],'Ajouter un membre',1);
      break;
    case 'steps':
      html += _fieldItemsList(items,[
        {key:'title',label:'Titre de l\'étape',type:'input'},
        {key:'description',label:'Description',type:'input'}
      ],'Ajouter une étape',1);
      break;
    case 'stats':
      html += _fieldItemsList(items,[
        {key:'number',label:'Chiffre / Valeur',type:'input'},
        {key:'label',label:'Libellé',type:'input'}
      ],'Ajouter une stat',1);
      break;
    case 'progress':
      html += _fieldItemsList(items,[
        {key:'label',label:'Libellé',type:'input'},
        {key:'value',label:'Pourcentage (0-100)',type:'input'}
      ],'Ajouter une barre',1);
      break;
    case 'faq':
      html += _fieldItemsList(items,[
        {key:'question',label:'Question',type:'input'},
        {key:'answer',label:'Réponse',type:'textarea'}
      ],'Ajouter une question',1);
      break;
    case 'gallery':
      html += _fieldGalleryItems(items, id);
      break;
    case 'social':
      html += _fieldInput('Label','label',f.label||'');
      break;
    case 'logobar':
      html += _fieldInput('Label','label',f.label||'');
      html += '<div class="bf-section-label">Logos</div>';
      html += _fieldItemsList(items,[{key:'name',label:'Nom du logo',type:'input'}],'Ajouter un logo',1);
      break;
    case 'newsletter':
      html += _fieldInput('Titre','title',f.title||'');
      html += _fieldTextarea('Description','body',f.body||'');
      break;
    case 'countdown':
      html += _fieldInput('Label','label',f.label||'');
      break;
    case 'map':
      html += _fieldInput('Adresse','address',f.address||'');
      break;
    case 'table':
      html += '<div class="bf-section-label">En-têtes</div>';
      html += _fieldInput('Colonne 1','col1',f.col1||'');
      html += _fieldInput('Colonne 2','col2',f.col2||'');
      html += _fieldInput('Colonne 3','col3',f.col3||'');
      html += '<div class="bf-section-label">Lignes</div>';
      html += _fieldItemsList(items,[
        {key:'col1',label:'Col 1',type:'input'},
        {key:'col2',label:'Col 2',type:'input'},
        {key:'col3',label:'Col 3',type:'input'}
      ],'Ajouter une ligne',1);
      break;
    case 'pricing':
      html += _fieldInput('Titre de section','sectionTitle',f.sectionTitle||'');
      html += '<div class="bf-section-label">Plans tarifaires</div>';
      html += _fieldItemsList(items,[
        {key:'name',label:'Nom du plan',type:'input'},
        {key:'price',label:'Prix',type:'input'},
        {key:'period',label:'Période (ex: /mois)',type:'input'},
        {key:'features',label:'Fonctionnalités (une par ligne)',type:'textarea'},
        {key:'buttonText',label:'Texte du bouton',type:'input'}
      ],'Ajouter un plan',1);
      break;
    case 'feature_item':
      html += _fieldInput('Icône (emoji)','icon',f.icon||'');
      html += _fieldInput('Titre','title',f.title||'');
      html += _fieldInput('Description','description',f.description||'');
      break;
    case 'team_member':
      html += _fieldInput('Nom','name',f.name||'');
      html += _fieldInput('Rôle / Poste','role',f.role||'');
      break;
    case 'stat_item':
      html += _fieldInput('Chiffre / Valeur','number',f.number||'');
      html += _fieldInput('Libellé','label',f.label||'');
      break;
    case 'step_item':
      html += _fieldInput('Numéro','num',f.num||'');
      html += _fieldInput('Titre','title',f.title||'');
      html += _fieldInput('Description','description',f.description||'');
      break;
    case 'faq_item':
      html += _fieldInput('Question','question',f.question||'');
      html += _fieldTextarea('Réponse','answer',f.answer||'');
      break;
    case 'progress_item':
      html += _fieldInput('Libellé','label',f.label||'');
      html += _fieldInput('Pourcentage (0-100)','value',f.value||'');
      break;
    case 'pricing_plan':
      html += _fieldInput('Nom du plan','name',f.name||'');
      html += _fieldInput('Prix','price',f.price||'');
      html += _fieldInput('Période','period',f.period||'');
      html += _fieldTextarea('Fonctionnalités (une par ligne)','features',f.features||'');
      html += _fieldInput('Texte du bouton','buttonText',f.buttonText||'');
      break;
    case 'logo_item':
      html += _fieldInput('Nom du logo','name',f.name||'');
      break;
    case 'list_item':
      html += _fieldInput('Texte de l\'item','text',f.text||'');
      break;
    case 'section_col':
      html += _fieldTextarea('Contenu de la colonne','text',f.text||'');
      break;
    case 'gallery_item':
      html += '<div class="bf-row"><label class="bf-label">Image</label><button class="bf-add-btn" style="width:auto;padding:.3rem .8rem;" onclick="document.getElementById(\'image-upload-\'+window.__wc._getSelectedId()).click()">📷 Changer l\'image</button></div>';
      break;
  }

  container.innerHTML = html;

  // Attach gallery upload button listeners
  if (d.type === 'gallery') {
    items.forEach(function(item, i) {
      var thumb = document.getElementById('gthumb-'+i);
      var input = document.getElementById('gupload-'+id+'-'+i);
      if (thumb && input) {
        thumb.onclick = function() { input.click(); };
      }
    });
  }
}

export function updateBlockField(fieldName, value) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  if (!d.fields) d.fields = {};
  d.fields[fieldName] = value;
  renderEl(d);
  saveState();
}

export function updateBlockItem(itemIndex, itemField, value) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  if (!d.items || d.items[itemIndex] === undefined) return;
  d.items[itemIndex][itemField] = value;
  renderEl(d);
  saveState();
}

export function addBlockItem() {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  if (!d.items) d.items = [];
  var def = _defaultItems[d.type];
  if (!def) return;
  d.items.push(JSON.parse(JSON.stringify(def)));
  renderEl(d);
  saveState();
  renderBlockFields(d);
}

export function removeBlockItem(itemIndex) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  if (!d.items || d.items.length <= 1) return;
  d.items.splice(itemIndex, 1);
  renderEl(d);
  saveState();
  renderBlockFields(d);
}

// (helper used in gallery_item fields)
export function _getSelectedId() { return state.selectedEl || ''; }

export function moveBlockItemUp(idx) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  if (!d.items || idx <= 0) return;
  var tmp = d.items[idx]; d.items[idx] = d.items[idx-1]; d.items[idx-1] = tmp;
  renderEl(d); saveState(); renderBlockFields(d);
}

export function moveBlockItemDown(idx) {
  if (!state.selectedEl || !state.els[state.selectedEl]) return;
  var d = state.els[state.selectedEl];
  if (!d.items || idx >= d.items.length-1) return;
  var tmp = d.items[idx]; d.items[idx] = d.items[idx+1]; d.items[idx+1] = tmp;
  renderEl(d); saveState(); renderBlockFields(d);
}

export function handleGalleryItemUpload(input, elId, itemIndex) {
  if (!input.files || !input.files[0]) return;
  var reader = new FileReader();
  reader.onload = function(e) {
    var d = state.els[elId];
    if (d && d.items && d.items[itemIndex] !== undefined) {
      d.items[itemIndex].imageData = e.target.result;
      saveState();
      renderEl(d);
      if (state.selectedEl === elId) renderBlockFields(d);
    }
  };
  reader.readAsDataURL(input.files[0]);
}
