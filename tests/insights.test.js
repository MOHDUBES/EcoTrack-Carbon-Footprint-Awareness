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
    renderMonthlySummary();
    expect(global.setSafeHTML).toHaveBeenCalled();
  });

  test('renderRecommendations provides recommendations', () => {
    renderRecommendations();
    expect(global.setSafeHTML).toHaveBeenCalled();
  });

  test('renderFacts renders facts correctly', () => {
    renderFacts();
    expect(global.setSafeHTML).toHaveBeenCalled();
  });
});
