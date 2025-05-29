let db, collection, getDocs, doc, setDoc, deleteDoc, getDoc, Timestamp;
let signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut;

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
  const auth = authModule.getAuth(app);
  db = firestoreModule.getFirestore(app);

  // ✅ Exportar funciones necesarias desde Firestore
  collection = firestoreModule.collection;
  getDocs = firestoreModule.getDocs;
  doc = firestoreModule.doc;
  setDoc = firestoreModule.setDoc;
  deleteDoc = firestoreModule.deleteDoc;
  getDoc = firestoreModule.getDoc;
  Timestamp = firestoreModule.Timestamp;

  // ✅ Exportar funciones necesarias desde Auth
  signInWithEmailAndPassword = authModule.signInWithEmailAndPassword;
  createUserWithEmailAndPassword = authModule.createUserWithEmailAndPassword;
  signOut = authModule.signOut;

  // Guardar en window para acceso global
  window.firebaseAppConfig = firebaseConfig;
  window.firebase = firebase;
  window.authModule = authModule;
  window.firebaseAuth = auth;
  window.firebaseDB = db;
  window.collection = collection;
  window.getDocs = getDocs;
  window.doc = doc;
  window.setDoc = setDoc;
  window.deleteDoc = deleteDoc;
  window.getDoc = getDoc;
  window.Timestamp = Timestamp;
  window.firebaseSignIn = signInWithEmailAndPassword;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.updateProfile = authModule.updateProfile;
  window.sendPasswordResetEmail = authModule.sendPasswordResetEmail;
  window.signOut = signOut;


// Firebase Firestore functions
window.firebaseDB = db;
window.collection = firestoreModule.collection;
window.getDocs = firestoreModule.getDocs;
window.doc = firestoreModule.doc;
window.setDoc = firestoreModule.setDoc;
window.deleteDoc = firestoreModule.deleteDoc;
window.getDoc = firestoreModule.getDoc;
window.Timestamp = firestoreModule.Timestamp;

// ⚠️ AÑADE ESTAS si aún no las tenías
window.query = firestoreModule.query;
window.orderBy = firestoreModule.orderBy;
window.limit = firestoreModule.limit;



  // ✅ Listener de autenticación
  window.onFirebaseAuthStateChanged = function (callback) {
    return authModule.onAuthStateChanged(auth, callback);
  };

  // ✅ Llamar aquí si necesitas cargar productos al iniciar
  if (
    document.querySelector("#tabla-reponer tbody") &&
    document.querySelector("#tabla-disponibles tbody") &&
    document.getElementById("filtro-categoria")
  ) {
    if (typeof cargarProductosBodega === "function") {
      cargarProductosBodega(); // <- esto ya no dará error
    }
  }

  // Ejecutar cargarUltimosProductos si existe y hay contenedor
if (
  typeof window.cargarUltimosProductos === "function" &&
  document.getElementById("contenedor-productos")
) {
  window.cargarUltimosProductos();  // ✅ Llama solo cuando todo Firebase esté listo
}

});
