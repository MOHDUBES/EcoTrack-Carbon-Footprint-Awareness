/**
 * @file actions.js
 * @description Core logic module for EcoTrack platform.
 * Ensures high code quality, modularity, and strict execution.
 */
"use strict";

/* =============================================
   EcoTrack - Action Hub Logic
   ============================================= */

const ECO_ACTIONS = [
  { id: 'a1', category: 'transport', title: 'Bike to Work', desc: 'Replace car commutes under 5km with cycling.', impact: 0.8, icon: '🚲' },
  { id: 'a2', category: 'transport', title: 'Take Public Transit', desc: 'Use bus or train instead of driving 3 days a week.', impact: 1.2, icon: '🚌' },
  { id: 'a3', category: 'transport', title: 'Carpooling', desc: 'Share your daily commute with a coworker.', impact: 0.9, icon: '🚗' },
  
  { id: 'a4', category: 'diet', title: 'Meatless Mondays', desc: 'Eat completely plant-based one day a week.', impact: 0.3, icon: '🥗' },
  { id: 'a5', category: 'diet', title: 'Go Flexitarian', desc: 'Limit red meat to once a week.', impact: 0.7, icon: '🥕' },
  { id: 'a6', category: 'diet', title: 'Compost Food Waste', desc: 'Set up a compost bin to prevent methane from landfills.', impact: 0.2, icon: '🍂' },
  
  { id: 'a7', category: 'energy', title: 'Switch to LED', desc: 'Replace all home bulbs with LED equivalents.', impact: 0.1, icon: '💡' },
  { id: 'a8', category: 'energy', title: 'Cold Water Wash', desc: 'Wash clothes in cold water to save heating energy.', impact: 0.15, icon: '🌊' },
  { id: 'a9', category: 'energy', title: 'Smart Thermostat', desc: 'Install a smart thermostat and lower temp by 1°C.', impact: 0.4, icon: '🌡️' },
  
  { id: 'a10', category: 'shopping', title: 'Secondhand Clothes', desc: 'Commit to buying 50% of clothes from thrift stores.', impact: 0.5, icon: '👕' },
  { id: 'a11', category: 'shopping', title: 'Reusable Bags', desc: 'Never use single-use plastic bags again.', impact: 0.05, icon: '🛍️' },
  { id: 'a12', category: 'lifestyle', title: 'Cancel Spam Mail', desc: 'Unsubscribe from junk mail and paper catalogs.', impact: 0.05, icon: '📫' }
];

function renderActions(filter = 'all') {
  const grid = document.getElementById('actionsGrid');
  if (!grid) return;
  
  setSafeHTML(grid, '');
  
  const filtered = filter === 'all' 
    ? ECO_ACTIONS 
    : ECO_ACTIONS.filter(a => a.category === filter);
    
  let totalSaved = 0;

  filtered.forEach(action => {
    const isCommitted = appState.committedActions.includes(action.id);
    if (isCommitted) totalSaved += action.impact;

    const card = document.createElement('div');
    card.className = `action-card ${isCommitted ? 'committed' : ''}`;
    card.setAttribute('role', 'listitem');
    const html = `
      <div class="action-top">
        <div class="action-icon" aria-hidden="true">${action.icon}</div>
        <div class="action-info">
          <div class="action-title">${action.title}</div>
          <div class="action-category">${action.category}</div>
        </div>
      </div>
      <div class="action-desc">${action.desc}</div>
      <div class="action-impact">
        <span class="impact-badge" aria-label="Saves ${action.impact} tons CO2 per year">-${action.impact}t CO₂/yr</span>
        <button class="commit-btn ${isCommitted ? 'committed-active' : ''}" 
                data-commit-action="${action.id}"
                aria-label="${isCommitted ? 'Uncommit from ' + action.title : 'Commit to ' + action.title}">
          ${isCommitted ? '✓ Committed' : 'Commit +'}
        </button>
      </div>
    `;
    setSafeHTML(card, html);
    grid.appendChild(card);
  });

  // Calculate global total saved from all committed (not just filtered)
  let globalSaved = 0;
  ECO_ACTIONS.forEach(a => {
    if (appState.committedActions.includes(a.id)) globalSaved += a.impact;
  });
  
  const savedDisplay = document.getElementById('totalSaved');
  if (savedDisplay) savedDisplay.textContent = `${formatNum(globalSaved)} tons`;
}

window.filterActions = function(cat, btn) {
  // Update active tab
  document.querySelectorAll('.filter-tab').forEach(t => {
    t.classList.remove('active');
    t.setAttribute('aria-selected', 'false');
  });
  btn.classList.add('active');
  btn.setAttribute('aria-selected', 'true');
  
  renderActions(cat);
}

window.commitAction = function(id, element) {
  const action = ECO_ACTIONS.find(a => a.id === id);
  if (!action) return;

  const index = appState.committedActions.indexOf(id);
  const isNowCommitted = index === -1;

  if (isNowCommitted) {
    appState.committedActions.push(id);
    if (typeof showToast === 'function') showToast('Awesome! You committed to a new eco-action! 🌍');
  } else {
    appState.committedActions.splice(index, 1);
  }
  
  if (typeof saveState === 'function') saveState(appState);
  if (typeof checkBadges === 'function') checkBadges();
  
  // Re-render current filter state
  const activeTab = document.querySelector('.filter-tab.active');
  const cat = activeTab ? (activeTab.textContent.toLowerCase().includes('all') ? 'all' : activeTab.textContent.split(' ')[1].toLowerCase()) : 'all';
  renderActions(cat);
}
