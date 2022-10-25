import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object

const firebaseConfig = {
  apiKey: "AIzaSyCKoVGykRCHWMZb56-Jvid1B8Et34IB2tU",
  authDomain: "cci-employee-record.firebaseapp.com",
  projectId: "cci-employee-record",
  storageBucket: "cci-employee-record.appspot.com",
  messagingSenderId: "802351842468",
  appId: "1:802351842468:web:860abf63f13bd893cf5231"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const storage = getStorage();
// Initialize Firebase Authentication and get a reference to the service
export default app;
