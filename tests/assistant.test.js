/**
 * @jest-environment jsdom
 */

global.appState = {
  hasCompletedCalc: true,
  footprint: { transport: 5.0, diet: 3.0, energy: 2.0, shopping: 1.0, total: 11.0 }
};

global.formatNum = (num) => parseFloat(num.toFixed(2));
global.sanitizeInput = (val) => val;
global.setSafeHTML = jest.fn((el, html) => { el.innerHTML = html; });

document.body.innerHTML = `
  <div id="chatMessages"></div>
  <input id="chatInput" value="Test message" />
  <div id="scenarioResult"></div>
`;

const { 
  generateBotResponse, 
  addChatMessage, 
  showTypingIndicator, 
  removeTypingIndicator,
  SCENARIOS 
} = require('../js/assistant.js');

describe('assistant.js', () => {
  beforeEach(() => {
    document.getElementById('chatMessages').innerHTML = '';
  });

  test('generateBotResponse returns personalized tips', () => {
    const tip = generateBotResponse('give me my tips');
    expect(tip).toContain('transport'); // Highest footprint in mock
    expect(tip).toContain('11'); // Total footprint
  });

  test('generateBotResponse handles transport queries', () => {
    const response = generateBotResponse('how to reduce flight emissions');
    expect(response).toContain('Flying:');
  });

  test('addChatMessage appends to DOM correctly', () => {
    addChatMessage('Hello bot', 'user');
    const msgs = document.querySelectorAll('.chat-message');
    expect(msgs.length).toBe(1);
    expect(msgs[0].classList.contains('user-message')).toBe(true);
  });

  test('showTypingIndicator creates indicator and returns id', () => {
    const id = showTypingIndicator();
    expect(id).toMatch(/typing-\d+/);
    expect(document.getElementById(id)).not.toBeNull();
  });

  test('removeTypingIndicator removes indicator from DOM', () => {
    const id = showTypingIndicator();
    removeTypingIndicator(id);
    expect(document.getElementById(id)).toBeNull();
  });

  test('SCENARIOS calculate savings correctly', () => {
    expect(SCENARIOS.vegan.calculate(global.appState.footprint)).toBe(3.0 * 0.4); // diet * 0.4
    expect(SCENARIOS.ev.calculate(global.appState.footprint)).toBe(5.0 * 0.5); // transport * 0.5
  });
});
