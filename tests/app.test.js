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

// Mock window.scrollTo
window.scrollTo = jest.fn();
// Mock sanitizeInput
window.sanitizeInput = jest.fn(str => str);

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

  test('setSafeHTML securely sets HTML content', () => {
    const div = document.createElement('div');
    window.setSafeHTML(div, '<p>Test</p><script>alert(1)</script>');
    expect(div.innerHTML).toContain('<p>Test</p>');
    expect(div.innerHTML).not.toContain('script');
    
    // Test tbody logic
    const tbody = document.createElement('tbody');
    window.setSafeHTML(tbody, '<tr><td>Test</td></tr>');
    expect(tbody.innerHTML).toContain('<tr>');
  });

  test('showToast displays notification', () => {
    document.body.innerHTML += '<div id="toast"></div>';
    window.showToast('Test Toast', 'error');
    const toast = document.getElementById('toast');
    expect(toast.textContent).toBe('Test Toast');
    expect(toast.className).toContain('show error');
  });

  test('toggleLoading toggles overlay', () => {
    document.body.innerHTML += '<div id="loadingOverlay"></div>';
    window.toggleLoading(true);
    expect(document.getElementById('loadingOverlay').classList.contains('visible')).toBe(true);
    window.toggleLoading(false);
    expect(document.getElementById('loadingOverlay').classList.contains('visible')).toBe(false);
  });

  test('navigateTo triggers nav link click', () => {
    document.body.innerHTML += '<a class="nav-link" data-page="tracker">Tracker</a>';
    const link = document.querySelector('.nav-link');
    const clickSpy = jest.spyOn(link, 'click');
    window.navigateTo('tracker');
    expect(clickSpy).toHaveBeenCalled();
  });

  test('DOMContentLoaded attaches navigation logic', () => {
    document.body.innerHTML += `
      <div id="navToggle" aria-expanded="false"></div>
      <div class="nav-links">
        <a class="nav-link active" data-page="dashboard">D</a>
        <a class="nav-link" data-page="tracker">T</a>
      </div>
      <div id="page-dashboard" class="page active"></div>
      <div id="page-tracker" class="page" aria-hidden="true"></div>
    `;
    
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    // Toggle menu
    const navToggle = document.getElementById('navToggle');
    navToggle.click();
    expect(navToggle.getAttribute('aria-expanded')).toBe('true');
    
    // Click link
    const trackerLink = document.querySelector('.nav-link[data-page="tracker"]');
    trackerLink.click();
    
    expect(document.getElementById('page-tracker').classList.contains('active')).toBe(true);
  });

  test('renderMiniTrend renders chart correctly', () => {
    global.appState.logs = [{ date: '2024-01-01', total: 2.0 }, { date: '2024-01-02', total: 2.5 }];
    updateDashboardUI();
    expect(document.getElementById('trendEmpty').style.display).toBe('none');
  });
});
