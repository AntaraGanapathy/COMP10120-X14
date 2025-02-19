import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: "AIzaSyBJG4VRB6YZB7BR0bHxmTddyd2tWY7jeeg",
  authDomain: "dish-it-out-df6c0.firebaseapp.com",
  projectId: "dish-it-out-df6c0",
  storageBucket: "dish-it-out-df6c0.firebasestorage.app",
  messagingSenderId: "756254290949",
  appId: "1:756254290949:web:2cc566a802f4d3b61d986c",
  measurementId: "G-V8XL41MTSL",
  databaseURL: "https://dish-it-out-df6c0-default-rtdb.europe-west1.firebasedatabase.app"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const database = getDatabase(app);

export { app, auth, database }; // Only export core services