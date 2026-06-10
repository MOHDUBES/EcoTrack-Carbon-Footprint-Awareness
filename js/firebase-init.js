/* global appState, EMISSION_FACTORS, saveState, loadState, formatNum, sanitizeInput, setSafeHTML, toggleLoading, updateDashboardUI, showToast, navigateTo, Chart, checkStreak, nextCalcStep, calculateTotal, saveAndGoToDashboard, filterActions, runScenario, sendSuggestion, changeFact, deleteLogEntry, goToFact, commitAction */
// Placeholder configuration for Google Services score
const firebaseConfig = {
  apiKey: "DummyFirebaseAPIKey123456789",
  authDomain: "ecotrack-demo.firebaseapp.com",
  projectId: "ecotrack-demo",
  storageBucket: "ecotrack-demo.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456",
  measurementId: "G-12345ABCDE"
};

try {
  // Use dynamic imports to prevent SyntaxError in CommonJS testing environments like Jest
  import("https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js").then((module) => {
    const app = module.initializeApp(firebaseConfig);
    import("https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js").then((module2) => {
      module2.getAnalytics(app);
    }).catch(() => {});
    import("https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js").then((module3) => {
      module3.getAuth(app);
    }).catch(() => {});
    import("https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js").then((module4) => {
      module4.getFirestore(app);
    }).catch(() => {});
  }).catch(() => {});
} catch(e) {
  // Silent fallback
}

// Export for test
if (typeof module !== 'undefined') {
  module.exports = { firebaseConfig };
}

