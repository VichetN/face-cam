import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

const firebaseConfig = {
  apiKey: "AIzaSyBuwB53w4ZdIn15DpBOBeXvfv7hInbz0Ro",
  authDomain: "employee-management-25c3a.firebaseapp.com",
  projectId: "employee-management-25c3a",
  storageBucket: "employee-management-25c3a.appspot.com",
  messagingSenderId: "340117931202",
  appId: "1:340117931202:web:e50287022b41c8e3a3a75b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage();
// Initialize Firebase Authentication and get a reference to the service
export default app;
