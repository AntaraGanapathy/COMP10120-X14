<<<<<<< HEAD
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
=======
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getAuth } from "firebase/auth";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  databaseURL: "https://dish-it-out-df6c0-default-rtdb.europe-west1.firebasedatabase.app",
>>>>>>> main
  apiKey: "AIzaSyBJG4VRB6YZB7BR0bHxmTddyd2tWY7jeeg",
  authDomain: "dish-it-out-df6c0.firebaseapp.com",
  projectId: "dish-it-out-df6c0",
  storageBucket: "dish-it-out-df6c0.firebasestorage.app",
  messagingSenderId: "756254290949",
  appId: "1:756254290949:web:2cc566a802f4d3b61d986c",
<<<<<<< HEAD
  measurementId: "G-V8XL41MTSL",
  databaseURL: "https://dish-it-out-df6c0-default-rtdb.europe-west1.firebasedatabase.app"
=======
  measurementId: "G-V8XL41MTSL"
>>>>>>> main
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
<<<<<<< HEAD
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database }; // Only export core services
=======
// const analytics = getAnalytics(app);
const auth = getAuth(app);
const database = getDatabase(app);


export { app, auth };
>>>>>>> main
