/**
 * @file insights.js
 * @description Core logic module for EcoTrack platform.
 * Ensures high code quality, modularity, and strict execution.
 */
"use strict";

/* =============================================
   EcoTrack - Insights & Reports Logic
   ============================================= */

const FACTS = [
  { text: "The internet accounts for about 3.7% of global greenhouse emissions. That's similar to the airline industry!", source: "BBC Future" },
  { text: "Recycling one aluminum can saves enough energy to run a TV for three hours.", source: "EPA" },
  { text: "About one-third of all food produced globally is lost or wasted.", source: "UNEP" },
  { text: "A single tree can absorb up to 21 kg (46 lbs) of carbon dioxide per year.", source: "Arbor Day Foundation" },
  { text: "Switching from a daily car commute to cycling can reduce your footprint by 0.5 tons a year.", source: "Climate Action" }
];

let currentFactIdx = 0;

function renderInsights() {
  renderMonthlySummary();
  renderImpactEquivalents();
  renderRecommendations();
  renderFacts();
}

function renderMonthlySummary() {
  const container = document.getElementById('monthlySummary');
  if (!container || appState.logs.length === 0) return;

  // Calculate current month stats
  const now = new Date();
  const currentMonthLogs = appState.logs.filter(l => {
    const d = new Date(l.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });

  if (currentMonthLogs.length === 0) {
    setSafeHTML(container, `<div class="summary-placeholder"><p>No entries logged this month yet.</p></div>`);
    return;
  }

  let mt = 0, me = 0, md = 0, mTotal = 0;
  currentMonthLogs.forEach(l => {
    mt += l.transport;
    me += l.energy;
    md += l.diet;
    mTotal += l.total;
  });

  container.innerHTML = `
    <div class="monthly-stats">
      <div class="monthly-stat">
        <div class="monthly-stat-num">${formatNum(mTotal)}t</div>
        <div class="monthly-stat-label">Total Logged</div>
      </div>
      <div class="monthly-stat">
        <div class="monthly-stat-num">${formatNum(mt)}t</div>
        <div class="monthly-stat-label">Transport</div>
      </div>
      <div class="monthly-stat">
        <div class="monthly-stat-num">${formatNum(me)}t</div>
        <div class="monthly-stat-label">Energy</div>
      </div>
      <div class="monthly-stat">
        <div class="monthly-stat-num">${formatNum(md)}t</div>
        <div class="monthly-stat-label">Diet</div>
      </div>
    </div>
  `;
}

function renderImpactEquivalents() {
  // If no calc, use placeholder 2.0t
  const footprint = appState.hasCompletedCalc ? appState.footprint.total : 2.0;
  
  // Real-world math
  // 1 ton CO2 ~= 48 trees planted for a year
  // 1 ton CO2 ~= 3900 km driven in avg car
  // 1 ton CO2 ~= 1400 kWh of electricity
  // 1 ton CO2 ~= 121,643 smartphones charged
  
  document.getElementById('treesEquiv').textContent = Math.round(footprint * 48).toLocaleString();
  document.getElementById('drivingEquiv').textContent = Math.round(footprint * 3900).toLocaleString();
  document.getElementById('energyEquiv').textContent = Math.round(footprint * 1400).toLocaleString();
  document.getElementById('phoneEquiv').textContent = Math.round(footprint * 121643).toLocaleString();
}

function renderRecommendations() {
  const container = document.getElementById('recommendationsList');
  if (!container) return;

  if (!appState.hasCompletedCalc) return; // Keep placeholder

  const f = appState.footprint;
  let html = '';
  
  // Dynamic rules
  if (f.transport > 2) {
    html += `<div class="rec-item"><span class="rec-icon">🚌</span><div class="rec-text">Your transport emissions are high. Consider public transit or carpooling.</div><div class="rec-impact">-1.2t</div></div>`;
  }
  if (f.diet > 2) {
    html += `<div class="rec-item"><span class="rec-icon">🥦</span><div class="rec-text">Reducing red meat intake by 50% can massively improve your diet footprint.</div><div class="rec-impact">-0.8t</div></div>`;
  }
  if (f.energy > 2) {
    html += `<div class="rec-item"><span class="rec-icon">☀️</span><div class="rec-text">Home energy use is above average. Look into green energy tariffs.</div><div class="rec-impact">-0.6t</div></div>`;
  }
  
  if (html === '') {
    html = `<div class="rec-item"><span class="rec-icon">🌟</span><div class="rec-text">You're doing great! Check the Actions Hub for small lifestyle tweaks to reach Net Zero.</div></div>`;
  }
  
  setSafeHTML(container, html);
}

function renderFacts() {
  const carousel = document.getElementById('factsCarousel');
  const dotsContainer = document.getElementById('factDots');
  if (!carousel || !dotsContainer) return;

  let slidesHtml = '';
  let dotsHtml = '';

  FACTS.forEach((fact, idx) => {
    slidesHtml += `
      <div class="fact-slide ${idx === 0 ? 'active' : ''}" id="factSlide-${idx}">
        <div class="fact-card">
          <p>"${fact.text}"</p>
          <div class="fact-source">Source: ${fact.source}</div>
        </div>
      </div>
    `;
    dotsHtml += `<div class="fact-dot ${idx === 0 ? 'active' : ''}" data-fact-idx="${idx}"></div>`;
  });

  setSafeHTML(carousel, slidesHtml);
  setSafeHTML(dotsContainer, dotsHtml);
}

window.changeFact = function(dir) {
  let newIdx = currentFactIdx + dir;
  if (newIdx < 0) newIdx = FACTS.length - 1;
  if (newIdx >= FACTS.length) newIdx = 0;
  goToFact(newIdx);
}

window.goToFact = function(idx) {
  // Hide current
  const currSlide = document.getElementById(`factSlide-${currentFactIdx}`);
  const dots = document.querySelectorAll('.fact-dot');
  if (currSlide) currSlide.classList.remove('active');
  if (dots[currentFactIdx]) dots[currentFactIdx].classList.remove('active');
  
  // Show new
  currentFactIdx = idx;
  const newSlide = document.getElementById(`factSlide-${currentFactIdx}`);
  if (newSlide) newSlide.classList.add('active');
  if (dots[currentFactIdx]) dots[currentFactIdx].classList.add('active');
}
