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

            const tabla = document.getElementById('tabla-todos-datos-usuario');
            if (tabla) {
              const tbody = tabla.querySelector('tbody');
              tbody.innerHTML = "";
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

  //---------------------------------
  //
  // cargar tabla con todos los trabajadores
  //
  //---------------------------------


  
  window.cargarTrabajadores = async function () {
    try {
      if (!window.firebaseDB || !window.getDocs || !window.collection) {
        setTimeout(window.cargarTrabajadores, 100);
        return;
      }

      const db = window.firebaseDB;
      const tbody = document.querySelector("#tabla-trabajadores tbody");
      if (!tbody) return;

      tbody.innerHTML = "";

      const querySnapshot = await window.getDocs(window.collection(db, "trabajadores"));

      querySnapshot.forEach((docSnap) => {
        const trabajador = docSnap.data();
        const uid = docSnap.id;

        const fila = document.createElement("tr");

        fila.innerHTML = `
          <td>${trabajador.nombre || ""} ${trabajador.apellidoPaterno || ""}</td>
          <td>${trabajador.correo || ""}</td>
          <td>${trabajador.rut || ""}</td>
          <td>${trabajador.rol || ""}</td>
          <td>${trabajador.creadoEn?.toDate().toLocaleString() || ""}</td>
          <td>${trabajador.passwordInicio || ""}</td>
          <td>${trabajador.cambiarContraseña ? "Sí" : "No"}</td>
          <td>
            <button class="btn-eliminar" data-id="${uid}">❌</button>
            <button class="btn-cambiar" data-id="${uid}">🔒</button>
          </td>
        `;

        tbody.appendChild(fila);
      });

      if (typeof window.agregarEventosTabla === "function") {
        window.agregarEventosTabla();
      }

    } catch (error) {
      console.error("❌ Error al cargar trabajadores:", error);
    }
  };



  cargarTrabajadores();

});
