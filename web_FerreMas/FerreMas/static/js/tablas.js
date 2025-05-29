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














window.cargarUltimosProductos = async function () {
  const contenedor = document.getElementById("contenedor-productos");

  if (!contenedor || contenedor.dataset.cargado === "true") return;

  contenedor.dataset.cargado = "true";
  contenedor.innerHTML = "";

  if (
    !window.firebaseDB ||
    !window.collection ||
    !window.getDocs ||
    !window.query ||
    !window.orderBy
  ) {
    console.error("❌ Firebase no está listo para cargar productos");
    setTimeout(window.cargarUltimosProductos, 100);
    return;
  }

  const productosRef = window.collection(window.firebaseDB, "productos");
  const q = window.query(productosRef, window.orderBy("creadoEn", "desc"));

  try {
    const snapshot = await window.getDocs(q);

    snapshot.forEach((doc) => {
      const producto = doc.data();
      const imagenUrl = producto.codigoImagen && producto.codigoImagen.length > 10
        ? `/media/productos/${producto.codigoImagen}.jpg`
        : '/static/media/imagen-no-disponible.jpg';

      const tarjeta = document.createElement("div");
      tarjeta.className = "tarjeta-producto";
      tarjeta.innerHTML = `
        <div class="tarjeta-producto__shine"></div>
        <div class="tarjeta-producto__glow"></div>
        <div class="tarjeta-producto__content">
          <div class="tarjeta-producto__image">
            <img src="${imagenUrl}" alt="Producto"
              style="width: 100%; height: 100%; object-fit: cover; border-radius: 15px;"
              onerror="this.src='/static/media/imagen-no-disponible.jpg'" />
          </div>
          <div class="tarjeta-producto__text">
            <p class="tarjeta-producto__title">${producto.nombre || "Producto sin nombre"}</p>
            <p class="tarjeta-producto__description">${producto.descripcion || ""}</p>
          </div>
          <div class="tarjeta-producto__footer">
            <div class="tarjeta-producto__price">$${(producto.precio || 0).toLocaleString('es-CL')}</div>
            <div class="tarjeta-producto__button">
              <svg height="16" width="16" viewBox="0 0 24 24">
                <path stroke-width="2" stroke="currentColor" d="M4 12H20M12 4V20" fill="currentColor"></path>
              </svg>
            </div>
          </div>
        </div>
      `;

      tarjeta.addEventListener("click", () => {
        const modal = document.getElementById("modal-producto");
        modal.classList.remove("saliendo");
        modal.style.display = "flex";
        modal.classList.add("activo");

        document.getElementById("modal-nombre").textContent = producto.nombre || "Producto sin nombre";
        document.getElementById("modal-categoria").textContent = producto.categoria || "Sin categoría";
        document.getElementById("modal-descripcion").textContent = producto.descripcion || "Sin descripción";
        document.getElementById("modal-marca").textContent = `Marca: ${producto.marca || "Sin marca"}`;
        document.getElementById("modal-precio").textContent = `$${(producto.precio || 0).toLocaleString('es-CL')}`;
        
        // Stock con color y mensaje
        const stockElemento = document.getElementById("modal-stock");
        if (producto.stock > 0) {
          stockElemento.textContent = `${producto.stock} Disponibles`;
          stockElemento.style.color = "#00c853"; // verde
        } else {
          stockElemento.textContent = "No disponible";
          stockElemento.style.color = "#d50000"; // rojo
        }

        document.getElementById("modal-codigo").textContent = `Código: ${producto.codigo || "Sin código"}`;
        document.getElementById("modal-potencia").textContent = producto.potencia || "N/A";
        document.getElementById("modal-voltaje").textContent = producto.voltaje || "N/A";
        document.getElementById("modal-color").textContent = producto.color || "N/A";
        document.getElementById("modal-tamano").textContent = producto.tamano || "N/A";
        document.getElementById("modal-material").textContent = producto.material || "N/A";
        document.getElementById("modal-presentacion").textContent = producto.presentacion || "N/A";
        document.getElementById("modal-garantia").textContent = producto.garantia || "N/A";
        document.getElementById("modal-uso").textContent = producto.uso || "N/A";
        document.getElementById("modal-peso").textContent = `${producto.peso || "N/A"} kg`;
        document.getElementById("modal-dimensiones").textContent = producto.dimensiones || "N/A";
        document.getElementById("modal-vencimiento").textContent = producto.vencimiento || "N/A";
        document.getElementById("modal-imagen").src = imagenUrl;
        modal.setAttribute("data-uid", doc.id);
        const inputCantidad = document.getElementById("cantidad");
        if (inputCantidad) {
          inputCantidad.value = 1;
          inputCantidad.dataset.stock = producto.stock || 0;

          // Elimina listeners anteriores para evitar duplicados
          const nuevoInput = inputCantidad.cloneNode(true);
          inputCantidad.parentNode.replaceChild(nuevoInput, inputCantidad);

          // Reasignar clase y atributos necesarios
          nuevoInput.classList.add("cantidad-productos");

          // Volver a inicializar botones de suma/resta con el nuevo input
          inicializarControlesCantidad();
        }



        
      });
      contenedor.appendChild(tarjeta);
    });

  } catch (e) {
    console.error("❌ Error al cargar productos:", e);
  }
};




});




