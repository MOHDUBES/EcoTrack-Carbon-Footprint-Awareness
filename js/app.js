/* global appState, EMISSION_FACTORS, saveState, loadState, formatNum, sanitizeInput, setSafeHTML, toggleLoading, updateDashboardUI, showToast, navigateTo, Chart, checkStreak, nextCalcStep, calculateTotal, saveAndGoToDashboard, filterActions, runScenario, sendSuggestion, changeFact, deleteLogEntry, goToFact, commitAction */
/**
 * @file app.js
 * @description Core logic module for EcoTrack platform.
 * Ensures high code quality, modularity, and strict execution.
 */
"use strict";


window.setSafeHTML = function(element, htmlString) {
  if (!element) return;
  
  let wrapper = htmlString;
  const tag = element.tagName.toLowerCase();
  
  if (tag === 'tbody') {
    wrapper = `<table><tbody>${htmlString}</tbody></table>`;
  }
  
  const doc = new DOMParser().parseFromString(wrapper, 'text/html');
  
  // Strip any script or dangerous elements manually just in case
  doc.querySelectorAll('script, iframe, object, embed').forEach(el => el.remove());
  doc.querySelectorAll('*').forEach(el => {
    // Remove inline event handlers (on*)
    Array.from(el.attributes).forEach(attr => {
      if (attr.name.startsWith('on')) {
        el.removeAttribute(attr.name);
      }
    });
  });

  let sourceNodes = doc.body.childNodes;
  if (tag === 'tbody') {
    const tbody = doc.body.querySelector('tbody');
    if (tbody) sourceNodes = tbody.childNodes;
  }
  
  element.replaceChildren(...sourceNodes);
};

