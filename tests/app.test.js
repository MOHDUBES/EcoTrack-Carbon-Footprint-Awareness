const fs = require('fs');
const path = require('path');

// Setup variables
const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');

// Load modules
const data = require('../js/data.js');
const { formatNum, escapeHTML, EMISSION_FACTORS } = data;

describe('EcoTrack Core Application Tests', () => {

  beforeEach(() => {
    // Reset HTML before each test
    document.open();
    document.write(html);
    document.close();

    // Mock localStorage
    const localStorageMock = (function() {
      let store = {};
      return {
        getItem: function(key) { return store[key] || null; },
        setItem: function(key, value) { store[key] = value.toString(); },
        clear: function() { store = {}; },
        removeItem: function(key) { delete store[key]; }
      };
    })();
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Inject global dependencies required by modules
    global.EMISSION_FACTORS = EMISSION_FACTORS;
    global.formatNum = formatNum;
  });

  describe('Data Utilities (data.js)', () => {
    test('formatNum properly formats numbers', () => {
      expect(formatNum(10.1234)).toBe('10.12');
      expect(formatNum(10)).toBe('10.00');
      expect(formatNum(10.1234, 1)).toBe('10.1');
    });

    test('escapeHTML properly escapes unsafe tags', () => {
      const unsafe = '<script>alert("XSS")</script>';
      const safe = escapeHTML(unsafe);
      expect(safe).not.toContain('<script>');
      expect(safe).toContain('&lt;script&gt;');
    });
    
    test('EMISSION_FACTORS is correctly defined', () => {
      expect(EMISSION_FACTORS).toBeDefined();
      expect(EMISSION_FACTORS.transport).toBeDefined();
      expect(EMISSION_FACTORS.diet).toBeDefined();
    });
  });

  describe('Calculator Logic (calculator.js)', () => {
    let calculator;
    
    beforeEach(() => {
      calculator = require('../js/calculator.js');
      // Set default input values
      document.getElementById('carType').value = 'petrol';
      document.getElementById('carKm').value = '100';
      document.getElementById('flightFreq').value = 'none';
      document.getElementById('publicTransport').value = 'rarely';
      
      document.getElementById('dietType').value = 'heavy_meat';
      document.getElementById('localFood').value = 'never';
      document.getElementById('foodWaste').value = 'high';
      
      document.getElementById('homeType').value = 'apartment';
      document.getElementById('energySource').value = 'fossil';
      document.getElementById('heating').value = 'gas';
      document.getElementById('ecoHabits').value = 'average';
      
      document.getElementById('clothingFreq').value = 'average';
      document.getElementById('electronics').value = 'moderate';
      document.getElementById('onlineShopping').value = 'monthly';
    });

    test('updateRealtimeCalc computes correct scores based on DOM', () => {
      const scores = calculator.updateRealtimeCalc();
      expect(scores.transport).toBeGreaterThan(0);
      expect(scores.diet).toBeGreaterThan(0);
      expect(scores.energy).toBeGreaterThan(0);
      expect(scores.shopping).toBeGreaterThan(0);
      
      // Ensure UI is updated
      expect(document.getElementById('transportCalc').textContent).toContain('tons CO₂/yr');
    });
  });

  describe('Tracker Logic (tracker.js)', () => {
    let tracker;

    beforeEach(() => {
      tracker = require('../js/tracker.js');
      global.appState = { logs: [], badges: [], committedActions: [], streak: 0 };
      global.formatDate = (date) => '2026-06-10'; // mock
      global.setSafeHTML = (el, html) => { el.innerHTML = html; };
      global.sanitizeInput = (str) => str;
      global.showToast = jest.fn();
      global.saveState = jest.fn();
      global.checkBadges = jest.fn();
      global.checkStreak = jest.fn();
      global.renderTrackerChart = jest.fn();
      global.updateDashboardUI = jest.fn();
      global.Chart = jest.fn();
    });

    test('addLogEntry calculates total correctly and adds to state', () => {
      // Setup DOM inputs
      document.getElementById('logDate').value = '2026-06-10';
      document.getElementById('logTransport').value = '2.5';
      document.getElementById('logDiet').value = '1.5';
      document.getElementById('logEnergy').value = '3.0';

      tracker.addLogEntry();

      expect(global.appState.logs.length).toBe(1);
      const log = global.appState.logs[0];
      expect(log.total).toBeCloseTo(7.0);
      expect(global.showToast).toHaveBeenCalledWith("Entry logged successfully!");
    });
    
    test('updateStreak computes consecutive days correctly', () => {
      // Mock past logs
      global.appState.logs = [
        { date: new Date().toISOString() }, // Today
        { date: new Date(Date.now() - 86400000).toISOString() }, // Yesterday
        { date: new Date(Date.now() - 86400000 * 2).toISOString() } // 2 days ago
      ];
      
      tracker.updateStreak(new Date().toISOString());
      expect(global.appState.streak).toBeGreaterThan(0);
    });
  });
});
