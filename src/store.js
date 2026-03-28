/* ============ WEBCRAFT — store.js — état centralisé ============ */

export const state = {
  // Supabase
  supabase: null,
  currentUser: null,
  currentSite: null,
  autoSaveInterval: null,

  // Animations
  elementAnimations: {},
  currentAnimationType: null,
  animationOrganizerMode: false,

  // Navigation
  currentPage: 'login',

  // Canvas
  selectedEl: null,
  selectedEls: [],   // multi-sélection (marquee)
  dragType: null,
  elCounter: 0,
  els: {},
  mobileMode: false,

  // Historique
  undoStack: [],
  redoStack: [],
  maxHistorySteps: 20,

  // Pages multi-page
  pages: {},
  currentPageId: 'page-1',
  pageCounter: 1,

  // Liens inter-pages (mode architecte)
  pageLinks: {},  // { [elId]: { fromPage, toPage|null, url|null } }

  // Mode découpe
  trimModeActive: false,
  trimModeIgnoreClick: false,

};
