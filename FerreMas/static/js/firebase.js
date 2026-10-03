let db,
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  getDoc,
  updateDoc, // ✅ Añadido aquí
  Timestamp,
  query,
  orderBy,
  limit,
  addDoc;

let signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail;

let auth;

window.addEventListener('DOMContentLoaded', async () => {
  // Importar Firebase modular dinámicamente
  const firebase = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const authModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
  const firestoreModule = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

  // Inicializar Firebase
  const { initializeApp } = firebase;
  const firebaseConfig = {
    apiKey: "AIzaSyCOsIJF-ywgaQPqT5ApyodIcRRBCiU-mtI",
    authDomain: "ferremas-1a2c4.firebaseapp.com",
    projectId: "ferremas-1a2c4",
    storageBucket: "ferremas-1a2c4.appspot.com",
    messagingSenderId: "427152375883",
    appId: "1:427152375883:web:f3dc467e589520bbf44dce"
  };

  const app = initializeApp(firebaseConfig);
  auth = authModule.getAuth(app);
  db = firestoreModule.getFirestore(app);

  // Firestore functions
  collection = firestoreModule.collection;
  getDocs = firestoreModule.getDocs;
  doc = firestoreModule.doc;
  setDoc = firestoreModule.setDoc;
  deleteDoc = firestoreModule.deleteDoc;
  getDoc = firestoreModule.getDoc;
  updateDoc = firestoreModule.updateDoc; // ✅ Añadido aquí
  Timestamp = firestoreModule.Timestamp;
  query = firestoreModule.query;
  orderBy = firestoreModule.orderBy;
  limit = firestoreModule.limit;
  addDoc = firestoreModule.addDoc;

  // Auth functions
  signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
  createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
  signOut = authModule.signOut;
  updateProfile = authModule.updateProfile;
  sendPasswordResetEmail = authModule.sendPasswordResetEmail;

  // Exportar variables globales
  window.firebaseAppConfig = firebaseConfig;
  window.firebase = firebase;
  window.authModule = authModule;
  window.firebaseAuth = auth;
  window.firebaseDB = db;
  

  window.collection = window.collection || collection;
  window.getDocs = window.getDocs || getDocs;
  window.doc = window.doc || doc;
  window.setDoc = window.setDoc || setDoc;
  window.deleteDoc = window.deleteDoc || deleteDoc;
  window.getDoc = window.getDoc || getDoc;
  window.updateDoc = window.updateDoc || updateDoc; // ✅ Añadido aquí
  window.Timestamp = window.Timestamp || Timestamp;
  window.query = window.query || query;
  window.orderBy = window.orderBy || orderBy;
  window.limit = window.limit || limit;
  window.addDoc = window.addDoc || addDoc;

  window.firebaseSignIn = signInWithEmailAndPassword;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.signOut = signOut;
  window.updateProfile = updateProfile;
  window.sendPasswordResetEmail = sendPasswordResetEmail;

  // Listener global de autenticación
  window.onFirebaseAuthStateChanged = function (callback) {
    return authModule.onAuthStateChanged(auth, callback);
  };
  window.onAuthStateChanged = authModule.onAuthStateChanged;

  // Lógica condicional para cargar productos si corresponde
  if (
    document.querySelector("#tabla-reponer tbody") &&
    document.querySelector("#tabla-disponibles tbody") &&
    document.getElementById("filtro-categoria")
  ) {
    if (typeof cargarProductosBodega === "function") {
      cargarProductosBodega();
    }
  }

  // Lógica condicional para cargar últimos productos
  if (
    typeof window.cargarUltimosProductos === "function" &&
    document.getElementById("contenedor-productos")
  ) {
    window.cargarUltimosProductos();
  }
});
