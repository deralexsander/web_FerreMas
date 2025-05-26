let db, collection, getDocs;

window.addEventListener('DOMContentLoaded', async () => {
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const {
    getAuth,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    updateProfile,
    sendPasswordResetEmail,
    onAuthStateChanged
  } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");

  const { getFirestore, collection: _collection, getDocs: _getDocs } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

  const firebaseConfig = {
    apiKey: "AIzaSyCOsIJF-ywgaQPqT5ApyodIcRRBCiU-mtI",
    authDomain: "ferremas-1a2c4.firebaseapp.com",
    projectId: "ferremas-1a2c4",
    storageBucket: "ferremas-1a2c4.appspot.com",
    messagingSenderId: "427152375883",
    appId: "1:427152375883:web:f3dc467e589520bbf44dce"
  };

  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  collection = _collection;
  getDocs = _getDocs;

  // 🌐 Autenticación
  window.firebaseAuth = getAuth(app);
  window.firebaseSignIn = signInWithEmailAndPassword;
  window.createUserWithEmailAndPassword = createUserWithEmailAndPassword;
  window.updateProfile = updateProfile;
  window.sendPasswordResetEmail = sendPasswordResetEmail;

  // 🗂️ Base de datos
  window.firebaseDB = db;

  // 👉 Ahora sí, define la función global
  window.getProductos = async function() {
    const productosCol = collection(db, "productos");
    const productosSnapshot = await getDocs(productosCol);
    return productosSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  };

  // Exponer función para escuchar cambios de autenticación desde funciones.js
  window.onFirebaseAuthStateChanged = function(callback) {
    return onAuthStateChanged(window.firebaseAuth, callback);
  };

  
  
});
