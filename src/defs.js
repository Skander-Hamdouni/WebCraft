/* ============ WEBCRAFT — defs.js — config statique ============ */

function _f(d, key, fallback) {
  return (d.fields && d.fields[key] !== undefined && d.fields[key] !== null) ? d.fields[key] : fallback;
}

export var elDefs = {

  /* ── STRUCTURE ─────────────────────────────────────────────── */
  nav: {
    label: 'Navigation',
    w: 900, h: 46, x: 0, y: 0, fullWidth: true,
    bg: '#1a1a1a',
    html: function(d) {
      var logo, links, cta;
      if (d.fields) {
        logo = d.fields.logo || 'MonSite';
        cta = d.fields.ctaText || 'CTA';
        links = d.items ? d.items.map(function(i){return i.text||'';}) : ['Accueil','Services','Contact'];
      } else {
        var parts = (d.text || 'MonSite|Accueil|Services|Contact|CTA').split('|');
        logo = parts[0]||'MonSite';
        cta = parts.length>1?parts[parts.length-1]:'CTA';
        links = parts.length>2?parts.slice(1,parts.length-1):['Accueil','Services','Contact'];
      }
      return '<div class="el-nav-inner">'
        +'<span class="en-logo">'+logo+'</span>'
        +'<div class="en-links">'+links.map(function(l){return'<span>'+l+'</span>';}).join('')+'</div>'
        +'<button class="en-btn">'+cta+'</button>'
        +'</div>';
    }
  },
  hero: {
    label: 'Héro',
    w: 900, h: 140, x: 0, y: 50, fullWidth: true,
    bg: '#E1F5EE',
    html: function(d) {
      var title = _f(d,'title', d.text||'Bienvenue sur mon site');
      var subtitle = _f(d,'subtitle','Décrivez votre activité en quelques mots accrocheurs.');
      var btn = _f(d,'buttonText','Découvrir →');
      return '<div class="el-hero-inner">'
        +'<h2>'+title+'</h2>'
        +'<p>'+subtitle+'</p>'
        +'<button>'+btn+'</button>'
        +'</div>';
    }
  },
  heading: {
    label: 'Titre',
    w: 900, h: 60, x: 0, y: 300, fullWidth: true,
    bg: '#EEEDFE',
    html: function(d) {
      var title = _f(d,'title', d.text||'Titre de section');
      return '<div class="el-heading-inner"><h2>'+title+'</h2></div>';
    }
  },

  section: {
    label: 'Section 3 col.',
    w: 900, h: 200, x: 0, y: 300, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var cols;
      if (d.items && d.items.length) {
        cols = d.items.map(function(i){return i.text||'';});
      } else {
        cols = (d.text||'Colonne 1|Colonne 2|Colonne 3').split('|');
      }
      return '<div class="el-section-inner">'
        +cols.map(function(c){return'<div class="section-col">'+c+'</div>';}).join('')
        +'</div>';
    }
  },
  footer: {
    label: 'Footer',
    w: 900, h: 44, x: 0, y: 460, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var logo = _f(d,'logo', d.text||'MonSite');
      var copyright = _f(d,'copyright','© 2025 · Tous droits réservés');
      var links = _f(d,'links','Contact · CGU');
      return '<div class="el-footer-inner">'
        +'<span class="f-logo">'+logo+'</span>'
        +'<span>'+copyright+'</span>'
        +'<span>'+links+'</span>'
        +'</div>';
    }
  },
  banner: {
    label: 'Bannière',
    w: 900, h: 46, x: 0, y: 0, fullWidth: true,
    bg: '#7F77DD',
    html: function(d) {
      var msg = _f(d,'message', d.text||'🎉 Offre spéciale — 30% de réduction ce mois-ci !');
      var btn = _f(d,'buttonText','En profiter →');
      return '<div class="el-banner-inner">'
        +'<span>'+msg+'</span>'
        +'<button>'+btn+'</button>'
        +'</div>';
    }
  },
  alert: {
    label: 'Alerte',
    w: 900, h: 56, x: 0, y: 300, fullWidth: true,
    bg: '#FEF3C7',
    html: function(d) {
      var msg = _f(d,'message', d.text||'Information importante à communiquer à vos visiteurs.');
      return '<div class="el-alert-inner">'
        +'<span class="alert-icon">⚠️</span>'
        +'<span>'+msg+'</span>'
        +'</div>';
    }
  },
  divider: {
    label: 'Séparateur',
    w: 900, h: 28, x: 0, y: 300, fullWidth: true,
    bg: 'transparent',
    html: function(d) {
      return '<div class="el-divider-inner"><hr></div>';
    }
  },
  spacer: {
    label: 'Espace vide',
    w: 900, h: 60, x: 0, y: 300, fullWidth: true,
    bg: 'transparent',
    html: function(d) {
      return '<div class="el-spacer-inner"></div>';
    }
  },

  /* ── CONTENU ────────────────────────────────────────────────── */
  text: {
    label: 'Texte',
    w: 400, h: 90, x: 30, y: 210,
    bg: '#EEEDFE',
    html: function(d) {
      var title = _f(d,'title', d.text||'Notre histoire');
      var body = _f(d,'body','Ajoutez ici votre contenu, description, horaires ou tout autre texte.');
      return '<div class="el-txt-inner">'
        +'<h3>'+title+'</h3>'
        +'<p>'+body+'</p>'
        +'</div>';
    }
  },
  image: {
    label: 'Image',
    w: 220, h: 120, x: 450, y: 210,
    bg: '#FAECE7',
    html: function(d) {
      return '<div class="el-img-inner">'
        + '<span class="img-icon">🖼</span>'
        + '<span>Cliquez pour changer</span>'
        + '</div>';
    }
  },
  gallery: {
    label: 'Galerie',
    w: 900, h: 200, x: 0, y: 300, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var items = d.items && d.items.length ? d.items : [{},{},{},{},{},{}];
      return '<div class="el-gallery-inner">'
        +items.map(function(item){
          if (item.imageData) {
            return '<div class="gallery-item" style="background-image:url('+item.imageData+');background-size:cover;background-position:center;"></div>';
          }
          return '<div class="gallery-item"></div>';
        }).join('')
        +'</div>';
    }
  },
  video: {
    label: 'Vidéo',
    w: 900, h: 190, x: 0, y: 300, fullWidth: true,
    bg: '#1a1a1a',
    html: function(d) {
      var title = _f(d,'title', d.text||'Titre de la vidéo');
      return '<div class="el-video-inner">'
        +'<div class="video-play-btn">▶</div>'
        +'<p>'+title+'</p>'
        +'</div>';
    }
  },
  quote: {
    label: 'Citation',
    w: 600, h: 120, x: 150, y: 300,
    bg: '#EEEDFE',
    html: function(d) {
      var parts = (d.text||'Une citation inspirante va ici.|Auteur').split('|');
      var quoteText = _f(d,'text', parts[0]||'Une citation inspirante va ici.');
      var author = _f(d,'author', parts[1]||'Auteur');
      return '<div class="el-quote-inner">'
        +'<div class="quote-mark">"</div>'
        +'<p class="quote-text">'+quoteText+'</p>'
        +'<p class="quote-source">— '+author+'</p>'
        +'</div>';
    }
  },
  list: {
    label: 'Liste',
    w: 400, h: 140, x: 30, y: 300,
    bg: '#f5f5f4',
    html: function(d) {
      var parts = (d.text||'Points clés|Premier item|Deuxième item|Troisième item').split('|');
      var title = _f(d,'title', parts[0]||'Points clés');
      var items = d.items && d.items.length ? d.items.map(function(i){return i.text||'';}) : (parts.length>1?parts.slice(1):['Premier point important','Deuxième point','Troisième point']);
      return '<div class="el-list-inner">'
        +'<h4>'+title+'</h4>'
        +'<ul>'+items.map(function(item){return'<li>'+item+'</li>';}).join('')+'</ul>'
        +'</div>';
    }
  },
  table: {
    label: 'Tableau',
    w: 900, h: 180, x: 0, y: 300, fullWidth: true,
    bg: '#ffffff',
    html: function(d) {
      var parts = (d.text||'Col A|Col B|Col C').split('|');
      var col1 = _f(d,'col1', parts[0]||'Col A');
      var col2 = _f(d,'col2', parts[1]||'Col B');
      var col3 = _f(d,'col3', parts[2]||'Col C');
      var rows = d.items && d.items.length ? d.items : [
        {col1:'Ligne 1 A',col2:'Ligne 1 B',col3:'Ligne 1 C'},
        {col1:'Ligne 2 A',col2:'Ligne 2 B',col3:'Ligne 2 C'},
        {col1:'Ligne 3 A',col2:'Ligne 3 B',col3:'Ligne 3 C'}
      ];
      return '<div class="el-table-inner"><table>'
        +'<thead><tr><th>'+col1+'</th><th>'+col2+'</th><th>'+col3+'</th></tr></thead>'
        +'<tbody>'+rows.map(function(r){return'<tr><td>'+(r.col1||'')+'</td><td>'+(r.col2||'')+'</td><td>'+(r.col3||'')+'</td></tr>';}).join('')+'</tbody>'
        +'</table></div>';
    }
  },

  /* ── CARTES & GRILLES ───────────────────────────────────────── */
  card: {
    label: 'Carte',
    w: 200, h: 150, x: 0, y: 300,
    bg: '#EEEDFE',
    html: function(d) {
      var title = _f(d,'title', d.text||'Titre');
      var desc = _f(d,'description','Description courte');
      return '<div class="el-card-inner">'
        +'<h4>'+title+'</h4>'
        +'<p>'+desc+'</p>'
        +'</div>';
    }
  },
  features: {
    label: 'Fonctionnalités',
    w: 900, h: 160, x: 0, y: 300, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var items;
      if (d.items && d.items.length) {
        items = d.items.map(function(item){
          return '<div class="feature-item"><div class="feature-icon">'+(item.icon||'⭐')+'</div><h4>'+(item.title||'')+'</h4><p>'+(item.description||'Description.')+'</p></div>';
        });
      } else {
        var raw = (d.text||'⚡ Rapide|🔒 Sécurisé|🎯 Précis|💡 Intuitif').split('|');
        items = raw.map(function(item){
          var spaceIdx=item.search(/\s/);
          var icon=spaceIdx>-1?item.slice(0,spaceIdx):item;
          var name=spaceIdx>-1?item.slice(spaceIdx+1).trim():'';
          return '<div class="feature-item"><div class="feature-icon">'+icon+'</div><h4>'+name+'</h4><p>Description courte de la fonctionnalité.</p></div>';
        });
      }
      return '<div class="el-features-inner">'+items.join('')+'</div>';
    }
  },
  pricing: {
    label: 'Tarification',
    w: 900, h: 230, x: 0, y: 300, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var sectionTitle = _f(d,'sectionTitle', d.text||'Tarification');
      var plans = d.items && d.items.length ? d.items : null;
      var plansHtml;
      if (plans) {
        plansHtml = plans.map(function(p){
          var featuresList = (p.features||'').split('\n').filter(function(f){return f.trim();}).map(function(f){return'<li>'+f.trim()+'</li>';}).join('');
          return '<div class="pricing-card'+(p.featured?' pricing-featured':'')+'">'
            +(p.featured?'<div class="pricing-badge">Populaire</div>':'')
            +'<div class="pricing-name">'+(p.name||'Plan')+'</div>'
            +'<div class="pricing-price">'+(p.price||'0€')+'<span>'+(p.period||'/mois')+'</span></div>'
            +'<ul>'+featuresList+'</ul>'
            +'<button>'+(p.buttonText||'Commencer')+'</button>'
            +'</div>';
        }).join('');
      } else {
        plansHtml = '<div class="pricing-card"><div class="pricing-name">Gratuit</div><div class="pricing-price">0€<span>/mois</span></div><ul><li>✓ Fonctionnalité 1</li><li>✓ Fonctionnalité 2</li></ul><button>Commencer</button></div>'
          +'<div class="pricing-card pricing-featured"><div class="pricing-badge">Populaire</div><div class="pricing-name">Pro</div><div class="pricing-price">29€<span>/mois</span></div><ul><li>✓ Tout le Gratuit</li><li>✓ Fonctionnalité 3</li><li>✓ Fonctionnalité 4</li></ul><button>Essayer</button></div>'
          +'<div class="pricing-card"><div class="pricing-name">Business</div><div class="pricing-price">99€<span>/mois</span></div><ul><li>✓ Tout le Pro</li><li>✓ Support dédié</li></ul><button>Contacter</button></div>';
      }
      return '<div class="el-pricing-inner"><h3 class="pricing-section-title">'+sectionTitle+'</h3>'+plansHtml+'</div>';
    }
  },
  team: {
    label: 'Équipe',
    w: 900, h: 180, x: 0, y: 300, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var cards;
      if (d.items && d.items.length) {
        cards = d.items.map(function(item){
          return '<div class="team-card"><div class="team-avatar"></div><h4>'+(item.name||'')+'</h4><p>'+(item.role||'')+'</p></div>';
        });
      } else {
        var raw = (d.text||'Jean · CEO|Marie · Design|Paul · Dev|Sofia · Marketing').split('|');
        cards = raw.map(function(item){
          var dotIdx=item.indexOf('·');
          var name=dotIdx>-1?item.slice(0,dotIdx).trim():item.trim();
          var role=dotIdx>-1?item.slice(dotIdx+1).trim():'';
          return '<div class="team-card"><div class="team-avatar"></div><h4>'+name+'</h4><p>'+role+'</p></div>';
        });
      }
      return '<div class="el-team-inner">'+cards.join('')+'</div>';
    }
  },
  steps: {
    label: 'Étapes',
    w: 900, h: 140, x: 0, y: 300, fullWidth: true,
    bg: '#EEEDFE',
    html: function(d) {
      var stepItems;
      if (d.items && d.items.length) {
        stepItems = d.items.map(function(item,i){
          return '<div class="step-item"><div class="step-num">'+(i+1)+'</div><h4>'+(item.title||'')+'</h4><p>'+(item.description||'')+'</p></div>';
        });
      } else {
        var raw = (d.text||'Créer · Créez votre compte|Configurer · Personnalisez|Lancer · Publiez').split('|');
        stepItems = raw.map(function(item,i){
          var dotIdx=item.indexOf('·');
          var title=dotIdx>-1?item.slice(0,dotIdx).trim():item.trim();
          var desc=dotIdx>-1?item.slice(dotIdx+1).trim():'';
          return '<div class="step-item"><div class="step-num">'+(i+1)+'</div><h4>'+title+'</h4><p>'+desc+'</p></div>';
        });
      }
      var parts=[];
      stepItems.forEach(function(s,i){
        parts.push(s);
        if(i<stepItems.length-1) parts.push('<div class="step-arrow">→</div>');
      });
      return '<div class="el-steps-inner">'+parts.join('')+'</div>';
    }
  },
  logobar: {
    label: 'Logos partenaires',
    w: 900, h: 80, x: 0, y: 300, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var label = _f(d,'label', d.text||'Ils nous font confiance');
      var logos = d.items && d.items.length ? d.items : [{name:'Logo A'},{name:'Logo B'},{name:'Logo C'},{name:'Logo D'},{name:'Logo E'}];
      return '<div class="el-logobar-inner">'
        +'<p class="logobar-label">'+label+'</p>'
        +'<div class="logobar-logos">'+logos.map(function(l){return'<div class="logo-item">'+(l.name||'Logo')+'</div>';}).join('')+'</div>'
        +'</div>';
    }
  },

  /* ── SOCIAL & PREUVE ────────────────────────────────────────── */
  testimonial: {
    label: 'Témoignage',
    w: 400, h: 120, x: 0, y: 300,
    bg: '#FAECE7',
    html: function(d) {
      var parts = (d.text||'Super produit !|Jean Dupont').split('|');
      var text = _f(d,'text', parts[0]||'Super produit !');
      var author = _f(d,'author', parts[1]||'Jean Dupont');
      return '<div class="el-testimonial-inner">'
        +'<p class="testimonial-text">"'+text+'"</p>'
        +'<p class="testimonial-author">- '+author+'</p>'
        +'</div>';
    }
  },
  stats: {
    label: 'Statistiques',
    w: 900, h: 100, x: 0, y: 300, fullWidth: true,
    bg: '#E1F5EE',
    html: function(d) {
      var boxes;
      if (d.items && d.items.length) {
        boxes = d.items.map(function(item){
          return '<div class="stat-box"><div class="stat-number">'+(item.number||'0')+'</div><p>'+(item.label||'')+'</p></div>';
        });
      } else {
        var raw = (d.text||'99 Clients|500 Projets|10K Users').split('|');
        boxes = raw.map(function(item){
          var spaceIdx=item.indexOf(' ');
          var num=spaceIdx>-1?item.slice(0,spaceIdx).trim():item.trim();
          var label=spaceIdx>-1?item.slice(spaceIdx+1).trim():'';
          return '<div class="stat-box"><div class="stat-number">'+num+'</div><p>'+label+'</p></div>';
        });
      }
      return '<div class="el-stats-inner">'+boxes.join('')+'</div>';
    }
  },
  progress: {
    label: 'Progression',
    w: 900, h: 140, x: 0, y: 300, fullWidth: true,
    bg: '#EEEDFE',
    html: function(d) {
      var items;
      if (d.items && d.items.length) {
        items = d.items.map(function(item){
          var pct = item.value||'50';
          return '<div class="progress-item"><span class="progress-label">'+(item.label||'')+'</span><div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div><span class="progress-pct">'+pct+'%</span></div>';
        });
      } else {
        var raw = (d.text||'Design 90|Développement 75|Marketing 60').split('|');
        items = raw.map(function(item){
          var spaceIdx=item.lastIndexOf(' ');
          var label=spaceIdx>-1?item.slice(0,spaceIdx).trim():item.trim();
          var pct=spaceIdx>-1?item.slice(spaceIdx+1).trim():'50';
          return '<div class="progress-item"><span class="progress-label">'+label+'</span><div class="progress-bar"><div class="progress-fill" style="width:'+pct+'%"></div></div><span class="progress-pct">'+pct+'%</span></div>';
        });
      }
      return '<div class="el-progress-inner">'+items.join('')+'</div>';
    }
  },
  faq: {
    label: 'FAQ',
    w: 900, h: 190, x: 0, y: 300, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var items;
      if (d.items && d.items.length) {
        items = d.items.map(function(item){
          return '<div class="faq-item"><div class="faq-q"><span>'+(item.question||'')+'</span><span class="faq-plus">+</span></div><div class="faq-answer" style="display:none;padding:.5rem .75rem;font-size:.8rem;color:#555;">'+(item.answer||'')+'</div></div>';
        });
      } else {
        var raw = (d.text||'Comment ça fonctionne ?|Quel est le prix ?|Essai gratuit ?|Support ?').split('|');
        items = raw.map(function(q){
          return '<div class="faq-item"><div class="faq-q"><span>'+q.trim()+'</span><span class="faq-plus">+</span></div><div class="faq-answer" style="display:none;padding:.5rem .75rem;font-size:.8rem;color:#555;"></div></div>';
        });
      }
      return '<div class="el-faq-inner">'+items.join('')+'</div>';
    }
  },
  social: {
    label: 'Réseaux sociaux',
    w: 900, h: 70, x: 0, y: 300, fullWidth: true,
    bg: '#1a1a1a',
    html: function(d) {
      var label = _f(d,'label', d.text||'Suivez-nous');
      return '<div class="el-social-inner">'
        +'<p class="social-label">'+label+'</p>'
        +'<div class="social-links">'
        +'<span class="social-btn">𝕏</span>'
        +'<span class="social-btn">in</span>'
        +'<span class="social-btn">f</span>'
        +'<span class="social-btn">▶</span>'
        +'<span class="social-btn">📷</span>'
        +'</div>'
        +'</div>';
    }
  },

  /* ── CONVERSION ─────────────────────────────────────────────── */
  cta: {
    label: 'Bouton CTA',
    w: 900, h: 90, x: 0, y: 350, fullWidth: true,
    bg: '#1a1a1a',
    html: function(d) {
      var title = _f(d,'title', d.text||'Prêt à nous rejoindre ?');
      var btn = _f(d,'buttonText','Commencer gratuitement →');
      return '<div class="el-cta-inner">'
        +'<h3>'+title+'</h3>'
        +'<button>'+btn+'</button>'
        +'</div>';
    }
  },
  form: {
    label: 'Formulaire',
    w: 400, h: 150, x: 0, y: 300,
    bg: '#EEEDFE',
    html: function(d) {
      return '<div class="el-form-inner">'
        + '<input type="text" placeholder="Votre nom">'
        + '<input type="email" placeholder="Votre email">'
        + '<button>Envoyer</button>'
        + '</div>';
    }
  },
  newsletter: {
    label: 'Newsletter',
    w: 900, h: 120, x: 0, y: 300, fullWidth: true,
    bg: '#1a1a1a',
    html: function(d) {
      var title = _f(d,'title', d.text||'Restez informé');
      var body = _f(d,'body','Recevez les dernières actualités dans votre boîte mail.');
      return '<div class="el-newsletter-inner">'
        +'<h3>'+title+'</h3>'
        +'<p>'+body+'</p>'
        +'<div class="newsletter-form"><input type="email" placeholder="votre@email.com"><button>S\'inscrire</button></div>'
        +'</div>';
    }
  },
  countdown: {
    label: 'Compte à rebours',
    w: 900, h: 120, x: 0, y: 300, fullWidth: true,
    bg: '#1a1a1a',
    html: function(d) {
      var label = _f(d,'label', d.text||"L'offre se termine dans");
      return '<div class="el-countdown-inner">'
        +'<h4>'+label+'</h4>'
        +'<div class="countdown-boxes">'
        +'<div class="cd-box"><div class="cd-num">12</div><div class="cd-label">Jours</div></div>'
        +'<div class="cd-sep">:</div>'
        +'<div class="cd-box"><div class="cd-num">08</div><div class="cd-label">Heures</div></div>'
        +'<div class="cd-sep">:</div>'
        +'<div class="cd-box"><div class="cd-num">45</div><div class="cd-label">Min</div></div>'
        +'<div class="cd-sep">:</div>'
        +'<div class="cd-box"><div class="cd-num">30</div><div class="cd-label">Sec</div></div>'
        +'</div>'
        +'</div>';
    }
  },
  map: {
    label: 'Carte / Map',
    w: 900, h: 180, x: 0, y: 300, fullWidth: true,
    bg: '#e0e0e0',
    html: function(d) {
      var address = _f(d,'address', d.text||'12 Rue de la Paix, Paris');
      return '<div class="el-map-inner">'
        +'<div class="map-placeholder">'
        +'<span class="map-pin">📍</span>'
        +'<p>'+address+'</p>'
        +'<span class="map-hint">Intégrez votre carte ici</span>'
        +'</div>'
        +'</div>';
    }
  },
  /* ── ÉLÉMENTS ATOMIQUES (générés par décomposition de blocs) ─── */
  feature_item: {
    label: 'Feature',
    w: 200, h: 140, x: 0, y: 0,
    bg: '#f5f5f4',
    html: function(d) {
      var icon = _f(d,'icon','⭐');
      var title = _f(d,'title','Titre');
      var desc = _f(d,'description','Description de la fonctionnalité.');
      return '<div class="el-feature-item-inner">'
        +'<div class="feature-item"><div class="feature-icon">'+icon+'</div>'
        +'<h4>'+title+'</h4><p>'+desc+'</p></div></div>';
    }
  },
  team_member: {
    label: 'Membre',
    w: 180, h: 160, x: 0, y: 0,
    bg: '#f5f5f4',
    html: function(d) {
      var name = _f(d,'name','Prénom Nom');
      var role = _f(d,'role','Poste');
      return '<div class="el-team-member-inner">'
        +'<div class="team-card"><div class="team-avatar"></div>'
        +'<h4>'+name+'</h4><p>'+role+'</p></div></div>';
    }
  },
  stat_item: {
    label: 'Statistique',
    w: 160, h: 100, x: 0, y: 0,
    bg: '#E1F5EE',
    html: function(d) {
      var number = _f(d,'number','99');
      var label = _f(d,'label','Clients');
      return '<div class="el-stat-item-inner">'
        +'<div class="stat-box"><div class="stat-number">'+number+'</div>'
        +'<p>'+label+'</p></div></div>';
    }
  },
  step_item: {
    label: 'Étape',
    w: 220, h: 130, x: 0, y: 0,
    bg: '#EEEDFE',
    html: function(d) {
      var num = _f(d,'num','1');
      var title = _f(d,'title','Étape');
      var desc = _f(d,'description','Description de l\'étape.');
      return '<div class="el-step-item-inner">'
        +'<div class="step-item"><div class="step-num">'+num+'</div>'
        +'<h4>'+title+'</h4><p>'+desc+'</p></div></div>';
    }
  },
  faq_item: {
    label: 'FAQ Item',
    w: 900, h: 56, x: 0, y: 0, fullWidth: true,
    bg: '#f5f5f4',
    html: function(d) {
      var question = _f(d,'question','Question ?');
      var answer = _f(d,'answer','Réponse ici.');
      return '<div class="el-faq-item-inner">'
        +'<div class="faq-item"><div class="faq-q"><span>'+question+'</span>'
        +'<span class="faq-plus">+</span></div>'
        +'<div class="faq-answer" style="display:none;padding:.5rem .75rem;font-size:.8rem;color:#555;">'+answer+'</div>'
        +'</div></div>';
    }
  },
  progress_item: {
    label: 'Barre de progression',
    w: 900, h: 50, x: 0, y: 0, fullWidth: true,
    bg: '#EEEDFE',
    html: function(d) {
      var label = _f(d,'label','Compétence');
      var value = _f(d,'value','75');
      return '<div class="el-progress-item-inner">'
        +'<div class="progress-item"><span class="progress-label">'+label+'</span>'
        +'<div class="progress-bar"><div class="progress-fill" style="width:'+value+'%"></div></div>'
        +'<span class="progress-pct">'+value+'%</span></div></div>';
    }
  },
  pricing_plan: {
    label: 'Plan tarifaire',
    w: 260, h: 240, x: 0, y: 0,
    bg: '#f5f5f4',
    html: function(d) {
      var name = _f(d,'name','Plan');
      var price = _f(d,'price','0€');
      var period = _f(d,'period','/mois');
      var features = _f(d,'features','✓ Feature 1\n✓ Feature 2');
      var buttonText = _f(d,'buttonText','Commencer');
      var featured = d.fields && d.fields.featured;
      var featuresList = String(features).split('\n').filter(function(f){return f.trim();}).map(function(f){return'<li>'+f.trim()+'</li>';}).join('');
      return '<div class="el-pricing-plan-inner">'
        +'<div class="pricing-card'+(featured?' pricing-featured':'')+'">'
        +(featured?'<div class="pricing-badge">Populaire</div>':'')
        +'<div class="pricing-name">'+name+'</div>'
        +'<div class="pricing-price">'+price+'<span>'+period+'</span></div>'
        +'<ul>'+featuresList+'</ul>'
        +'<button>'+buttonText+'</button></div></div>';
    }
  },
  gallery_item: {
    label: 'Image galerie',
    w: 280, h: 200, x: 0, y: 0,
    bg: '#f5f5f4',
    html: function(d) {
      if (d.imageData) {
        return '<div class="el-gallery-item-inner"><div class="gallery-item" style="background-image:url('+d.imageData+');background-size:cover;background-position:center;height:100%;"></div></div>'
          +'<input type="file" id="image-upload-'+(d.id||'x')+'" accept="image/*" style="display:none;" onchange="window.__wc.handleImageUpload(this,\''+(d.id||'x')+'\')">';
      }
      return '<div class="el-gallery-item-inner">'
        +'<div class="gallery-item" style="height:100%;display:flex;align-items:center;justify-content:center;color:#aaa;font-size:2rem;">🖼</div></div>'
        +'<input type="file" id="image-upload-'+(d.id||'x')+'" accept="image/*" style="display:none;" onchange="window.__wc.handleImageUpload(this,\''+(d.id||'x')+'\')">';
    }
  },
  logo_item: {
    label: 'Logo partenaire',
    w: 140, h: 70, x: 0, y: 0,
    bg: '#f5f5f4',
    html: function(d) {
      var name = _f(d,'name','Logo');
      return '<div class="el-logo-item-inner"><div class="logo-item">'+name+'</div></div>';
    }
  },
  list_item: {
    label: 'Item de liste',
    w: 400, h: 44, x: 0, y: 0,
    bg: '#f5f5f4',
    html: function(d) {
      var text = _f(d,'text', d.text||'Item de liste');
      return '<div class="el-list-item-inner"><ul><li>'+text+'</li></ul></div>';
    }
  },
  section_col: {
    label: 'Colonne',
    w: 280, h: 140, x: 0, y: 0,
    bg: '#f5f5f4',
    html: function(d) {
      var text = _f(d,'text', d.text||'Contenu de la colonne');
      return '<div class="el-section-col-inner"><div class="section-col">'+text+'</div></div>';
    }
  }
};

