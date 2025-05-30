// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Konfigurasi Firebase - pastikan ini sesuai dengan project Firebase kamu
const firebaseConfig = {
  apiKey: "AIzaSyDCxWbuScND_kc4oS_WZN7s4q6CmNooNpg",
  authDomain: "digital-scoring-porseni.firebaseapp.com",
  projectId: "digital-scoring-porseni",
  storageBucket: "digital-scoring-porseni.appspot.com",
  messagingSenderId: "673985819962",
  appId: "1:673985819962:web:e985d20a4d5d478df58c03",
  measurementId: "G-WHEDBKX2R3"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Export database agar bisa digunakan di file lain
export { db };
