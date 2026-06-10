describe('Events Tests', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div data-nav="dashboard"></div>
      <div data-step="1"></div>
      <button id="btn-calculate-total"></button>
      <button id="btn-save-dashboard"></button>
      <div data-filter="all"></div>
      <div data-scenario="vegan"></div>
      <div class="sugg-btn"></div>
      <div data-fact-dir="1"></div>
      <div data-delete-log="123"></div>
      <div data-fact-idx="0"></div>
      <div data-commit-action="bike"></div>
    `;
    global.navigateTo = jest.fn();
    global.nextCalcStep = jest.fn();
    global.calculateTotal = jest.fn();
    global.saveAndGoToDashboard = jest.fn();
    global.filterActions = jest.fn();
    global.runScenario = jest.fn();
    global.sendSuggestion = jest.fn();
    global.changeFact = jest.fn();
    global.deleteLogEntry = jest.fn();
    global.goToFact = jest.fn();
    global.commitAction = jest.fn();

    jest.isolateModules(() => {
      require('../js/events');
    });
  });

  test('attaches DOM listeners and handles clicks', () => {
    document.dispatchEvent(new Event('DOMContentLoaded'));
    
    document.querySelector('[data-nav]').click();
    expect(global.navigateTo).toHaveBeenCalled();

    document.querySelector('[data-step]').click();
    expect(global.nextCalcStep).toHaveBeenCalled();

    document.getElementById('btn-calculate-total').click();
    expect(global.calculateTotal).toHaveBeenCalled();

    document.getElementById('btn-save-dashboard').click();
    expect(global.saveAndGoToDashboard).toHaveBeenCalled();

    document.querySelector('[data-filter]').click();
    expect(global.filterActions).toHaveBeenCalled();

    document.querySelector('[data-scenario]').click();
    expect(global.runScenario).toHaveBeenCalled();

    document.querySelector('.sugg-btn').click();
    expect(global.sendSuggestion).toHaveBeenCalled();

    document.querySelector('[data-fact-dir]').click();
    expect(global.changeFact).toHaveBeenCalled();

    document.querySelector('[data-delete-log]').click();
    expect(global.deleteLogEntry).toHaveBeenCalled();

    document.querySelector('[data-fact-idx]').click();
    expect(global.goToFact).toHaveBeenCalled();

    document.querySelector('[data-commit-action]').click();
    expect(global.commitAction).toHaveBeenCalled();
  });
});