export var defaultTexts = {
  nav: 'MonSite|Accueil|Services|Contact|CTA',
  hero: 'Titre principal',
  text: 'Titre du bloc',
  image: '',
  cta: 'Prêt à nous rejoindre ?',
  footer: 'MonSite',
  heading: 'Titre de section',
  card: 'Titre',
  section: 'Colonne 1|Colonne 2|Colonne 3',
  testimonial: 'Super produit !|Jean Dupont',
  stats: '99 Clients|500 Projets|10K Users',
  form: 'Contact',
  banner: '🎉 Offre spéciale — 30%',
  alert: 'Information importante',
  divider: '',
  spacer: '',
  gallery: '',
  video: 'Titre de la vidéo',
  quote: 'Une citation|Auteur Name',
  list: 'Points clés|Premier item|Deuxième item|Troisième item',
  table: 'Col A|Col B|Col C',
  features: '⚡ Rapide|🔒 Sécurisé|🎯 Précis|💡 Intuitif',
  pricing: 'Tarification',
  team: 'Jean · CEO|Marie · Design|Paul · Dev|Sofia · Marketing',
  steps: 'Créer · Créez votre compte|Configurer · Personnalisez|Lancer · Publiez',
  logobar: 'Ils nous font confiance',
  progress: 'Design 90|Développement 75|Marketing 60',
  faq: 'Comment ça fonctionne ?|Quel est le prix ?|Essai gratuit ?|Support ?',
  newsletter: 'Restez informé',
  countdown: "L'offre se termine dans",
  map: '12 Rue de la Paix, Paris',
  social: 'Suivez-nous',
  feature_item: '',
  team_member: '',
  stat_item: '',
  step_item: '',
  faq_item: '',
  progress_item: '',
  pricing_plan: '',
  gallery_item: '',
  logo_item: '',
  list_item: '',
  section_col: ''
};

