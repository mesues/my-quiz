// Firebase Configuration
// Replace with your actual credentials from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDtGWdc5Z5rtxxjg4-JBtZr-rxTF7grSJw",
  authDomain: "my-simple-quiz.firebaseapp.com",
  projectId: "my-simple-quiz",
  storageBucket: "my-simple-quiz.firebasestorage.app",
  messagingSenderId: "205143468934",
  appId: "1:205143468934:web:0e38b42a92a3f96e889a07"
};

// Initialize Firebase
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
    firebase.initializeApp(firebaseConfig);
} else {
    console.error("Firebase is not configured! Please add your credentials to firebase-config.js");
}
