/**
 * @jest-environment jsdom
 */

global.appState = {
  hasCompletedCalc: true,
  footprint: { total: 5.0, transport: 2.0, diet: 1.0, energy: 1.0, shopping: 1.0 },
  streak: 5,
  logs: []
};
global.formatNum = (num) => parseFloat(num.toFixed(2));
global.checkStreak = jest.fn();

// Mock Chart.js
global.Chart = class {
  constructor() { this.destroy = jest.fn(); }
};

document.body.innerHTML = `
  <span id="gaugeScore"></span>
  <canvas id="gaugeCanvas" width="220" height="220"></canvas>
  <span id="gaugeLabel"></span>
  <span id="stat-transport"></span>
  <span id="stat-diet"></span>
  <span id="stat-energy"></span>
  <span id="stat-shopping"></span>
  <div id="aiInsightText"></div>
  <div id="youBar"></div>
  <span id="youValue"></span>
  <div id="trendEmpty"></div>
  <div id="trendChartContainer" style="display:none;"></div>
  <canvas id="trendChart"></canvas>
  <span id="user-streak"></span>
  <span id="streakNumber"></span>
`;

// Mock Canvas context
HTMLCanvasElement.prototype.getContext = jest.fn(() => ({
  clearRect: jest.fn(),
  beginPath: jest.fn(),
  arc: jest.fn(),
  stroke: jest.fn(),
}));

const { updateDashboardUI, checkStreak } = require('../js/app.js');

describe('app.js', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('updateDashboardUI updates DOM elements correctly', () => {
    updateDashboardUI();
    expect(document.getElementById('gaugeScore').textContent).toBe('5');
    expect(document.getElementById('stat-transport').textContent).toBe('2t');
    expect(document.getElementById('gaugeLabel').textContent).toContain('Good');
  });

  test('checkStreak updates DOM correctly', () => {
    checkStreak();
    expect(document.getElementById('user-streak').textContent).toBe('5 day streak');
    expect(document.getElementById('streakNumber').textContent).toBe('5');
  });
});
