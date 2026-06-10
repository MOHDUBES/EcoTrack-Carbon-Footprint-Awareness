/**
 * @file tracker.js
 * @description Core logic module for EcoTrack platform.
 * Ensures high code quality, modularity, and strict execution.
 */
"use strict";

/* =============================================
   EcoTrack - Progress Tracker Logic
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
  // Set default date to today
  const today = new Date().toISOString().split('T')[0];
  const dateInput = document.getElementById('logDate');
  if (dateInput) dateInput.value = today;

  // Handle form submission
  const logForm = document.getElementById('trackerForm');
  if (logForm) {
    logForm.addEventListener('submit', (e) => {
      e.preventDefault();
      addLogEntry();
    });
  }
});

function addLogEntry() {
  const date = document.getElementById('logDate').value;
  const transport = parseFloat(document.getElementById('logTransport').value) || 0;
  const energy = parseFloat(document.getElementById('logEnergy').value) || 0;
  const diet = parseFloat(document.getElementById('logDiet').value) || 0;
  const note = sanitizeInput(document.getElementById('logNote').value) || '';

  if (!date) {
    showToast('Please select a date', 'error');
    return;
  }

  const total = transport + energy + diet;
  if (total <= 0 && note === '') {
    showToast('Please enter some values or a note to log.', 'warning');
    return;
  }

  // Check if date already exists
  const existingIdx = appState.logs.findIndex(l => l.date === date);
  if (existingIdx !== -1) {
    appState.logs[existingIdx] = { date, transport, energy, diet, total, note };
    showToast('Entry updated successfully');
  } else {
    appState.logs.push({ date, transport, energy, diet, total, note });
    showToast('Entry logged successfully!');
  }

  // Sort logs by date desc
  appState.logs.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Update streak
  updateStreak(date);

  // Check for badges
  checkBadges();

  saveState();
  
  // Refresh UI
  renderLogTable();
  renderTrackerChart();
  
  // Reset form except date
  document.getElementById('logTransport').value = '';
  document.getElementById('logEnergy').value = '';
  document.getElementById('logDiet').value = '';
  document.getElementById('logNote').value = '';
  
  // Update dashboard mini trend if on dashboard
  updateDashboardUI();
}

function deleteLogEntry(date) {
  if (confirm(`Are you sure you want to delete the entry for ${date}?`)) {
    appState.logs = appState.logs.filter(l => l.date !== date);
    saveState();
    renderLogTable();
    renderTrackerChart();
    updateDashboardUI();
    showToast('Entry deleted');
  }
}

function renderLogTable() {
  const tbody = document.getElementById('logTableBody');
  if (!tbody) return;

  if (appState.logs.length === 0) {
    setSafeHTML(tbody, '<tr class="empty-row"><td colspan="7">No entries yet. Start logging above!</td></tr>');
    return;
  }

  let html = '';
  appState.logs.forEach(log => {
    html += `
      <tr>
        <td><strong>${log.date}</strong></td>
        <td>${formatNum(log.transport)}</td>
        <td>${formatNum(log.energy)}</td>
        <td>${formatNum(log.diet)}</td>
        <td style="color:var(--primary); font-weight:bold;">${formatNum(log.total)}</td>
        <td>${log.note}</td>
        <td>
          <button class="delete-btn" data-delete-log="${log.date}" aria-label="Delete entry">🗑️ Delete</button>
        </td>
      </tr>
    `;
  });
  setSafeHTML(tbody, html);
}

let trackerChartInstance = null;
function renderTrackerChart() {
  const canvas = document.getElementById('progressChart');
  const emptyMsg = document.getElementById('progressEmpty');
  if (!canvas || !emptyMsg) return;

  if (appState.logs.length === 0) {
    if (document.getElementById('progressChartContainer')) {
      document.getElementById('progressChartContainer').style.display = 'none';
    } else {
      canvas.classList.remove('visible');
    }
    emptyMsg.style.display = 'block';
    return;
  }

  if (document.getElementById('progressChartContainer')) {
    document.getElementById('progressChartContainer').style.display = 'block';
  } else {
    canvas.classList.add('visible');
  }
  emptyMsg.style.display = 'none';

  // Sort asc for chart
  const ascLogs = [...appState.logs].sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-14); // Last 14 entries
  
  const labels = ascLogs.map(l => {
    const d = new Date(l.date);
    return `${d.getMonth()+1}/${d.getDate()}`;
  });

  if (trackerChartInstance) trackerChartInstance.destroy();

  trackerChartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [
        { label: 'Transport', data: ascLogs.map(l => l.transport), backgroundColor: '#3b82f6' },
        { label: 'Diet', data: ascLogs.map(l => l.diet), backgroundColor: '#10b981' },
        { label: 'Energy', data: ascLogs.map(l => l.energy), backgroundColor: '#f59e0b' }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: { stacked: true },
        y: { stacked: true, min: 0 }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: function(context) { return ` ${context.dataset.label}: ${formatNum(context.raw)}t`; },
            footer: function(tooltipItems) {
              let total = 0;
              tooltipItems.forEach(item => total += item.raw);
              return `Total: ${formatNum(total)}t`;
            }
          }
        }
      }
    }
  });
}

function updateStreak(logDateStr) {
  const logDate = new Date(logDateStr);
  logDate.setHours(0,0,0,0);
  
  const today = new Date();
  today.setHours(0,0,0,0);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  let lastDate = appState.lastLogDate ? new Date(appState.lastLogDate) : null;
  if (lastDate) lastDate.setHours(0,0,0,0);

  if (!lastDate) {
    appState.streak = 1;
  } else if (logDate.getTime() === lastDate.getTime()) {
    // Already logged today
  } else if (logDate.getTime() === yesterday.getTime() || (logDate.getTime() === today.getTime() && lastDate.getTime() === yesterday.getTime())) {
    // Consecutive day
    appState.streak += 1;
  } else if (logDate.getTime() < lastDate.getTime()) {
    // Logging past date, don't update streak
  } else {
    // Streak broken
    appState.streak = 1;
  }

  appState.lastLogDate = logDateStr;
  
  document.getElementById('streakNumber').textContent = appState.streak;
  checkStreak(); // Update dashboard
}

const BADGES = [
  { id: 'first_log', icon: '🌱', name: 'First Seed', desc: 'Logged first entry', check: () => appState.logs.length >= 1 },
  { id: 'streak_3', icon: '🔥', name: 'On Fire', desc: '3 day streak', check: () => appState.streak >= 3 },
  { id: 'streak_7', icon: '⭐', name: 'Consistency', desc: '7 day streak', check: () => appState.streak >= 7 },
  { id: 'calc_done', icon: '🧮', name: 'Awareness', desc: 'Completed calculator', check: () => appState.hasCompletedCalc },
  { id: 'action_1', icon: '🌿', name: 'Action Taker', desc: 'Committed to 1 action', check: () => appState.committedActions.length >= 1 },
  { id: 'action_5', icon: '🌍', name: 'Earth Hero', desc: 'Committed to 5 actions', check: () => appState.committedActions.length >= 5 }
];

function checkBadges() {
  BADGES.forEach(badge => {
    if (!appState.badges.includes(badge.id) && badge.check()) {
      appState.badges.push(badge.id);
      showToast(`🏆 New Badge Unlocked: ${badge.name}!`);
    }
  });
  renderBadges();
}

function renderBadges() {
  const container = document.getElementById('badgesGrid');
  if (!container) return;

  let html = '';
  BADGES.forEach(badge => {
    const earned = appState.badges.includes(badge.id);
    html += `
      <div class="badge-item ${earned ? 'earned' : ''}" title="${badge.desc}">
        <span aria-hidden="true">${earned ? badge.icon : '🔒'}</span>
        <span>${badge.name}</span>
      </div>
    `;
  });
  setSafeHTML(container, html);
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
  renderLogTable();
  renderBadges();
});
