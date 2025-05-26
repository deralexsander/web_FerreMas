window.addEventListener('DOMContentLoaded', () => {
  //---------------------------------
  //
  // tabla de datos del usuario en perfil
  //
  //---------------------------------

  function esperarOnFirebaseAuthStateChanged() {
    if (
      typeof window.onFirebaseAuthStateChanged === "function" &&
      typeof window.firebaseAuth !== "undefined"
    ) {
      window.onFirebaseAuthStateChanged(async (user) => {
        if (!user) {
          console.log("No hay usuario autenticado");
          return;
        }
        if (
          typeof window.doc !== "function" ||
          typeof window.getDoc !== "function"
        ) {
          const { doc, getDoc } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
          window.doc = doc;
          window.getDoc = getDoc;
        }
        try {
          const docRef = window.doc(window.firebaseDB, "trabajadores", user.uid);
          const docSnap = await window.getDoc(docRef);
          if (docSnap.exists()) {
            const datos = docSnap.data();
            console.log("Datos del usuario:", datos);

            // Mostrar todos los datos en la tabla dinámica
            const tabla = document.getElementById('tabla-todos-datos-usuario');
            if (tabla) {
              const tbody = tabla.querySelector('tbody');
              tbody.innerHTML = ""; // Limpia la tabla
              Object.entries(datos).forEach(([campo, valor]) => {
                const fila = document.createElement('tr');
                const tdCampo = document.createElement('td');
                const tdValor = document.createElement('td');
                tdCampo.textContent = campo;
                tdValor.textContent = valor;
                fila.appendChild(tdCampo);
                fila.appendChild(tdValor);
                tbody.appendChild(fila);
              });
            }

            // (Opcional) También puedes seguir mostrando en los campos fijos si quieres
            // ...
          } else {
            console.log("No se encontraron datos del usuario en Firestore.");
          }
        } catch (e) {
          console.error("Error obteniendo datos del usuario:", e);
        }
      });
    } else {
      setTimeout(esperarOnFirebaseAuthStateChanged, 100);
    }
  }

  esperarOnFirebaseAuthStateChanged();
});



