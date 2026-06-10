describe('Firebase Init Tests', () => {
  test('it runs without crashing', () => {
    const init = require('../js/firebase-init');
    expect(init.firebaseConfig).toBeDefined();
  });
});
