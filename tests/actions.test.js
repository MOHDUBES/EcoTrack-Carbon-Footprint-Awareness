/**
 * @jest-environment jsdom
 */

global.appState = {
  committedActions: []
};

global.formatNum = (num) => parseFloat(num.toFixed(2));
global.setSafeHTML = jest.fn((el, html) => { el.innerHTML = html; });
global.showToast = jest.fn();
global.saveState = jest.fn();
global.checkBadges = jest.fn();

document.body.innerHTML = `
  <div id="actionsGrid"></div>
  <span id="totalSaved"></span>
  <div class="filter-tab active" data-filter="all">All</div>
`;

const { renderActions, ECO_ACTIONS } = require('../js/actions.js');

describe('actions.js', () => {
  beforeEach(() => {
    global.appState.committedActions = [];
    jest.clearAllMocks();
  });

  test('renderActions displays all actions', () => {
    renderActions('all');
    expect(document.getElementById('actionsGrid').childNodes.length).toBeGreaterThan(0);
    expect(document.getElementById('totalSaved').textContent).toContain('0');
  });

  test('commitAction adds action to state and recalculates', () => {
    // Simulate commitAction which is added to window
    window.commitAction(ECO_ACTIONS[0].id, document.createElement('button'));
    expect(global.appState.committedActions).toContain(ECO_ACTIONS[0].id);
    expect(global.showToast).toHaveBeenCalled();
    expect(global.saveState).toHaveBeenCalled();
  });
});
