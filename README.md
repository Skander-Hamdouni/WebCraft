# WebCraft — Créez votre site sans coder

WebCraft est une application complète de création de sites web sans code, type Canva/Webflow, avec backend Supabase intégré.

## ✅ Status: Phases 1-5 Complètes

### Phase 1: Foundation ✅
- Système undo/redo (20 étapes)
- Grid snapping (10px)
- Contrôles z-index
- Raccourcis clavier

### Phase 2: Export ✅
- Export HTML sémantique (BEM)
- Export CSS avec variables
- JSZip download
- Aperçu en direct

### Phase 3: Éditeur Avancé ✅
- Édition texte inline
- Upload d'images (base64)
- Color picker natif
- Padding/margin (4 champs)
- Bouton dupliquer

### Phase 4: Templates & Pages ✅
- 6 templates prêts à l'emploi
- Multi-page support
- Page manager
- Clear canvas

### Phase 5: Supabase ✅
- Authentification email/password
- Site storage cloud
- Auto-save (30s)
- Referral system

## Structure des fichiers

```
webcraft/
├── index.html                (HTML + Supabase CDN)
├── app.js                    (Logique + Supabase)
├── style.css                 (Styling complet)
├── SUPABASE_MIGRATIONS.sql   (Schéma base de données)
├── supabase.config.js        (Template config)
├── PHASE_5_SETUP.md         (Guide setup)
├── PHASE_5_TESTING.md       (Guide test)
└── README.md                (Ce fichier)
```

## Démarrage Rapide

### Sans Supabase (Mode Demo)
1. Ouvrir `index.html` dans le navigateur
2. Accès aux templates et éditeur en mode local
3. Aucune données persiste après refresh

### Avec Supabase (Production)
1. Créer compte sur supabase.com
2. Créer nouveau projet
3. Lire `PHASE_5_SETUP.md` pour full setup
4. Mettre à jour credentials dans `app.js`
5. Lancer les SQL migrations

## Pages et Fonctionnalités

### 📝 Connexion / Inscription
- Signup avec email, mot de passe, code parrain optionnel
- Signin avec email/password
- Auto-génération code parrain unique
- Linking referral si code fourni

### 📊 Dashboard
- Greeting personnalisé
- Statistiques (sites créés, code parrain)
- Grille dynamique de sites
- CRUD complet (créer/éditer/supprimer)
- Lien parrain avec copie-clipboard
- Activité récente

### 🎨 Templates
- 6 templates filtrables (Restaurant, Portfolio, Startup, Blog, Boutique, Événement)
- Un-click site creation
- Templates pré-positionnés

### ✏️ Éditeur
- **Drag & Drop**: Glisser blocs depuis panneau gauche
- **Propriétés**: Éditer texte, couleur, padding, position
- **Calques**: Vue hiérarchique des éléments
- **Undo/Redo**: 20 steps historique
- **Multi-page**: Onglet Pages pour gérer pages
- **Saving**: 💾 Auto-save 30s + indicator
- **Export**: HTML/CSS sémantique + ZIP
- **Publish**: Sauvegarder avec statut "published"

## Modèle de Revenus

| Plan     | Prix   | Features                                    |
|----------|--------|---------------------------------------------|
| Gratuit  | 0€/mois | 3 sites, sous-domaine, HTML+CSS            |
| Pro      | 9€/mois | ∞ sites, JS, collabora, analyti           |
| Parrain  | 13€/mois | Tout Pro + 1 filleul inclus (4€ de plus) |

## Stack Technique

**Frontend**:
- HTML5 (sémantique)
- CSS3 (variables, responsive)
- JavaScript ES5 (vanilla, aucun framework)
- Supabase JS SDK v2 (CDN)
- JSZip (CDN)

**Backend**:
- Supabase (PostgreSQL + Auth + API)
- Row Level Security (RLS)
- Triggers PostgreSQL

**Design**:
- Design system: 5 colors (coral, teal, purple, amber, dark)
- Fonts: Syne (headings), DM Sans (body)
- Flat design, aucun gradient

## Base de Données

```sql
profiles (custom)
├── id (UUID) → FK auth.users
├── display_name (TEXT)
├── referral_code (TEXT, UNIQUE)
├── referred_by (UUID)
├── created_at, updated_at

sites (custom)
├── id (UUID)
├── user_id (UUID) → FK auth.users
├── name (TEXT)
├── data (JSONB) → {els: {}, elCounter}
├── status (TEXT)
├── created_at, updated_at
```

## Configuration pour Supabase

Mettre à jour dans `app.js` ligne 10-13:

```javascript
var SUPABASE_URL = 'https://your-project.supabase.co';
var SUPABASE_ANON_KEY = 'your-anon-key-here';
```

Puis run migrations SQL depuis `SUPABASE_MIGRATIONS.sql`.

## Guide Documentation

- 📖 **PHASE_5_SETUP.md** — Instructions complètes setup Supabase
- 🧪 **PHASE_5_TESTING.md** — Guide test et troubleshooting
- 📋 **PHASE_5_SUMMARY.md** — Résumé technique détaillé

## Fonctionnalités Détaillées

### Authentification ✅
- Signup avec email/password
- Session localStorage
- Logout
- Stubs: Google/GitHub OAuth (ready)

### Storage ✅
- Load user's sites from Supabase
- Create new site (+ template)
- Update site (auto-save 30s)
- Delete site
- Publish (status='published')

### Auto-Save ✅
- Sauvegarde canvas toutes les 30 secondes
- Indicator "💾 Sauvegarde..." in topbar
- Sauvegarde complète sur publish

### Referral System ✅
- Auto-génération code unique (SKA-2503-1234)
- Signup avec code = linking au referrer
- Dashboard copy-to-clipboard referral link

### Templates ✅
- 6 templates pré-construits
- One-click creation avec template
- Site naming on creation

## Limitations Actuelles

- ❌ Offline mode
- ❌ Google/GitHub login (stubs seulement)
- ❌ Public site hosting (placeholder)
- ❌ Collaborative editing
- ❌ Images optimisées (base64)

## Prochaines Phases Recommandées

1. **Hosting** — webcraft.io/name.webcraft.io deployment
2. **IA** — Anthropic/OpenAI pour block generation
3. **Paiement** — Stripe integration
4. **Analytics** — Vue tracking et conversions
5. **Teams** — Collab et permissions
6. **SEO** — Meta tags, sitemap, lighthouse

## Déploiement

Pour deployer sur production:

1. ✅ Vérifier credentials Supabase
2. ✅ Run SQL migrations
3. ✅ Test auth flow
4. ✅ Test auto-save
5. ✅ Test publish
6. ✅ Test referral system
7. ✅ Mobile responsive tested
8. 📝 Setup DNS & subdomains

## Support

- Console browser (F12) pour debug errors
- Check `PHASE_5_SETUP.md` si setup issues
- Check `PHASE_5_TESTING.md` pour troubleshooting
- Supabase docs: https://supabase.com/docs

---

**WebCraft: Le builder no-code français prêt pour la prod! 🚀**
4. **Export ZIP** — Générer et télécharger un vrai fichier HTML/CSS/JS
5. **Collaboration temps réel** — WebSockets (ex: Liveblocks ou Supabase Realtime)
