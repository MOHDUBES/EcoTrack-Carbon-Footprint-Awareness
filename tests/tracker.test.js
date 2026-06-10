/**
 * @jest-environment jsdom
 */

global.appState = {
  logs: [],
  streak: 0,
  lastLogDate: null,
  badges: [],
  committedActions: []
};

global.showToast = jest.fn();
global.saveState = jest.fn();
global.setSafeHTML = jest.fn();
global.updateDashboardUI = jest.fn();
global.checkStreak = jest.fn();
global.formatNum = (num) => parseFloat(num.toFixed(2));
global.sanitizeInput = (val) => val; // Dummy sanitize

// Mock Chart.js
global.Chart = class {
  constructor() { this.destroy = jest.fn(); }
};

document.body.innerHTML = `
  <div id="page-tracker">
    <form id="trackerForm">
      <input type="date" id="logDate" value="2024-01-01" />
      <input type="number" id="logTransport" value="1.5" />
      <input type="number" id="logEnergy" value="0.8" />
      <input type="number" id="logDiet" value="0.5" />
      <input type="text" id="logNote" value="Test note" />
    </form>
    <span id="streakNumber"></span>
    <div id="badgesGrid"></div>
    <tbody id="logTableBody"></tbody>
    <div id="progressChartContainer"></div>
    <canvas id="progressChart"></canvas>
    <p id="progressEmpty"></p>
  </div>
`;

const { addLogEntry, updateStreak, renderLogTable } = require('../js/tracker.js');

describe('tracker.js', () => {
  beforeEach(() => {
    global.appState.logs = [];
    global.appState.streak = 0;
    global.appState.lastLogDate = null;
    jest.clearAllMocks();
    
    // Reset DOM values
    document.getElementById('logDate').value = "2024-01-01";
    document.getElementById('logTransport').value = "1.5";
    document.getElementById('logEnergy').value = "0.8";
    document.getElementById('logDiet').value = "0.5";
    document.getElementById('logNote').value = "Test note";
  });

  test('addLogEntry adds a valid log and updates streak', () => {
    addLogEntry();
    
    expect(global.appState.logs.length).toBe(1);
    expect(global.appState.logs[0].total).toBe(2.8); // 1.5 + 0.8 + 0.5
    expect(global.appState.logs[0].note).toBe("Test note");
    expect(global.saveState).toHaveBeenCalled();
    expect(global.updateDashboardUI).toHaveBeenCalled();
    
    // Check form reset
    expect(document.getElementById('logTransport').value).toBe('');
    expect(document.getElementById('logNote').value).toBe('');
  });

  test('updateStreak handles consecutive days', () => {
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Initial log
    updateStreak(yesterday);
    expect(global.appState.streak).toBe(1);
    
    // Consecutive log
    updateStreak(today);
    expect(global.appState.streak).toBe(2);
    expect(document.getElementById('streakNumber').textContent).toBe('2');
  });

  test('addLogEntry updates existing log for same date', () => {
    addLogEntry(); // Date: 2024-01-01
    
    document.getElementById('logTransport').value = "2.0";
    document.getElementById('logDate').value = "2024-01-01";
    addLogEntry(); // Update same date
    
    expect(global.appState.logs.length).toBe(1);
    expect(global.appState.logs[0].transport).toBe(2.0);
    expect(global.showToast).toHaveBeenCalledWith(expect.stringContaining('updated'));
  });
});
