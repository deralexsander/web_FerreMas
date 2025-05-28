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

  //---------------------------------
  // cargar productos (si existen tablas)
  //---------------------------------

  async function cargarProductosBodega() {
    const productosSnapshot = await window.getDocs(
      window.collection(window.firebaseDB, "productos")
    );
    const tbodyReponer = document.querySelector("#tabla-reponer tbody");
    const tbodyDisponibles = document.querySelector("#tabla-disponibles tbody");
    const selectFiltro = document.getElementById("filtro-categoria");

    const categoriasSet = new Set();

    tbodyReponer.innerHTML = "";
    tbodyDisponibles.innerHTML = "";
    selectFiltro.innerHTML = '<option value="todas">Todas</option>';

    productosSnapshot.forEach((docSnap) => {
      const producto = docSnap.data();
      const fila = document.createElement("tr");
      categoriasSet.add(producto.categoria || "Sin categoría");

      if (producto.stock <= 5) {
        fila.innerHTML = `
          <td>${producto.nombre}</td>
          <td>${producto.categoria}</td>
          <td>${producto.stock}</td>
          <td>
            <input type="number" class="input-reponer" data-id="${docSnap.id}" min="1" placeholder="Cantidad" />
            <button class="btn-reponer" data-id="${docSnap.id}">Reponer</button>
            <button class="btn-eliminar-producto" data-id="${docSnap.id}">Eliminar</button>
          </td>
        `;
        tbodyReponer.appendChild(fila);
      } else {
        fila.setAttribute("data-categoria", producto.categoria || "Sin categoría");
        fila.innerHTML = `
          <td>${producto.nombre}</td>
          <td>${producto.categoria}</td>
          <td>${producto.stock}</td>
          <td>
            <button class="btn-eliminar-producto" data-id="${docSnap.id}">Eliminar</button>
          </td>
        `;
        tbodyDisponibles.appendChild(fila);
      }
    });

    categoriasSet.forEach((cat) => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      selectFiltro.appendChild(option);
    });

    selectFiltro.addEventListener("change", () => {
      const categoriaSeleccionada = selectFiltro.value;
      document
        .querySelectorAll("#tabla-disponibles tbody tr")
        .forEach((fila) => {
          const cat = fila.getAttribute("data-categoria");
          fila.style.display =
            categoriaSeleccionada === "todas" || cat === categoriaSeleccionada
              ? ""
              : "none";
        });
    });

    document.querySelectorAll(".btn-reponer").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const input = document.querySelector(`.input-reponer[data-id="${id}"]`);
        const cantidad = parseInt(input.value);

        if (!cantidad || cantidad <= 0) {
          alert("⚠️ Ingresa una cantidad válida para reponer.");
          return;
        }

        const docRef = window.doc(window.firebaseDB, "productos", id);
        const productoSnap = await window.getDoc(docRef);

        if (!productoSnap.exists()) return alert("❌ Producto no encontrado.");

        const stockActual = productoSnap.data().stock || 0;
        const nuevoStock = stockActual + cantidad;

        try {
          await window.setDoc(docRef, { stock: nuevoStock }, { merge: true });
          alert(`✅ Producto repuesto con +${cantidad} unidades`);
          cargarProductosBodega();
        } catch (err) {
          console.error(err);
          alert("❌ Error al actualizar el stock");
        }
      });
    });

    document.querySelectorAll(".btn-eliminar-producto").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const confirmar = confirm(
          "⚠️ ¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible."
        );
        if (!confirmar) return;

        try {
          await window.deleteDoc(window.doc(window.firebaseDB, "productos", id));
          alert("🗑️ Producto eliminado correctamente");
          cargarProductosBodega();
        } catch (err) {
          console.error(err);
          alert("❌ Error al eliminar el producto");
        }
      });
    });
  }

  //---------------------------------
  // esperar a que Firebase esté listo
  //---------------------------------

  async function esperarFirebaseYcargarProductos() {
    if (
      typeof window.firebaseDB !== "undefined" &&
      typeof window.collection === "function" &&
      typeof window.getDocs === "function"
    ) {
      if (
        document.querySelector("#tabla-reponer tbody") &&
        document.querySelector("#tabla-disponibles tbody") &&
        document.getElementById("filtro-categoria")
      ) {
        await cargarProductosBodega();
      }
    } else {
      setTimeout(esperarFirebaseYcargarProductos, 100);
    }
  }

  esperarFirebaseYcargarProductos();
});
