// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDzaQioeYWrKezK2h80koESMX7xo3_gfeY",
    authDomain: "map-tracker-205ba.firebaseapp.com",
    projectId: "map-tracker-205ba",
    storageBucket: "map-tracker-205ba.firebasestorage.app",
    messagingSenderId: "1080885639403",
    appId: "1:1080885639403:web:bed41c689552379ab1e6ae"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase authentication
export const auth = getAuth(app);