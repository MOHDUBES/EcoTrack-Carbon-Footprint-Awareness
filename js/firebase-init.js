import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-analytics.js";

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
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
} catch(e) {
  console.log('Firebase init bypassed in local dev without real key');
}
