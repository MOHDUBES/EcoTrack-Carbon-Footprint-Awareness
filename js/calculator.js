/* global appState, EMISSION_FACTORS, saveState, loadState, formatNum, sanitizeInput, setSafeHTML, toggleLoading, updateDashboardUI, showToast, navigateTo, Chart, checkStreak, nextCalcStep, calculateTotal, saveAndGoToDashboard, filterActions, runScenario, sendSuggestion, changeFact, deleteLogEntry, goToFact, commitAction */
/**
 * @file calculator.js
 * @description Core logic module for EcoTrack platform.
 * Ensures high code quality, modularity, and strict execution.
 */
"use strict";

/* =============================================
   EcoTrack - Carbon Calculator Logic
   ============================================= */

// Real-time calculation listeners
document.addEventListener('DOMContentLoaded', () => {
  const calcInputs = document.querySelectorAll('#page-calculator select, #page-calculator input[type="range"]');
  calcInputs.forEach(input => {
    input.addEventListener('input', (e) => {
      // Update range value display
      if (e.target.type === 'range') {
        document.getElementById(e.target.id + 'Val').textContent = `${e.target.value} km/week`;
      }
      updateRealtimeCalc();
    });
  });
  
  updateRealtimeCalc(); // Initial calc
});

function updateRealtimeCalc() {
  const ef = EMISSION_FACTORS;
  
  // Transport
  const carType = document.getElementById('carType').value;
  const carKm = parseFloat(document.getElementById('carKm').value);
  const flightFreq = document.getElementById('flightFreq').value;
  const pubTrans = document.getElementById('publicTransport').value;
  
  let tScore = (ef.transport.type[carType] || 0) + 
               (carType !== 'none' ? carKm * ef.transport.kmMultiplier : 0) + 
               (ef.transport.flights[flightFreq] || 0) + 
               (ef.transport.public[pubTrans] || 0);
               
  document.getElementById('transportCalc').textContent = `${formatNum(tScore)} tons CO₂/yr`;

  // Diet
  const dietType = document.getElementById('dietType').value;
  const localFood = document.getElementById('localFood').value;
  const foodWaste = document.getElementById('foodWaste').value;
  
  let dScore = (ef.diet.type[dietType] || 0) + 
               (ef.diet.local[localFood] || 0) + 
               (ef.diet.waste[foodWaste] || 0);
               
  document.getElementById('dietCalc').textContent = `${formatNum(dScore)} tons CO₂/yr`;

  // Energy
  const homeType = document.getElementById('homeType').value;
  const energySrc = document.getElementById('energySource').value;
  const heating = document.getElementById('heating').value;
  const habits = document.getElementById('ecoHabits').value;
  
  let baseEnergy = ef.energy.home[homeType] || 1.5;
  let eScore = baseEnergy * (ef.energy.source[energySrc] || 1) * (ef.energy.heating[heating] || 1) * (ef.energy.habits[habits] || 1);
  
  document.getElementById('energyCalc').textContent = `${formatNum(eScore)} tons CO₂/yr`;

  // Shopping
  const clothing = document.getElementById('clothingFreq').value;
  const elec = document.getElementById('electronics').value;
  const online = document.getElementById('onlineShopping').value;
  
  let sScore = (ef.shopping.clothing[clothing] || 0) + 
               (ef.shopping.electronics[elec] || 0) + 
               (ef.shopping.online[online] || 0);
               
  document.getElementById('shoppingCalc').textContent = `${formatNum(sScore)} tons CO₂/yr`;

  return { transport: tScore, diet: dScore, energy: eScore, shopping: sScore };
}

function nextCalcStep(stepNum) {
  // Hide all steps
  document.querySelectorAll('.calc-step').forEach(s => s.classList.remove('active'));
  // Show target
  document.getElementById(`calcStep${stepNum}`).classList.add('active');
  
  // Update progress
  const progressPercent = (stepNum / 4) * 100;
  document.getElementById('calcProgress').style.width = `${progressPercent}%`;
  document.getElementById('calcStep').textContent = `Step ${stepNum} of 4`;
  window.scrollTo(0, 0);
}

function calculateTotal() {
  toggleLoading(true);
  
  setTimeout(() => {
    const scores = updateRealtimeCalc();
    const total = scores.transport + scores.diet + scores.energy + scores.shopping;
    
    // Save to state
    appState.footprint = {
      transport: scores.transport,
      diet: scores.diet,
      energy: scores.energy,
      shopping: scores.shopping,
      total: total
    };
    appState.hasCompletedCalc = true;
    saveState();
    
    // Update Results UI
    document.getElementById('resultTotal').textContent = formatNum(total, 1);
    
    let ratingStr = "";
    if (total < 4) ratingStr = "🟢 Excellent! Below World Average";
    else if (total < 8) ratingStr = "🟡 Moderate! Close to EU Average";
    else ratingStr = "🔴 High! Close to US Average";
    document.getElementById('resultRating').textContent = ratingStr;
    
    // Breakdown
    const bdHtml = `
      <div class="breakdown-item"><div class="breakdown-color" style="background:#3b82f6"></div><span class="breakdown-label">Transport</span><span class="breakdown-value">${formatNum(scores.transport)}t</span></div>
      <div class="breakdown-item"><div class="breakdown-color" style="background:#10b981"></div><span class="breakdown-label">Diet</span><span class="breakdown-value">${formatNum(scores.diet)}t</span></div>
      <div class="breakdown-item"><div class="breakdown-color" style="background:#f59e0b"></div><span class="breakdown-label">Energy</span><span class="breakdown-value">${formatNum(scores.energy)}t</span></div>
      <div class="breakdown-item"><div class="breakdown-color" style="background:#8b5cf6"></div><span class="breakdown-label">Shopping</span><span class="breakdown-value">${formatNum(scores.shopping)}t</span></div>
    `;
    setSafeHTML(document.getElementById('resultBreakdown'), bdHtml);
    
    // Render Chart
    renderResultChart(scores);
    
    toggleLoading(false);
    
    // Hide all steps, show results
    document.querySelectorAll('.calc-step').forEach(s => s.classList.remove('active'));
    document.getElementById('calcResults').classList.add('active');
    document.getElementById('calcProgress').style.width = '100%';
    document.getElementById('calcStep').textContent = 'Calculation Complete';
    
    window.scrollTo(0, 0);
  }, 600);
}

let resultChartInstance = null;
function renderResultChart(scores) {
  const canvas = document.getElementById('resultDonut');
  if (resultChartInstance) resultChartInstance.destroy();
  
  resultChartInstance = new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Transport', 'Diet', 'Energy', 'Shopping'],
      datasets: [{
        data: [scores.transport, scores.diet, scores.energy, scores.shopping],
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'],
        borderWidth: 0,
        hoverOffset: 4
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: function(context) {
              return ` ${context.label}: ${formatNum(context.raw)}t`;
            }
          }
        }
      }
    }
  });
}

function saveAndGoToDashboard() {
  updateDashboardUI();
  showToast('Footprint calculated and saved successfully!');
  navigateTo('dashboard');
}

// Module exports for Jest testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    updateRealtimeCalc,
    calculateTotal,
    nextCalcStep,
    saveAndGoToDashboard
  };
}

