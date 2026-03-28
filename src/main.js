/* ============ WEBCRAFT — main.js — point d'entrée Vite ============ */

import { initSupabase, handleSignIn, handleSignUp, handleLogout, handleGoogleSignIn, handleGithubSignIn } from './auth.js';
import { goPage, updateNav } from './navigation.js';
import { showToast, animateCount, switchLoginTab, filterTpl, copyParrain, initKeyboardShortcuts, showConfirm, showPrompt, _genericConfirmOk, _genericConfirmCancel, _genericPromptOk, _genericPromptCancel } from './ui.js';
import { initDefaultCanvas, addEl, renderEl, renderCanvas, selectElById, canvasClick, saveState, undo, redo, updateCanvasHeight, renderLayers, updateHistoryUI, bringForward, sendBackward, extendCanvasPage, enterTrimMode, exitTrimMode, trimToLastElement, handleImageUpload, alignGroup, distributeGroup, setGroupPadding, delGroupEls, setCanvasBg } from './canvas.js';
import { updateSwatches, updateCodePreview, updateElText, updateElPos, updatePosFields, setElBg, setElColor, updatePadding, updateMargin, duplicateEl, delEl, updateTextStyle, toggleTextStyle, setTextAlign, updateBlockField, updateBlockItem, addBlockItem, removeBlockItem, moveBlockItemUp, moveBlockItemDown, handleGalleryItemUpload, _getSelectedId } from './properties.js';
import { applyAnimation, updateAnimationPreview, removeAnimation, toggleAnimationOrganizer, updateAnimationTimeline, updateAnimationTrigger } from './animations.js';
import { loadTemplate, clearCanvas, addPage, renamePage, deletePage, switchPage, renderPagesList, startDrag, endDrag, dropOnCanvas, switchETab, toggleDevice } from './editor.js';
import { loadUserData, loadUserSites, loadSiteForEditing, autoSaveCanvas, createNewSite, deleteSite, viewSite, closeNameModal, confirmNameModal, loadProfilePage, copyProfileReferral } from './supabase-data.js';
import { showExport, switchExpTab, copyCode, copyActiveExport, downloadZip, copyElCode, closeModal, openPreview, switchPreviewTo, closePreview, publishSite, triggerAI, showLivePreview, switchPreviewDevice, previewTemplate } from './export.js';
import { initLanding } from './landing.js';
import { toggleArchitectMode, enterArchitectMode, exitArchitectMode, renderArchitectMap, archEditPageLinks, archCloseEditOverlay, archOpenLinkDialog, archConfirmLink, archCloseLinkDialog, archRemoveLink } from './architect.js';

// ---- Expose toutes les fonctions appelées depuis le HTML via onclick ----
window.__wc = {
  // Auth
  handleSignIn, handleSignUp, handleLogout, handleGoogleSignIn, handleGithubSignIn,
  // Navigation
  goPage,
  // UI
  showToast, switchLoginTab, filterTpl, copyParrain,
  _genericConfirmOk, _genericConfirmCancel, _genericPromptOk, _genericPromptCancel,
  // Canvas
  addEl, canvasClick, undo, redo, bringForward, sendBackward,
  extendCanvasPage, enterTrimMode, exitTrimMode, trimToLastElement, handleImageUpload,
  alignGroup, distributeGroup, setGroupPadding, delGroupEls, setCanvasBg,
  // Properties
  updateElText, updateElPos, setElBg, setElColor, updatePadding, updateMargin, duplicateEl, delEl,
  updateTextStyle, toggleTextStyle, setTextAlign,
  updateBlockField, updateBlockItem, addBlockItem, removeBlockItem, moveBlockItemUp, moveBlockItemDown, handleGalleryItemUpload, _getSelectedId,
  // Animations
  applyAnimation, updateAnimationPreview, removeAnimation, toggleAnimationOrganizer, updateAnimationTrigger,
  // Editor
  loadTemplate, clearCanvas, addPage, renamePage, deletePage, switchPage,
  startDrag, endDrag, dropOnCanvas, switchETab, toggleDevice,
  // Supabase data
  loadSiteForEditing, autoSaveCanvas, deleteSite, viewSite, closeNameModal, confirmNameModal,
  loadProfilePage, copyProfileReferral,
  // Export / Preview
  showExport, switchExpTab, copyCode, copyActiveExport, downloadZip, copyElCode,
  closeModal, openPreview, switchPreviewTo, closePreview, publishSite, triggerAI,
  showLivePreview, switchPreviewDevice, previewTemplate,
  // Architect mode
  toggleArchitectMode, enterArchitectMode, exitArchitectMode, renderArchitectMap,
  archEditPageLinks, archCloseEditOverlay, archOpenLinkDialog,
  archConfirmLink, archCloseLinkDialog, archRemoveLink,
};

// Compatibilité avec les onclick HTML qui appellent directement le nom de la fonction
// (sans window.__wc.) — on copie tout sur window
Object.assign(window, window.__wc);

// ---- Init ----
initLanding();
initKeyboardShortcuts();
goPage('landing');

window.addEventListener('load', function() {
  initSupabase();
});
