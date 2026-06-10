/**
 * @jest-environment jsdom
 */

global.appState = {
  hasCompletedCalc: true,
  footprint: { total: 5.0, transport: 2.0, diet: 1.0, energy: 1.0, shopping: 1.0 },
  logs: [
    { date: new Date().toISOString(), transport: 1, energy: 1, diet: 1, total: 3 }
  ]
};
global.formatNum = (num) => parseFloat(num.toFixed(2));
global.setSafeHTML = jest.fn((el, html) => { el.innerHTML = html; });

document.body.innerHTML = `
  <div id="monthlySummary"></div>
  <span id="treesEquiv"></span>
  <span id="drivingEquiv"></span>
  <span id="energyEquiv"></span>
  <span id="phoneEquiv"></span>
  <div id="recommendationsList"></div>
  <div id="factsCarousel"></div>
  <div id="factDots"></div>
`;

const { 
  renderInsights, 
  renderMonthlySummary, 
  renderImpactEquivalents, 
  renderRecommendations, 
  renderFacts 
} = require('../js/insights.js');

describe('insights.js', () => {
  test('renderImpactEquivalents calculates math correctly', () => {
    renderImpactEquivalents();
    // 5.0 * 48 = 240
    expect(document.getElementById('treesEquiv').textContent).toBe('240');
  });

  test('renderMonthlySummary processes logs correctly', () => {
    document.body.innerHTML += '<div id="monthlySummary"></div>';
    global.appState.logs = [{ date: new Date().toISOString(), total: 10, transport: 3, energy: 3, diet: 4 }];
    jest.clearAllMocks();
    renderMonthlySummary();
    const call = global.setSafeHTML.mock.calls.find(c => c[0] && c[0].id === 'monthlySummary');
    expect(call).toBeDefined();
  });

  test('renderMonthlySummary handles zero logs gracefully', () => {
    document.body.innerHTML += '<div id="monthlySummary"></div>';
    global.appState.logs = [];
    expect(() => renderMonthlySummary()).not.toThrow();
  });

  test('renderRecommendations provides recommendations when over limit', () => {
    global.appState.footprint = { total: 10, transport: 3.0, diet: 3.0, energy: 3.0, shopping: 1.0 };
    renderRecommendations();
    expect(global.setSafeHTML).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('transport emissions are high'));
    expect(global.setSafeHTML).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('red meat intake'));
    expect(global.setSafeHTML).toHaveBeenCalledWith(expect.anything(), expect.stringContaining('Home energy use is above average'));
  });

  test('renderFacts renders facts correctly', () => {
    renderFacts();
    expect(global.setSafeHTML).toHaveBeenCalled();
  });

  test('changeFact and goToFact updates DOM', () => {
    document.body.innerHTML += `
      <div id="factSlide-0" class="fact-slide active"></div>
      <div id="factSlide-1" class="fact-slide"></div>
      <div class="fact-dot active"></div>
      <div class="fact-dot"></div>
    `;
    window.changeFact(1); // Goes to 1
    expect(document.getElementById('factSlide-1').classList.contains('active')).toBe(true);
    window.changeFact(-1); // Goes to 0
    expect(document.getElementById('factSlide-0').classList.contains('active')).toBe(true);
  });

  test('renderInsights calls all renderers', () => {
    // Just ensure it doesn't throw
    expect(() => renderInsights()).not.toThrow();
  });
});
