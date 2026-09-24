/**
 * SUSTAINX - Green Campus Challenge
 * Firebase Configuration & Service Layer
 * 
 * Instructions for Production Deployment:
 * 1. Create a Firebase project at https://console.firebase.google.com
 * 2. Enable Firebase Authentication (Email/Password provider).
 * 3. Create a Cloud Firestore database (in production mode).
 * 4. Paste your web app configuration keys below.
 * 
 * By default, SustainX operates in dynamic local demo mode using DataStore.
 * Once real credentials are supplied below and USE_FIREBASE is set to true,
 * it connects to Cloud Firestore and Firebase Auth.
 */

(function(window) {
  'use strict';

  // Toggle this to true when your Firebase project is ready
  const USE_FIREBASE = false;

  // Replace with your real Firebase Web App configuration:
  const firebaseConfig = {
    apiKey: "AIzaSyD-YOUR_FIREBASE_API_KEY_HERE",
    authDomain: "sustainx-green-campus.firebaseapp.com",
    projectId: "sustainx-green-campus",
    storageBucket: "sustainx-green-campus.appspot.com",
    messagingSenderId: "123456789012",
    appId: "1:123456789012:web:abcdef1234567890"
  };

  const FirebaseBridge = {
    isFirebaseEnabled: USE_FIREBASE,
    config: firebaseConfig,

    init: async function() {
      if (!this.isFirebaseEnabled) {
        console.info('%c[SustainX] Operating in Phase 1 Demo Data Store mode. Real-time dynamic local storage active.', 'color: #238B5A; font-weight: bold;');
        return false;
      }

      try {
        // Dynamic import or check for global firebase SDK if included
        if (typeof firebase !== 'undefined') {
          if (!firebase.apps.length) {
            firebase.initializeApp(firebaseConfig);
          }
          this.auth = firebase.auth();
          this.db = firebase.firestore();
          console.info('Firebase initialized successfully.');
          return true;
        } else {
          console.warn('Firebase SDK scripts not detected on page. Falling back to DataStore.');
          return false;
        }
      } catch (err) {
        console.error('Firebase initialization error:', err);
        return false;
      }
    }
  };

  window.SustainX = window.SustainX || {};
  window.SustainX.Firebase = FirebaseBridge;

})(window);
