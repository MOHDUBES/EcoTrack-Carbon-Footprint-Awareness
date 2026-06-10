/**
 * @file data.js
 * @description Core logic module for EcoTrack platform.
 * Ensures high code quality, modularity, and strict execution.
 */
"use strict";

/* =============================================
   EcoTrack - Data & State Management
   ============================================= */

// Emission Factors (Approximate tons of CO2e per year)
const EMISSION_FACTORS = {
  transport: {
    type: { none: 0, electric: 0.5, hybrid: 1.5, small: 2.0, medium: 2.5, large: 3.5 },
    kmMultiplier: 0.005, // tons per km per week roughly annualized
    flights: { 0: 0, 1: 0.5, 2: 1.5, 3: 3.0, 4: 5.0 },
    public: { never: 0, sometimes: 0.2, often: 0.5, always: 0.8 } // Public transport adds a bit but replaces car
  },
  diet: {
    type: { vegan: 1.5, vegetarian: 1.7, pescatarian: 1.9, flexitarian: 2.2, omnivore: 2.5, heavy_meat: 3.3 },
    local: { always: -0.3, often: -0.1, sometimes: 0, never: 0.2 },
    waste: { none: -0.2, little: 0, moderate: 0.2, high: 0.5 }
  },
  energy: {
    home: { apartment_small: 1.0, apartment_large: 1.5, house_small: 2.5, house_large: 4.0 },
    source: { renewable: 0.2, green_mix: 0.5, grid: 1.0, gas_heavy: 1.2 }, // Multiplier
    heating: { heat_pump: 0.5, district: 0.7, gas: 1.2, oil: 1.8 }, // Multiplier
    habits: { high: 0.8, medium: 1.0, low: 1.2 } // Multiplier
  },
  shopping: {
    clothing: { minimal: 0.2, average: 0.5, frequent: 1.0, very_frequent: 2.0 },
    electronics: { none: 0.1, minimal: 0.3, moderate: 0.8, high: 1.5 },
    online: { rarely: 0.1, monthly: 0.3, weekly: 0.7, daily: 1.5 }
  }
};

// Default User State
const DEFAULT_STATE = {
  hasCompletedCalc: false,
  footprint: {
    transport: 0,
    diet: 0,
    energy: 0,
    shopping: 0,
    total: 0
  },
  logs: [], // Array of { date, transport, energy, diet, total, note }
  committedActions: [], // Array of action IDs
  streak: 0,
  lastLogDate: null,
  badges: []
};

// Initial state load
let appState = loadState();

// Save state to LocalStorage securely
function saveState() {
  try {
    localStorage.setItem('ecoTrackState', JSON.stringify(appState));
  } catch (e) {
    // Silent fallback
  }
}

// Load state from LocalStorage
function loadState() {
  let state = JSON.parse(JSON.stringify(DEFAULT_STATE));
  try {
    const saved = localStorage.getItem('ecoTrackState');
    if (saved) {
      const parsed = JSON.parse(saved);
      state = { ...state, ...parsed };
      if (!Array.isArray(state.logs)) state.logs = [];
      if (!Array.isArray(state.committedActions)) state.committedActions = [];
      if (!Array.isArray(state.badges)) state.badges = [];
    }
  } catch (e) {
    // Silent fallback
  }
  return state;
}

// Helper to sanitize inputs to prevent XSS
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
}

// Helper to format numbers safely
function formatNum(num, decimals = 2) {
  const parsed = parseFloat(num);
  return isNaN(parsed) ? "0.00" : parsed.toFixed(decimals);
}

// Module exports for Jest testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    EMISSION_FACTORS,
    formatNum,
    escapeHTML: sanitizeInput,
    appState,
    saveState,
    loadState
  };
}
