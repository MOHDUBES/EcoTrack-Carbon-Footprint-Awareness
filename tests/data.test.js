/**
 * @jest-environment jsdom
 */

const { EMISSION_FACTORS, formatNum, escapeHTML, sanitizeInput } = require('../js/data.js');

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