export var layerColors = {
  nav: '#7F77DD',
  hero: '#1D9E75',
  text: '#D85A30',
  image: '#EF9F27',
  cta: '#D4537E',
  footer: '#888',
  heading: '#7F77DD',
  card: '#D85A30',
  section: '#BA7517',
  testimonial: '#D85A30',
  stats: '#1D9E75',
  form: '#7F77DD',
  banner: '#7F77DD',
  alert: '#EF9F27',
  divider: '#ccc',
  spacer: '#ddd',
  gallery: '#EF9F27',
  video: '#1a1a1a',
  quote: '#7F77DD',
  list: '#D85A30',
  table: '#BA7517',
  features: '#1D9E75',
  pricing: '#D4537E',
  team: '#1D9E75',
  steps: '#7F77DD',
  logobar: '#BA7517',
  progress: '#7F77DD',
  faq: '#D85A30',
  newsletter: '#1D9E75',
  countdown: '#D4537E',
  map: '#888',
  social: '#1a1a1a'
};

export var templates = {
  restaurant: {
    name: 'Restaurant',
    // hero→260px, features→140px, section(3col)→140px, testimonial→140px
    blocks: [
      { type: 'nav',         x: 0,   y: 0,   text: 'Le Jardin|Accueil|Carte|Réservation|Réserver', bg: '#1a0800' },
      { type: 'banner',      x: 0,   y: 46,  text: '🍷 Happy Hour 18h-20h — 50% sur tous les vins !', bg: '#8B4513' },
      { type: 'hero',        x: 0,   y: 92,  text: 'Une Cuisine Authentique & Raffinée', bg: '#2d1400' },
      { type: 'features',    x: 0,   y: 360, text: '🍽 Service|🥩 Produits frais|🍷 Cave à vins|⭐ Étoilé Michelin', bg: '#2d1a08' },
      { type: 'section',     x: 0,   y: 510, text: '🥗 Entrées|🥩 Plats du jour|🍮 Desserts maison', bg: '#3d2010' },
      { type: 'testimonial', x: 250, y: 660, text: 'Une expérience gastronomique exceptionnelle !|Sophie M., Paris', bg: '#BA7517' },
      { type: 'cta',         x: 0,   y: 810, text: 'Réserver une table ce soir', bg: '#1a0800' },
      { type: 'footer',      x: 0,   y: 910, text: 'Le Jardin', bg: '#1a0800' }
    ]
  },
  portfolio: {
    name: 'Portfolio Créatif',
    // hero→260px, stats→100px, steps→130px, card→150px
    blocks: [
      { type: 'nav',         x: 0,   y: 0,   text: 'Mon Portfolio|Projets|À propos|Blog|Me contacter', bg: '#ffffff' },
      { type: 'hero',        x: 0,   y: 46,  text: 'Designer & Developer Créatif', bg: '#f8f8f8' },
      { type: 'stats',       x: 0,   y: 320, text: '42 Projets|18 Clients|5 Ans|100% Satisfaits', bg: '#E1F5EE' },
      { type: 'steps',       x: 0,   y: 430, text: 'Découverte · On explore vos besoins|Conception · Je crée la maquette|Livraison · Code & mise en ligne', bg: '#EEEDFE' },
      { type: 'heading',     x: 0,   y: 570, text: 'Projets récents', bg: '#7F77DD' },
      { type: 'card',        x: 30,  y: 640, text: 'Projet Branding', bg: '#EEEDFE' },
      { type: 'card',        x: 350, y: 640, text: 'App Mobile', bg: '#E1F5EE' },
      { type: 'card',        x: 670, y: 640, text: 'Site E-commerce', bg: '#FAECE7' },
      { type: 'cta',         x: 0,   y: 810, text: 'Discutons de votre projet', bg: '#D85A30' },
      { type: 'footer',      x: 0,   y: 910, text: 'Portfolio', bg: '#1a1a1a' }
    ]
  },
  startup: {
    name: 'Startup SaaS',
    // hero→260px, features→140px, stats→100px, pricing→310px
    blocks: [
      { type: 'nav',      x: 0, y: 0,    text: 'AppName|Fonctionnalités|Tarifs|Blog|Essai gratuit', bg: '#0f0f1a' },
      { type: 'banner',   x: 0, y: 46,   text: '🚀 Bêta ouverte — Accès gratuit pendant 30 jours !', bg: '#7F77DD' },
      { type: 'hero',     x: 0, y: 92,   text: 'La Solution qui Transforme votre Business', bg: '#0f0f1a' },
      { type: 'features', x: 0, y: 360,  text: '⚡ Ultra-rapide|🔒 Sécurisé|🎯 Précis|💡 Intuitif', bg: '#1a1a2e' },
      { type: 'stats',    x: 0, y: 510,  text: '10K+ Clients|500M Requêtes|99.9% Uptime', bg: '#1D9E75' },
      { type: 'pricing',  x: 0, y: 620,  text: 'Nos offres', bg: '#0f0f1a' },
      { type: 'cta',      x: 0, y: 940,  text: 'Commencer gratuitement — 0€/mois', bg: '#7F77DD' },
      { type: 'footer',   x: 0, y: 1040, text: 'AppName', bg: '#0f0f1a' }
    ]
  },
  blog: {
    name: 'Blog Editorial',
    // hero→260px, card→150px, quote→140px, newsletter→250px
    blocks: [
      { type: 'nav',        x: 0,   y: 0,   text: 'Mon Blog|Articles|Catégories|À propos|Newsletter', bg: '#1a1a1a' },
      { type: 'hero',       x: 0,   y: 46,  text: 'Histoires, Inspirations & Découvertes', bg: '#f5f5f4' },
      { type: 'heading',    x: 0,   y: 320, text: 'Articles à la une', bg: '#7F77DD' },
      { type: 'card',       x: 30,  y: 390, text: 'Design & UX', bg: '#EEEDFE' },
      { type: 'card',       x: 350, y: 390, text: 'Développement', bg: '#E1F5EE' },
      { type: 'card',       x: 670, y: 390, text: 'Tendances 2025', bg: '#FAECE7' },
      { type: 'quote',      x: 150, y: 560, text: 'Écrire, c\'est dessiner avec des mots.|Victor Hugo', bg: '#EEEDFE' },
      { type: 'newsletter', x: 0,   y: 720, text: 'Restez inspiré chaque semaine', bg: '#1a1a1a' },
      { type: 'footer',     x: 0,   y: 980, text: 'Mon Blog', bg: '#1a1a1a' }
    ]
  },
  shop: {
    name: 'Boutique',
    // hero→260px, card→150px (2 rows), testimonial→140px
    blocks: [
      { type: 'nav',         x: 0,   y: 0,   text: 'Boutique|Nouveautés|Collections|Promotions|Panier', bg: '#1a1a1a' },
      { type: 'banner',      x: 0,   y: 46,  text: '🛍 Livraison offerte dès 50€ — Code : LIVRAISON50', bg: '#D85A30' },
      { type: 'hero',        x: 0,   y: 92,  text: 'Nouvelle Collection Printemps 2025', bg: '#f5f5f4' },
      { type: 'card',        x: 30,  y: 360, text: 'Produit Vedette', bg: '#EEEDFE' },
      { type: 'card',        x: 350, y: 360, text: 'Nouveauté', bg: '#E1F5EE' },
      { type: 'card',        x: 670, y: 360, text: 'Best-seller', bg: '#FAECE7' },
      { type: 'card',        x: 30,  y: 520, text: 'Édition limitée', bg: '#FAECE7' },
      { type: 'card',        x: 350, y: 520, text: 'Collection été', bg: '#EEEDFE' },
      { type: 'card',        x: 670, y: 520, text: 'Soldes', bg: '#E1F5EE' },
      { type: 'testimonial', x: 250, y: 690, text: 'Qualité impeccable, livraison ultra rapide !|Clara B., Lyon', bg: '#BA7517' },
      { type: 'cta',         x: 0,   y: 840, text: 'Découvrir toute la collection', bg: '#D85A30' },
      { type: 'footer',      x: 0,   y: 940, text: 'Boutique', bg: '#1a1a1a' }
    ]
  },
  event: {
    name: 'Événement',
    // countdown→120px, hero→260px, team→160px, steps→130px, map→180px
    blocks: [
      { type: 'nav',       x: 0, y: 0,    text: 'WebSummit 2025|Programme|Intervenants|Lieu|S\'inscrire', bg: '#0d1117' },
      { type: 'countdown', x: 0, y: 46,   text: "L'événement commence dans", bg: '#7F77DD' },
      { type: 'hero',      x: 0, y: 170,  text: '15 Avril 2025 — Paris, Grande Halle', bg: '#0d1117' },
      { type: 'team',      x: 0, y: 440,  text: 'Marie Curie · Keynote|Elon Chen · Startup|Ada Lin · IA & Tech|Jean Marc · Design', bg: '#1c2128' },
      { type: 'steps',     x: 0, y: 610,  text: 'Inscription · Réservez votre place|Confirmation · Recevez votre badge|Événement · Venez apprendre & networker', bg: '#EEEDFE' },
      { type: 'map',       x: 0, y: 750,  text: 'Grande Halle de la Villette, Paris 19ème', bg: '#e0e0e0' },
      { type: 'cta',       x: 0, y: 940,  text: 'Inscrivez-vous maintenant — Places limitées !', bg: '#D85A30' },
      { type: 'footer',    x: 0, y: 1040, text: 'WebSummit 2025', bg: '#0d1117' }
    ]
  }
};
