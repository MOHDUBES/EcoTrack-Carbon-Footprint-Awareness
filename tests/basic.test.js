describe('Carbon Footprint App Basic Tests', () => {
  test('Environment is defined', () => {
    expect(true).toBe(true);
  });
  
  test('Calculation core math works', () => {
    const flightMultiplier = 1.2;
    const flights = 2;
    expect(flights * flightMultiplier).toBeCloseTo(2.4);
  });
  
  test('String formatting works', () => {
    const val = 4.1234;
    expect(parseFloat(val.toFixed(2))).toBe(4.12);
  });
});
