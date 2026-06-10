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

  test('generateBotResponse handles all categories and edge cases', () => {
    // Diet
    let tip = generateBotResponse('how to improve my diet');
    expect(tip).toContain('Diet:');
    
    // Energy
    tip = generateBotResponse('solar energy');
    expect(tip).toContain('Home Energy:');
    
    // Default
    tip = generateBotResponse('hello');
    expect(tip).toContain('simple AI assistant');
    
    // Explain
    tip = generateBotResponse('what is a footprint');
    expect(tip).toContain('simple AI assistant');
  });

  test('generateBotResponse personalized tip when calc not done', () => {
    global.appState.hasCompletedCalc = false;
    expect(generateBotResponse('my tips')).toContain('complete the Carbon Calculator');
    global.appState.hasCompletedCalc = true;
  });

  test('generateBotResponse handles max sources correctly', () => {
    global.appState.footprint = { transport: 1, diet: 10, energy: 1, shopping: 1, total: 13 };
    expect(generateBotResponse('my tips')).toContain('red meat');

    global.appState.footprint = { transport: 1, diet: 1, energy: 10, shopping: 1, total: 13 };
    expect(generateBotResponse('my tips')).toContain('green energy');

    global.appState.footprint = { transport: 1, diet: 1, energy: 1, shopping: 10, total: 13 };
    expect(generateBotResponse('my tips')).toContain('secondhand');
  });

  test('handleUserMessage processes message and calls API', () => {
    jest.useFakeTimers();
    document.getElementById('chatInput').value = "Test msg";
    
    global.fetch = jest.fn(() => Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ reply: "API Reply" })
    }));
    
    const { handleUserMessage } = require('../js/assistant.js');
    handleUserMessage();
    
    jest.advanceTimersByTime(600);
    expect(global.fetch).toHaveBeenCalled();
    jest.useRealTimers();
  });

  test('handleUserMessage falls back to local AI on API error', async () => {
    jest.useFakeTimers();
    document.getElementById('chatInput').value = "Test msg";
    
    global.fetch = jest.fn(() => Promise.reject(new Error('API failed')));
    
    const { handleUserMessage } = require('../js/assistant.js');
    handleUserMessage(); // No await needed, fake timers will resolve the promise chain after advance
    
    // Need to flush promises in Jest to test async catch block
    await Promise.resolve();
    jest.advanceTimersByTime(600);
    await Promise.resolve(); // allow catch to run
    
    const msgs = document.querySelectorAll('.chat-message');
    expect(msgs.length).toBeGreaterThan(0);
    jest.useRealTimers();
  });

  test('sendSuggestion triggers message', () => {
    document.body.innerHTML += '<button id="sugBtn">Test Suggestion</button>';
    window.sendSuggestion(document.getElementById('sugBtn'));
    expect(document.getElementById('chatInput').value).toBe(""); // Cleared by handleUserMessage
  });

  test('runScenario updates DOM correctly', () => {
    window.runScenario('vegan');
    expect(document.getElementById('scenarioResult').classList.contains('visible')).toBe(true);
    
    global.appState.hasCompletedCalc = false;
    window.runScenario('vegan');
    expect(document.getElementById('scenarioResult').innerHTML).toContain('⚠️');
    global.appState.hasCompletedCalc = true;
  });

  test('DOMContentLoaded attaches assistant listeners', () => {
    document.body.innerHTML += '<form id="chatForm"></form>';
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    const form = document.getElementById('chatForm');
    const submitEvent = new Event('submit', { cancelable: true });
    form.dispatchEvent(submitEvent);
    
    expect(submitEvent.defaultPrevented).toBe(true);
  });
});
