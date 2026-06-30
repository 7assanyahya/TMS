import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

// Firebase project configuration for the STMS Realtime Database.
const firebaseConfig = {
    apiKey: "AIzaSyC2TmzGz0riQOmlWcEVt_3NYwWwbHps_mQ",
    authDomain: "tmsp-c9e4d.firebaseapp.com",
    databaseURL: "https://tmsp-c9e4d-default-rtdb.firebaseio.com",
    projectId: "tmsp-c9e4d",
    storageBucket: "tmsp-c9e4d.firebasestorage.app",
    messagingSenderId: "275074761865",
    appId: "1:275074761865:web:1ba977ba637d94d3627258"
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
