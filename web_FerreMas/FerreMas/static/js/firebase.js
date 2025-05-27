let db, collection, getDocs, doc, setDoc, Timestamp;
let signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut;

window.addEventListener('DOMContentLoaded', async () => {
  // Importar Firebase modular
  const firebase = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const authModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
  const firestoreModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

  // Guardar en window
  window.firebase = firebase;
  window.authModule = authModule;

  const { initializeApp } = firebase;

  const firebaseConfig = {
    apiKey: "AIzaSyCOsIJF-ywgaQPqT5ApyodIcRRBCiU-mtI",
    authDomain: "ferremas-1a2c4.firebaseapp.com",
    projectId: "ferremas-1a2c4",
    storageBucket: "ferremas-1a2c4.appspot.com",
    messagingSenderId: "427152375883",
    appId: "1:427152375883:web:f3dc467e589520bbf44dce"
  };

  // Guardar config para instancias secundarias
  window.firebaseAppConfig = firebaseConfig;

  const app = initializeApp(firebaseConfig);
  const auth = authModule.getAuth(app);
  db = firestoreModule.getFirestore(app);

  // Exportar funciones necesarias
  collection = firestoreModule.collection;
  getDocs = firestoreModule.getDocs;
  doc = firestoreModule.doc;
  setDoc = firestoreModule.setDoc;
  Timestamp = firestoreModule.Timestamp;

  signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
  createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
  signOut = authModule.signOut;

  // Variables globales
  window.firebaseAuth = auth;
  window.firebaseDB = db;
  window.collection = collection;
  window.getDocs = getDocs;
  window.doc = doc;
  window.setDoc = setDoc;
  window.Timestamp = Timestamp;
  window.firebaseSignIn = signInWithEmailAndPassword;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.updateProfile = authModule.updateProfile;
  window.sendPasswordResetEmail = authModule.sendPasswordResetEmail;
  window.signOut = signOut;
  window.onFirebaseAuthStateChanged = function (callback) {
    return authModule.onAuthStateChanged(auth, callback);
  };
});