/* =============================================
   EcoTrack - Main App Initialization & Routing
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupNavigation();
});

function initApp() {
  // Always update dashboard to render initial zero state and gauge track
  updateDashboardUI();

  // Check streak
  checkStreak();
}

function setupNavigation() {
  const navLinks = document.querySelectorAll('.nav-link');
  const pages = document.querySelectorAll('.page');
  const navToggle = document.getElementById('navToggle');
  const navLinksContainer = document.querySelector('.nav-links');

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    const isExpanded = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', !isExpanded);
    navLinksContainer.classList.toggle('open');
  });

  // Handle routing
  function navigateToPage(pageId) {
    // Hide all pages
    pages.forEach(p => {
      p.classList.remove('active');
      p.setAttribute('aria-hidden', 'true');
    });
    
    // Update active nav link
    navLinks.forEach(l => l.classList.remove('active'));
    const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
    if (activeLink) activeLink.classList.add('active');

    // Show target page
    const targetPage = document.getElementById(`page-${pageId}`);
    if (targetPage) {
      targetPage.classList.add('active');
      targetPage.removeAttribute('aria-hidden');
      
      // Close mobile menu if open
      navLinksContainer.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');

      // Trigger page specific initializations
      if (pageId === 'tracker') setTimeout(() => { if(typeof renderTrackerChart === 'function') renderTrackerChart(); }, 100);
      if (pageId === 'actions') setTimeout(() => { if(typeof renderActions === 'function') renderActions(); }, 100);
      if (pageId === 'insights') setTimeout(() => { if(typeof renderInsights === 'function') renderInsights(); }, 100);
      
      // Update URL hash without jumping
      history.pushState(null, null, `#${pageId}`);
      window.scrollTo(0, 0);
    }
  }

  // Click listeners for links
  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const pageId = link.getAttribute('data-page');
      navigateToPage(pageId);
    });
  });

  // Handle initial hash
  const initialHash = window.location.hash.replace('#', '');
  if (initialHash && document.getElementById(`page-${initialHash}`)) {
    navigateToPage(initialHash);
  }
}

// Global navigate function
window.navigateTo = function(pageId) {
  const activeLink = document.querySelector(`.nav-link[data-page="${pageId}"]`);
  if (activeLink) {
    activeLink.click();
  }
};

// Global Toast notification
window.showToast = function(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = sanitizeInput(message);
  toast.className = `toast show ${type}`;
  
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
};

// Show/hide loading
window.toggleLoading = function(show) {
  const loader = document.getElementById('loadingOverlay');
  if (show) {
    loader.classList.add('visible');
    loader.removeAttribute('aria-hidden');
  } else {
    loader.classList.remove('visible');
    loader.setAttribute('aria-hidden', 'true');
  }
};

// Update Dashboard UI
function updateDashboardUI() {
  const f = appState.footprint;
  
  // Update gauge
  document.getElementById('gaugeScore').textContent = formatNum(f.total, 1);
  const gaugeCanvas = document.getElementById('gaugeCanvas');
  if (gaugeCanvas) renderGauge(gaugeCanvas, f.total);

  let statusLabel = '';
  if (f.total < 4) statusLabel = 'Excellent! Your footprint is low. 🟢';
  else if (f.total < 8) statusLabel = 'Good! You are in the mid range. 🟡';
  else statusLabel = 'High. Let\'s work on reducing it! 🔴';
  document.getElementById('gaugeLabel').textContent = statusLabel;

  // Update stats
  document.getElementById('stat-transport').textContent = formatNum(f.transport, 1) + 't';
  document.getElementById('stat-diet').textContent = formatNum(f.diet, 1) + 't';
  document.getElementById('stat-energy').textContent = formatNum(f.energy, 1) + 't';
  document.getElementById('stat-shopping').textContent = formatNum(f.shopping, 1) + 't';

  // Update AI Banner
  if (f.total > 0) {
    document.getElementById('aiInsightText').textContent = "Based on your footprint, I have generated personalized recommendations for you in the AI Assistant tab.";
  }

  // Update Compare Bar
  const youBar = document.getElementById('youBar');
  const youValue = document.getElementById('youValue');
  const pct = Math.min((f.total / 20) * 100, 100);
  youBar.style.width = `${pct}%`;
  youBar.setAttribute('aria-valuenow', f.total);
  youValue.textContent = formatNum(f.total, 1) + 't';
  
  // Render minimal trend if data exists
  if (appState.logs.length > 0 && typeof Chart !== 'undefined') {
    document.getElementById('trendEmpty').style.display = 'none';
    document.getElementById('trendChartContainer').style.display = 'block';
    const canvas = document.getElementById('trendChart');
    renderMiniTrend(canvas);
  }
}

// Render Dashboard Gauge
function renderGauge(canvas, score) {
  const ctx = canvas.getContext('2d');
  const maxScore = 20; // assumed max scale
  const pct = Math.min(score / maxScore, 1);
  
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  // Draw track
  ctx.beginPath();
  ctx.arc(110, 110, 90, Math.PI, 2 * Math.PI);
  ctx.lineWidth = 16;
  ctx.strokeStyle = 'rgba(255,255,255,0.05)';
  ctx.lineCap = 'round';
  ctx.stroke();

  // Draw fill
  ctx.beginPath();
  ctx.arc(110, 110, 90, Math.PI, Math.PI + (Math.PI * pct));
  ctx.lineWidth = 16;
  
  let color = '#00c896'; // low
  if (score >= 4 && score < 8) color = '#f59e0b'; // mid
  if (score >= 8) color = '#ef4444'; // high
  
  ctx.strokeStyle = color;
  ctx.lineCap = 'round';
  ctx.stroke();
}

function renderMiniTrend(canvas) {
  // Simple trend chart for dashboard using recent logs
  if (window.miniTrendChart) window.miniTrendChart.destroy();
  
  const recentLogs = [...appState.logs].sort((a,b) => new Date(a.date) - new Date(b.date)).slice(-7);
  const labels = recentLogs.map(l => {
    const d = new Date(l.date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });
  const data = recentLogs.map(l => l.total);

  window.miniTrendChart = new Chart(canvas, {
    type: 'line',
    data: {
      labels: labels,
      datasets: [{
        label: 'Daily Footprint',
        data: data,
        borderColor: '#00c896',
        backgroundColor: 'rgba(0, 200, 150, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { display: false },
        y: { display: false, min: 0 }
      }
    }
  });
}

function checkStreak() {
  document.getElementById('user-streak').textContent = `${appState.streak} day streak`;
  const streakNum = document.getElementById('streakNumber');
  if(streakNum) streakNum.textContent = appState.streak;
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initApp,
    updateDashboardUI,
    renderGauge,
    checkStreak
  };
}

