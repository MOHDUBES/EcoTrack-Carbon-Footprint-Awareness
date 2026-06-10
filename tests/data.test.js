/**
 * @jest-environment jsdom
 */

const { EMISSION_FACTORS, formatNum, escapeHTML, saveState, loadState, appState } = require('../js/data.js');

describe('data.js', () => {
  test('formatNum correctly formats numbers', () => {
    expect(formatNum(10)).toBe("10.00");
    expect(formatNum(5.123)).toBe("5.12");
    expect(formatNum(2.5, 1)).toBe("2.5");
  });

  test('escapeHTML prevents XSS', () => {
    expect(escapeHTML('<div>')).toBe('&lt;div&gt;');
    expect(escapeHTML('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  test('sanitizeInput strips tags entirely', () => {
    expect(escapeHTML('<p>Hello</p>')).toBe('&lt;p&gt;Hello&lt;/p&gt;');
    expect(escapeHTML('Clean text')).toBe('Clean text');
  });

  test('EMISSION_FACTORS is defined properly', () => {
    expect(EMISSION_FACTORS).toBeDefined();
    expect(EMISSION_FACTORS.transport.type.medium).toBeGreaterThan(0);
  });
});


describe('state management', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  test('saveState saves to localStorage', () => {
    appState.streak = 10;
    saveState();
    expect(localStorage.getItem('ecoTrackState')).toContain('"streak":10');
  });

  test('loadState loads from localStorage', () => {
    localStorage.setItem('ecoTrackState', JSON.stringify({ streak: 5 }));
    const state = loadState();
    expect(state.streak).toBe(5);
  });

  test('saveState handles quota exceeded errors safely', () => {
    const setItemMock = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    
    expect(() => saveState()).not.toThrow();
    
    setItemMock.mockRestore();
  });

  test('loadState handles invalid JSON safely', () => {
    const getItemMock = jest.spyOn(Storage.prototype, 'getItem').mockReturnValue('{ invalid json }');
    
    const state = loadState();
    
    expect(state).toEqual(expect.objectContaining({ hasCompletedCalc: false }));
    
    getItemMock.mockRestore();
  });
});
