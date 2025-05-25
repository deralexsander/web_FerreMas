window.addEventListener('DOMContentLoaded', async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail
  } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");

  const {
    getFirestore,
    collection,
    getDocs
  } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

  const firebaseConfig = {
    apiKey: "AIzaSyCOsIJF-ywgaQPqT5ApyodIcRRBCiU-mtI",
    authDomain: "ferremas-1a2c4.firebaseapp.com",
    projectId: "ferremas-1a2c4",
    storageBucket: "ferremas-1a2c4.appspot.com",
    messagingSenderId: "427152375883",
    appId: "1:427152375883:web:f3dc467e589520bbf44dce"
  };

  const app = initializeApp(firebaseConfig);

  // 🔐 Autenticación
  window.firebaseAuth = getAuth(app);
  window.firebaseSignIn = signInWithEmailAndPassword;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.updateProfile = updateProfile;
  window.sendPasswordResetEmail = sendPasswordResetEmail;

  // 🗂️ Base de datos
  const db = getFirestore(app);
  window.firebaseDB = db;

  // 🌐 Export Firestore utils (para productos.js)
  window.firebaseFirestore = {
    collection,
    getDocs
  };
});
