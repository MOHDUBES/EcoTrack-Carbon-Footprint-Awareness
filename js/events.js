/* global appState, EMISSION_FACTORS, saveState, loadState, formatNum, sanitizeInput, setSafeHTML, toggleLoading, updateDashboardUI, showToast, navigateTo, Chart, checkStreak, nextCalcStep, calculateTotal, saveAndGoToDashboard, filterActions, runScenario, sendSuggestion, changeFact, deleteLogEntry, goToFact, commitAction */
/**
 * @file events.js
 * @description Core logic module for EcoTrack platform.
 * Ensures high code quality, modularity, and strict execution.
 */
"use strict";


document.addEventListener('DOMContentLoaded', () => {
  // Navigation elements
  document.querySelectorAll('[data-nav]').forEach(el => {
    el.addEventListener('click', (e) => {
      // Find closest element with data-nav (e.target might be child)
      const target = e.target.closest('[data-nav]');
      if (target) navigateTo(target.dataset.nav);
    });
  });

  // Calculator steps
  document.querySelectorAll('[data-step]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = e.target.closest('[data-step]');
      if (target) nextCalcStep(parseInt(target.dataset.step));
    });
  });

  // Calculate Total
  const btnCalculateTotal = document.getElementById('btn-calculate-total');
  if (btnCalculateTotal) {
    btnCalculateTotal.addEventListener('click', calculateTotal);
  }

  // Save Dashboard
  const btnSaveDashboard = document.getElementById('btn-save-dashboard');
  if (btnSaveDashboard) {
    btnSaveDashboard.addEventListener('click', saveAndGoToDashboard);
  }

  // Filter Actions
  document.querySelectorAll('[data-filter]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = e.target.closest('[data-filter]');
      if (target) filterActions(target.dataset.filter, target);
    });
  });

  // Run Scenarios
  document.querySelectorAll('[data-scenario]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = e.target.closest('[data-scenario]');
      if (target) runScenario(target.dataset.scenario);
    });
  });

  // Send Suggestion Chips
  document.querySelectorAll('.sugg-btn').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = e.target.closest('.sugg-btn');
      if (target) sendSuggestion(target);
    });
  });

  // Change Fact (Carousel)
  document.querySelectorAll('[data-fact-dir]').forEach(el => {
    el.addEventListener('click', (e) => {
      const target = e.target.closest('[data-fact-dir]');
      if (target) changeFact(parseInt(target.dataset.factDir));
    });
  });

  // Delete Log Entry
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-delete-log]');
    if (target) {
      if (typeof deleteLogEntry === 'function') {
        deleteLogEntry(target.dataset.deleteLog);
      }
    }
  });

  // Fact Dots
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-fact-idx]');
    if (target) {
      if (typeof goToFact === 'function') {
        goToFact(parseInt(target.dataset.factIdx));
      }
    }
  });

  // Commit Action
  document.addEventListener('click', (e) => {
    const target = e.target.closest('[data-commit-action]');
    if (target) {
      if (typeof commitAction === 'function') {
        commitAction(target.dataset.commitAction, target);
      }
    }
  });
});

