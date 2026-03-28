/* ============ WEBCRAFT — animations.js ============ */

import { state } from './store.js';
import { showToast } from './ui.js';
import { saveState } from './canvas.js';

export function applyAnimation(animType) {
  if (!state.selectedEl) { showToast('Sélectionnez un élément d\'abord', 'error'); return; }

  var duration = parseInt(document.getElementById('anim-duration').value) || 600;

  Object.keys(state.elementAnimations).forEach(function(id) {
    var el = document.getElementById(id);
    if (el) el.style.animation = '';
  });

  var maxOrder = 0;
  Object.values(state.elementAnimations).forEach(function(a) { if ((a.order || 0) > maxOrder) maxOrder = a.order; });

  state.elementAnimations[state.selectedEl] = { type: animType, duration, trigger: 'load', order: maxOrder + 1 };

  var el = document.getElementById(state.selectedEl);
  if (el) el.style.animation = animType + ' ' + duration + 'ms ease-in-out';

  state.currentAnimationType = animType;

  if (state.animationOrganizerMode) {
    if (el) el.classList.add('has-animation');
    updateAnimationTimeline();
  }

  saveState();
  showToast('Animation: ' + animType, 'success');
}

export function updateAnimationPreview() {
  if (!state.selectedEl || !state.currentAnimationType) return;
  var duration = parseInt(document.getElementById('anim-duration').value) || 600;
  var el = document.getElementById(state.selectedEl);
  if (el) {
    el.style.animation = 'none';
    setTimeout(function() {
      el.style.animation = state.currentAnimationType + ' ' + duration + 'ms ease-in-out';
      state.elementAnimations[state.selectedEl].duration = duration;
    }, 10);
  }
}

export function removeAnimation() {
  if (!state.selectedEl) { showToast('Sélectionnez un élément d\'abord', 'error'); return; }
  
  if (!state.elementAnimations[state.selectedEl]) { 
    showToast('Cet élément n\'a pas d\'animation', 'error'); 
    return; 
  }

  var el = document.getElementById(state.selectedEl);
  if (el) {
    el.style.animation = '';
    el.classList.remove('has-animation');
  }

  delete state.elementAnimations[state.selectedEl];
  state.currentAnimationType = null;

  // Fermer les contrôles d'animation
  var animControls = document.getElementById('anim-controls');
  if (animControls) animControls.style.display = 'none';

  if (state.animationOrganizerMode) {
    updateAnimationTimeline();
  }

  saveState();
  showToast('Animation supprimée', 'success');
}

export function toggleAnimationOrganizer() {
  state.animationOrganizerMode = !state.animationOrganizerMode;
  var btn = document.querySelector('.organize-anim-btn');
  var canvas = document.getElementById('canvas');
  var organizer = document.getElementById('anim-organizer');

  if (state.animationOrganizerMode) {
    btn.classList.add('active');
    canvas.classList.add('anim-organize-mode');
    organizer.style.display = 'block';
    updateAnimationTimeline();
    document.querySelectorAll('.canvas-el').forEach(function(el) {
      if (state.elementAnimations[el.id]) el.classList.add('has-animation');
    });
  } else {
    btn.classList.remove('active');
    canvas.classList.remove('anim-organize-mode');
    organizer.style.display = 'none';
    document.querySelectorAll('.canvas-el').forEach(function(el) { el.classList.remove('has-animation'); });
  }
}

export function updateAnimationTimeline() {
  var timeline = document.getElementById('anim-timeline');
  timeline.innerHTML = '';

  var animated = Object.keys(state.elementAnimations)
    .filter(function(id) { return document.getElementById(id); })
    .map(function(id) {
      return { id, label: (state.els[id] && state.els[id].label) || 'Élément', trigger: state.elementAnimations[id].trigger || 'load', order: state.elementAnimations[id].order || 0 };
    })
    .sort(function(a, b) { return a.order - b.order; });

  if (animated.length === 0) {
    timeline.innerHTML = '<div style="color:#999;font-size:0.75rem;text-align:center;padding:1rem;">Aucune animation assignée</div>';
    return;
  }

  animated.forEach(function(item, index) {
    var div = document.createElement('div');
    div.className = 'anim-timeline-item';
    div.draggable = true;
    div.dataset.elementId = item.id;
    div.innerHTML =
      '<div class="anim-order-num">' + (index + 1) + '</div>'
      + '<div class="anim-elem-label">' + item.label + '</div>'
      + '<select class="anim-trigger-select" onchange="window.__wc.updateAnimationTrigger(\'' + item.id + '\', this.value)">'
      + '<option value="load"   ' + (item.trigger==='load'   ? 'selected':'') + '>Au chargement</option>'
      + '<option value="hover"  ' + (item.trigger==='hover'  ? 'selected':'') + '>Au survol</option>'
      + '<option value="scroll" ' + (item.trigger==='scroll' ? 'selected':'') + '>Au défilement</option>'
      + '<option value="click"  ' + (item.trigger==='click'  ? 'selected':'') + '>Au clic</option>'
      + '</select>';

    div.addEventListener('dragstart', function(e) { e.dataTransfer.effectAllowed='move'; e.dataTransfer.setData('text/plain', item.id); div.classList.add('dragging'); });
    div.addEventListener('dragend',   function()  { div.classList.remove('dragging'); });
    div.addEventListener('dragover',  function(e) { e.preventDefault(); e.dataTransfer.dropEffect='move'; });
    div.addEventListener('drop',      function(e) {
      e.preventDefault();
      var draggedId = e.dataTransfer.getData('text/plain');
      if (draggedId !== item.id) { reorderAnimations(draggedId, item.id); updateAnimationTimeline(); }
    });
    timeline.appendChild(div);
  });
}

export function updateAnimationTrigger(elementId, trigger) {
  if (state.elementAnimations[elementId]) {
    state.elementAnimations[elementId].trigger = trigger;
    saveState();
  }
}

function reorderAnimations(draggedId, targetId) {
  var a = state.elementAnimations[draggedId].order || 0;
  var b = state.elementAnimations[targetId].order  || 0;
  state.elementAnimations[draggedId].order = b;
  state.elementAnimations[targetId].order  = a;
  saveState();
}
