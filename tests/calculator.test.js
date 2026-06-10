/**
 * @jest-environment jsdom
 */

// Mock EMISSION_FACTORS globally since it's required by calculator.js
global.EMISSION_FACTORS = {
  transport: {
    type: { none: 0, electric: 0.5, hybrid: 1.5, small: 2.0, medium: 2.5, large: 3.5 },
    kmMultiplier: 0.005,
    flights: { '0': 0, '1': 0.5, '2': 1.5, '3': 3.0, '4': 5.0 },
    public: { never: 0, sometimes: 0.2, often: 0.5, always: 0.8 }
  },
  diet: {
    type: { vegan: 1.5, vegetarian: 1.7, pescatarian: 2.0, flexitarian: 2.3, omnivore: 2.8, heavy_meat: 3.3 },
    local: { always: -0.2, often: -0.1, sometimes: 0, never: 0.2 },
    waste: { none: -0.1, little: 0, moderate: 0.2, high: 0.5 }
  },
  energy: {
    home: { apartment_small: 1.0, apartment_large: 1.5, house_small: 2.5, house_large: 3.5 },
    source: { renewable: 0.1, green_mix: 0.5, grid: 1.0, gas_heavy: 1.5 },
    heating: { heat_pump: 0.5, district: 0.8, gas: 1.0, oil: 1.5 },
    habits: { high: 0.7, medium: 1.0, low: 1.3 }
  },
  shopping: {
    clothing: { minimal: 0.2, average: 0.6, frequent: 1.2, very_frequent: 2.0 },
    electronics: { none: 0, minimal: 0.2, moderate: 0.5, high: 1.0 },
    online: { rarely: 0, monthly: 0.1, weekly: 0.3, daily: 0.6 }
  }
};

global.formatNum = (num) => parseFloat(num.toFixed(2));
global.appState = { footprint: null, hasCompletedCalc: false };
global.saveState = jest.fn();
global.setSafeHTML = jest.fn();
global.toggleLoading = jest.fn();
global.navigateTo = jest.fn();
global.showToast = jest.fn();
global.updateDashboardUI = jest.fn();

// Mock Chart.js
global.Chart = class {
  constructor() { this.destroy = jest.fn(); }
};

// Setup DOM
document.body.innerHTML = `
  <div id="page-calculator">
    <select id="carType"><option value="medium">Medium</option></select>
    <input type="range" id="carKm" max="1000" value="200" />
    <select id="flightFreq"><option value="2">2</option></select>
    <select id="publicTransport"><option value="sometimes">Sometimes</option></select>
    <span id="transportCalc"></span>

    <select id="dietType"><option value="flexitarian">Flex</option></select>
    <select id="localFood"><option value="often">Often</option></select>
    <select id="foodWaste"><option value="little">Little</option></select>
    <span id="dietCalc"></span>

    <select id="homeType"><option value="apartment_large">Large Apt</option></select>
    <select id="energySource"><option value="grid">Grid</option></select>
    <select id="heating"><option value="gas">Gas</option></select>
    <select id="ecoHabits"><option value="medium">Medium</option></select>
    <span id="energyCalc"></span>

    <select id="clothingFreq"><option value="average">Avg</option></select>
    <select id="electronics"><option value="minimal">Min</option></select>
    <select id="onlineShopping"><option value="monthly">Month</option></select>
    <span id="shoppingCalc"></span>

    <span id="resultTotal"></span>
    <span id="resultRating"></span>
    <div id="resultBreakdown"></div>
    <canvas id="resultDonut"></canvas>
    <div id="calcProgress"></div>
    <div id="calcStep"></div>
    
    <div class="calc-step" id="calcStep1"></div>
    <div class="calc-step" id="calcStep2"></div>
    <div class="calc-step" id="calcStep3"></div>
    <div class="calc-step" id="calcStep4"></div>
    <div class="calc-step" id="calcResults"></div>
  </div>
`;

// Mock window.scrollTo
window.scrollTo = jest.fn();

const { updateRealtimeCalc, calculateTotal, nextCalcStep, saveAndGoToDashboard } = require('../js/calculator.js');

describe('calculator.js', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // Ensure inputs have explicit values
    document.getElementById('carType').value = 'medium';
    document.getElementById('carKm').value = '200';
    document.getElementById('flightFreq').value = '2';
    document.getElementById('publicTransport').value = 'sometimes';
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test('DOMContentLoaded attaches listeners and updates range display', () => {
    document.body.innerHTML += '<span id="carKmVal"></span>';
    document.dispatchEvent(new Event('DOMContentLoaded'));
    const input = document.getElementById('carKm');
    input.value = "150";
    input.dispatchEvent(new Event('input'));
    expect(document.getElementById('carKmVal').textContent).toBe('150 km/week');
  });

  test('updateRealtimeCalc calculates scores accurately', () => {
    const scores = updateRealtimeCalc();
    expect(scores.transport).toBe(5.2); 
    expect(scores.diet).toBe(2.3 + -0.1 + 0); // 2.2
    expect(scores.energy).toBe(1.5 * 1.0 * 1.0 * 1.0); // 1.5
    expect(scores.shopping).toBe(0.6 + 0.2 + 0.1); // 0.9
  });

  test('nextCalcStep updates UI properly', () => {
    nextCalcStep(2);
    expect(document.getElementById('calcStep2').classList.contains('active')).toBe(true);
    expect(document.getElementById('calcProgress').style.width).toBe('50%');
  });

  test('calculateTotal runs and updates state', () => {
    calculateTotal();
    expect(global.toggleLoading).toHaveBeenCalledWith(true);
    jest.advanceTimersByTime(600);
    
    expect(global.appState.hasCompletedCalc).toBe(true);
    expect(global.saveState).toHaveBeenCalled();
    expect(document.getElementById('resultTotal').textContent).toBe("9.8");
    expect(global.toggleLoading).toHaveBeenCalledWith(false);
  });

  test('saveAndGoToDashboard updates UI and navigates', () => {
    saveAndGoToDashboard();
    expect(global.updateDashboardUI).toHaveBeenCalled();
    expect(global.showToast).toHaveBeenCalledWith('Footprint calculated and saved successfully!');
    expect(global.navigateTo).toHaveBeenCalledWith('dashboard');
  });
});
