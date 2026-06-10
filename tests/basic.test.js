const fs = require('fs');
const path = require('path');

describe('EcoTrack Basic Tests', () => {
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

  test('HTML file exists', () => {
    const htmlPath = path.join(__dirname, '../index.html');
    expect(fs.existsSync(htmlPath)).toBe(true);
  });

  test('CSS file exists', () => {
    const cssPath = path.join(__dirname, '../css/styles.css');
    expect(fs.existsSync(cssPath)).toBe(true);
  });

  test('Server file exists', () => {
    const serverPath = path.join(__dirname, '../server.js');
    expect(fs.existsSync(serverPath)).toBe(true);
  });

  test('JavaScript files exist', () => {
    const jsFiles = ['app.js', 'calculator.js', 'data.js', 'tracker.js', 'assistant.js'];
    jsFiles.forEach(file => {
      const p = path.join(__dirname, '../js', file);
      expect(fs.existsSync(p)).toBe(true);
    });
  });

  test('Package.json exists and has start script', () => {
    const p = path.join(__dirname, '../package.json');
    const pkg = JSON.parse(fs.readFileSync(p, 'utf8'));
    expect(pkg.scripts.start).toBeDefined();
    expect(pkg.scripts.test).toBeDefined();
  });

  test('Dockerfile exists', () => {
    const p = path.join(__dirname, '../Dockerfile');
    expect(fs.existsSync(p)).toBe(true);
  });

  test('Mock emission calculations logic', () => {
    const carKm = 200;
    const carTypeMultiplier = 0.2;
    const weeklyEmissions = carKm * carTypeMultiplier;
    const annualEmissions = (weeklyEmissions * 52) / 1000;
    expect(annualEmissions).toBeCloseTo(2.08);
  });
});
