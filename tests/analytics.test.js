require('../js/analytics');

describe('Analytics Tests', () => {
  test('initializes dataLayer and gtag', () => {
    expect(window.dataLayer).toBeDefined();
    expect(window.dataLayer.length).toBeGreaterThan(0);
  });
});
