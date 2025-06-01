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

      // Asegurar funciones Firestore disponibles
      if (
        typeof window.doc !== "function" ||
        typeof window.getDoc !== "function"
      ) {
        const { doc, getDoc } = await import(
          "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js"
        );
        window.doc = doc;
        window.getDoc = getDoc;
      }

      try {
        const docRef = window.doc(window.firebaseDB, "trabajadores", user.uid);
        const docSnap = await window.getDoc(docRef);

        if (docSnap.exists()) {
          const datos = docSnap.data();
          console.log("Datos del usuario:", datos);

          const ruta = window.location.pathname;
          if (
            ruta === "/direccion/" &&
            typeof cargarDirecciones === "function" &&
            document.getElementById("tbody-direcciones")
          ) {
            await cargarDirecciones(); // 🟢 cargar tabla

            // 🟢 Esperar a que la tabla esté completamente renderizada antes de buscar filas
            setTimeout(async () => {
              try {
                const refSeleccion = window.doc(window.firebaseDB, "direccionesSeleccionadas", user.uid);
                const snapSeleccion = await window.getDoc(refSeleccion);

                if (snapSeleccion.exists()) {
                  const { direccionId } = snapSeleccion.data();
                  const fila = document.querySelector(`tr[data-id="${direccionId}"]`);
                  const boton = fila?.querySelector("button");
                  if (fila && boton && typeof seleccionarDireccion === "function") {
                    seleccionarDireccion(direccionId, boton);
                  }
                }
              } catch (e) {
                console.warn("⚠️ No se pudo recuperar la dirección seleccionada:", e);
              }
            }, 300); // Espera breve para que el DOM se estabilice
          }

        } else {
          console.warn("No se encontraron datos del trabajador");
        }
      } catch (error) {
        console.error("❌ Error al obtener datos del trabajador:", error);
      }
    });
  } else {
    setTimeout(esperarOnFirebaseAuthStateChanged, 100); // Esperar hasta que Firebase esté listo
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



window.cargarDirecciones = async function () {
  const user = window.firebaseAuth?.currentUser;
  const tbody = document.getElementById("tbody-direcciones");

  if (!tbody) {
    console.warn("No se encontró el elemento <tbody> con ID 'tbody-direcciones'.");
    return;
  }

  if (!user) {
    console.warn("⚠️ No hay usuario autenticado. No se pueden cargar direcciones.");
    tbody.innerHTML = "<tr><td colspan='6'>Debes iniciar sesión para ver tus direcciones guardadas.</td></tr>";
    return;
  }

  tbody.innerHTML = "<tr><td colspan='6'>Cargando direcciones...</td></tr>";

  try {
    const ref = window.collection(window.firebaseDB, "direcciones", user.uid, "items");
    const snapshot = await window.getDocs(ref);

    if (snapshot.empty) {
      tbody.innerHTML = "<tr><td colspan='6'>No hay direcciones guardadas.</td></tr>";
      return;
    }

    tbody.innerHTML = ""; // Limpiar contenido previo

    snapshot.forEach((doc) => {
      const d = doc.data();
      const id = doc.id;

      const fila = document.createElement("tr");
      fila.setAttribute("data-id", id); // 👈 esto es clave
      fila.innerHTML = `
        <td>${d.nombre || "-"}</td>
        <td>${d.correo || "-"}</td>
        <td>${d.telefono || "-"}</td>
        <td>${d.calleNumero || ""} ${d.departamento || ""}</td>
        <td>${d.comuna || ""}, ${d.region || ""}</td>
        <td>${formatearFecha(d.fechaGuardado)}</td>
        <td><button onclick="seleccionarDireccion('${id}', this)">Seleccionar</button></td>
      `;
      tbody.appendChild(fila);
    });

  } catch (error) {
    console.error("❌ Error al cargar direcciones:", error);
    tbody.innerHTML = "<tr><td colspan='6'>Ocurrió un error al cargar las direcciones.</td></tr>";
  }
};

// Utilidad para mostrar la fecha de forma legible
function formatearFecha(fecha) {
  try {
    if (typeof fecha?.toDate === "function") fecha = fecha.toDate();
    if (!(fecha instanceof Date)) fecha = new Date(fecha);
    return fecha.toLocaleString("es-CL", {
      dateStyle: "short",
      timeStyle: "short"
    });
  } catch {
    return "-";
  }
}







async function cargarTransferencias() {
  const tabla = document.querySelector("#tabla-transferencias tbody");
  if (!tabla) return;

  try {
    const ref = window.collection(window.firebaseDB, "pedidos");
    const snapshot = await window.getDocs(ref);

    tabla.innerHTML = "";

    snapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const estado = data.estadoTransferencia || "pendiente";
      const tipoDePago = data.tipoDePago || "";

      if (tipoDePago.toLowerCase() !== "transferencia" || estado !== "pendiente") return;

      const total = typeof data.total === "number"
        ? `$${data.total.toLocaleString("es-CL")}`
        : "-";

      const fechaCorta = data.timestamp?.toDate?.().toLocaleDateString("es-CL") || "-";

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td colspan="9">
          <div class="contenedor-pedido-grid">
            <div class="lado-datos">
              <div class="lado-izquierdo">
                <p><strong>RUT:</strong> ${data.rutTitular || "-"}</p>
                <p><strong>Nombre:</strong> ${data.nombreTitular || "-"}</p>
                <p><strong>Banco:</strong> ${data.banco || "-"}</p>
              </div>
              <div class="lado-derecho">
                <p><strong>Entrega:</strong> ${data.tipoEntrega || "-"}</p>
                <p><strong>Productos:</strong></p>
                ${
                  Array.isArray(data.carrito)
                    ? `<ul>${data.carrito
                        .map(prod => `<li>${prod.cantidad || 1} × ${prod.nombre || "Producto"}</li>`)
                        .join("")}</ul>`
                    : "-"
                }
              </div>
            </div>
            <div class="fila-inferior">
              <div><strong>Total:</strong> ${total}</div>
              <div><strong>Estado:</strong> ${estado}</div>
              <div><strong>Fecha:</strong> ${fechaCorta}</div>
              <div class="contenedor-botones">
                <button class="btn btn-validar" data-id="${id}">✅ Validar</button>
                <button class="btn btn-rechazar" data-id="${id}">❌ Rechazar</button>
              </div>
            </div>
          </div>
        </td>
      `;
      tabla.appendChild(fila);
    });



    // Acción: Validar
    document.querySelectorAll(".btn.btn-validar").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        try {
          const ref = window.doc(window.firebaseDB, "pedidos", id);
          const docSnap = await window.getDoc(ref);

          if (!docSnap.exists()) {
            alert("❌ No se encontró el pedido.");
            return;
          }

          const data = docSnap.data();
          console.log("📄 Datos del pedido:", data);

          const emailCliente = data.email || "";
          const nombre = data.nombreTitular || "Cliente";
          const uidPedido = id;
          const fecha = data.timestamp?.toDate?.().toLocaleDateString("es-CL") || "fecha desconocida";

          if (!emailCliente) {
            alert("⚠️ El correo del cliente no está disponible.");
            return;
          }

          // Construcción de productos
          const productos = Array.isArray(data.carrito)
            ? data.carrito.map(prod => `- ${prod.cantidad || 1} × ${prod.nombre || "Producto"}`).join("%0A")
            : "-";

          const tipoEntrega = data.tipoEntrega === "domicilio" ? "Envío a domicilio" : "Retiro en tienda";
          const total = typeof data.total === "number" ? `$${data.total.toLocaleString("es-CL")}` : "-";

          // Construcción de cuerpo de correo
          const asunto = `FERREMAS – Comprobante de compra ${uidPedido}`;
          const cuerpo = `FERREMAS – Comprobante de compra%0A%0AN° Pedido: ${uidPedido}%0AFecha: ${fecha}%0A%0ACliente: ${nombre}%0ACorreo: ${emailCliente}%0A%0ADetalle:%0A${productos}%0A%0AForma de pago: Transferencia%0AMétodo de entrega: ${tipoEntrega}%0AMonto total: ${total}%0A%0AGracias por tu compra.%0AEste documento es un comprobante informal emitido por Ferremas.`;

          // Abrir cliente de correo
          window.location.href = `mailto:${emailCliente}?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;

          // Confirmación posterior
          const confirmar = confirm("¿Deseas marcar el pedido como 'pago validado'?");
          if (!confirmar) return;

          await window.setDoc(
            window.doc(window.firebaseDB, "pedidos", id),
            {
              estadoTransferencia: "pago validado",
              pedido: "En espera de preparación"
            },
            { merge: true }
          );


          alert("✅ Pedido actualizado como 'pago validado'.");
          cargarTransferencias();

        } catch (error) {
          console.error("❌ Error al validar:", error);
          alert("Hubo un error al procesar el pedido.");
        }
      });
    });


    // Acción: Rechazar
    // Acción: Rechazar
    document.querySelectorAll(".btn.btn-rechazar").forEach((btn) => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        try {
          const ref = window.doc(window.firebaseDB, "pedidos", id);
          const docSnap = await window.getDoc(ref);

          if (!docSnap.exists()) {
            alert("❌ No se encontró el pedido.");
            return;
          }

          const data = docSnap.data();
          const emailCliente = data.email || "";
          const nombre = data.nombreTitular || "Cliente";
          const uidPedido = id;
          const fecha = data.timestamp?.toDate?.().toLocaleDateString("es-CL") || "fecha desconocida";

          if (!emailCliente) {
            alert("⚠️ El correo del cliente no está disponible.");
            return;
          }

          const asunto = `FERREMAS – Rechazo de pedido ${uidPedido}`;
          const cuerpo = `Estimado/a ${nombre},%0A%0ALamentamos informarte que tu pedido N° ${uidPedido}, con fecha ${fecha}, ha sido rechazado debido a que no se recibió el comprobante de pago correspondiente por la vía de transferencia bancaria.%0A%0APara continuar con el proceso de compra, te invitamos a verificar que el pago haya sido realizado correctamente y que los datos enviados coincidan con los requerimientos.%0A%0ASi tienes dudas o necesitas más información, no dudes en responder a este mismo correo. Estaremos atentos para ayudarte.%0A%0ASaludos cordiales,%0AEquipo FERREMAS`;

          // Abrir cliente de correo antes de confirmar
          window.location.href = `mailto:${emailCliente}?subject=${encodeURIComponent(asunto)}&body=${cuerpo}`;

          // Esperar confirmación para actualizar el estado
          const confirmar = confirm("¿Deseas marcar el pedido como 'problemas con el pago'?");
          if (!confirmar) return;

          await window.setDoc(
            window.doc(window.firebaseDB, "pedidos", id),
            { estadoTransferencia: "problemas con tu pago" },
            { merge: true }
          );

          alert("❌ Pedido marcado como 'problemas con tu pago'.");
          cargarTransferencias();

        } catch (error) {
          console.error("❌ Error al rechazar:", error);
          alert("Hubo un error al procesar el pedido.");
        }
      });
    });



  } catch (error) {
    console.error("❌ Error al cargar transferencias:", error);
    alert("No se pudieron cargar las transferencias.");
  }
}




function esperarFirebaseYCargar() {
  if (
    typeof window.firebaseDB !== "undefined" &&
    typeof window.collection === "function" &&
    typeof window.getDocs === "function"
  ) {
    cargarTransferencias();
  } else {
    setTimeout(esperarFirebaseYCargar, 100);
  }
}

esperarFirebaseYCargar();







window.cargarHistorialTransferencias = async function () {
  const tabla = document.querySelector("#historial-tabla-transferencias tbody");
  if (!tabla) return;

  try {
    const ref = window.collection(window.firebaseDB, "pedidos");
    const snapshot = await window.getDocs(ref);

    tabla.innerHTML = "";

    for (const docSnap of snapshot.docs) {
      const data = docSnap.data();

      const tipoPago = (data.tipoDePago || "").toLowerCase();
      const tipoEntrega = data.tipoEntrega?.toLowerCase() || "-";

      const estado = tipoPago === "tarjeta"
        ? "Pagado"
        : data.estadoTransferencia || data.estado || "-";

      const total = typeof data.total === "number"
        ? `$${data.total.toLocaleString("es-CL")}`
        : "-";

      let fechaCorta = "-";
      if (data.timestamp?.toDate) {
        fechaCorta = data.timestamp.toDate().toLocaleDateString("es-CL");
      } else if (typeof data.timestamp === "string") {
        const fecha = new Date(data.timestamp);
        if (!isNaN(fecha)) {
          fechaCorta = fecha.toLocaleDateString("es-CL");
        }
      }

      const listaProductos = Array.isArray(data.carrito)
        ? data.carrito
        : Array.isArray(data.productos)
          ? data.productos
          : [];

      const productosHTML = listaProductos.length > 0
        ? `<ul>${listaProductos
            .map(prod => `<li>${prod.cantidad || 1} × ${prod.nombre || "Producto"}</li>`)
            .join("")}</ul>`
        : "Sin productos";

      const comuna =
        data?.direccionDespacho?.comuna ||
        data?.comunaSucursal ||
        data?.comuna ||
        "Sin información";

      const region =
        data?.direccionDespacho?.region ||
        data?.regionSucursal ||
        data?.region ||
        "Sin información";

      const entrega = `${tipoEntrega} / ${comuna}, ${region}`;

      // ------------------------------
      // Buscar nombre desde trabajadores si está vacío
      // ------------------------------
      let nombreUsuario = data.nombreTitular || "-";
      if (
        tipoPago === "tarjeta" &&
        tipoEntrega === "tienda" &&
        (!data.nombreTitular || data.nombreTitular === "-") &&
        data.userId
      ) {
        try {
          const docTrabRef = window.doc(window.firebaseDB, "trabajadores", data.userId);
          const docTrabSnap = await window.getDoc(docTrabRef);
          if (docTrabSnap.exists()) {
            const trabajador = docTrabSnap.data();
            nombreUsuario = `${trabajador.nombre || ""} ${trabajador.apellidoPaterno || ""}`.trim();
          }
        } catch (e) {
          console.warn("No se pudo obtener trabajador para:", data.userId);
        }
      }

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td colspan="9">
          <div class="contenedor-pedido-grid">
            <div class="lado-datos">
              <div class="lado-izquierdo">
                ${
                  tipoPago === "tarjeta" && tipoEntrega === "tienda"
                    ? `
                      <p><strong>Correo:</strong> ${data.email || "-"}</p>
                      <p><strong>Usuario:</strong> ${nombreUsuario}</p>
                    `
                    : `
                      <p><strong>RUT:</strong> ${data.rutTitular || "-"}</p>
                      <p><strong>Nombre:</strong> ${data.nombreTitular || "-"}</p>
                      <p><strong>Banco:</strong> ${data.banco || "-"}</p>
                    `
                }
                <p><strong>Pago:</strong> ${data.tipoDePago || "-"}</p>
              </div>
              <div class="lado-derecho">
                <p><strong>Entrega:</strong> ${entrega}</p>
                <p><strong>Productos:</strong></p>
                ${productosHTML}
              </div>
            </div>
            <div class="fila-inferior">
              <div><strong>Total:</strong> ${total}</div>
              <div><strong>Estado:</strong> ${estado}</div>
              <div><strong>Fecha:</strong> ${fechaCorta}</div>
            </div>
          </div>
        </td>
      `;
      tabla.appendChild(fila);
    }

  } catch (error) {
    console.error("❌ Error al cargar historial:", error);
    alert("No se pudo cargar el historial de pagos.");
  }
};





















// 🟩 1. Función para llamar pedidos desde Firestore
window.llamarPedidos = async function () {
  try {
    const ref = window.collection(window.firebaseDB, "pedidos");
    const snapshot = await window.getDocs(ref);
    const pedidos = [];

    snapshot.forEach(docSnap => {
      pedidos.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    return pedidos;
  } catch (error) {
    console.error("❌ Error al llamar pedidos:", error);
    return [];
  }
};











window.renderPedidos = function (pedidos) {
  const cuerpoDomicilio = document.querySelector("#tabla-pedidos-domicilio tbody");
  const cuerpoSucursal = document.querySelector("#tabla-pedidos-sucursal tbody");

  if (!cuerpoDomicilio || !cuerpoSucursal) {
    console.warn("No se encontraron las tablas en el HTML.");
    return;
  }

  cuerpoDomicilio.innerHTML = "";
  cuerpoSucursal.innerHTML = "";

  pedidos.forEach(p => {
    const fila = document.createElement("tr");

    // Fecha segura
    let fechaCorta = "none";
    try {
      const fechaObj = typeof p.timestamp === "string"
        ? new Date(p.timestamp)
        : p.timestamp.toDate?.() || new Date(p.timestamp);

      if (!isNaN(fechaObj)) {
        fechaCorta = fechaObj.toLocaleDateString("es-CL");
      }
    } catch (e) {
      console.warn("Error al convertir fecha:", e);
    }

    const total = typeof p.total === "number" ? `$${p.total.toLocaleString("es-CL")}` : "none";
    const tipoEntrega = p.tipoEntrega || "none";
    const estadoPedido = p.pedido || "none";
    const id = p.uid || "none";

    const direccion = p.direccionDespacho || {};
    const rut = p.rutTitular || direccion.rut || "none";
    const nombreTitular = p.nombreTitular || direccion.nombre || "none";
    const email = p.email || direccion.email || direccion.correo || "none";
    const comuna = p.comuna || direccion.comuna || p.comunaSucursal || "none";
    const region = p.region || direccion.region || p.regionSucursal || "none";

    const productosArray = Array.isArray(p.carrito)
      ? p.carrito
      : Array.isArray(p.productos) ? p.productos : [];

    const productos = productosArray.length > 0
      ? `<ul>${productosArray.map(prod => `
          <li style="display: flex; align-items: center; margin-bottom: 4px;">
            ${prod.imagen ? `<img src="${prod.imagen}" alt="${prod.nombre}" style="width: 40px; height: 40px; object-fit: cover; margin-right: 8px; border-radius: 4px;">` : ""}
            ${prod.cantidad || 1} × ${prod.nombre || "Producto"} — $${prod.precio?.toLocaleString("es-CL") || "0"}
          </li>`).join("")}</ul>`
      : "<em>No hay productos</em>";

    fila.innerHTML = `
      <td colspan="9">
        <div class="contenedor-pedido-grid">
          <div class="lado-datos">
            <div class="lado-izquierdo">
              <p><strong>RUT:</strong> ${rut}</p>
              <p><strong>Nombre:</strong> ${nombreTitular}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Estado pedido:</strong> ${estadoPedido}</p>
              <p><strong>Entrega:</strong> ${tipoEntrega}</p>
              <p><strong>Comuna:</strong> ${comuna}</p>
              <p><strong>Región:</strong> ${region}</p>
            </div>
            <div class="lado-derecho">
              <p><strong>Productos:</strong></p>
              ${productos}
            </div>
          </div>
          <div class="fila-inferior">
            <div><strong>Total:</strong> ${total}</div>
            <div><strong>Fecha:</strong> ${fechaCorta}</div>
            <div class="contenedor-botones">
              <button class="btn btn-validar" data-id="${id}">✅ Validar</button>
              <button class="btn btn-rechazar" data-id="${id}">❌ Rechazar</button>
            </div>
          </div>
        </div>
      </td>
    `;

    if (tipoEntrega === "domicilio") {
      cuerpoDomicilio.appendChild(fila);
    } else if (tipoEntrega === "tienda") {
      cuerpoSucursal.appendChild(fila);
    }
  });

  console.log(`Se cargaron ${pedidos.length} pedidos`);
};








// 🟩 3. Función que llama y dibuja
async function cargarPedidosEnTablas() {
  const pedidos = await window.llamarPedidos();
  window.renderPedidos(pedidos);
}

// 🟩 4. Esperador para que Firebase esté listo
function esperarFirebaseYcargarPedidos() {
  if (
    typeof window.firebaseDB !== "undefined" &&
    typeof window.collection === "function" &&
    typeof window.getDocs === "function"
  ) {
    cargarPedidosEnTablas();
  } else {
    setTimeout(esperarFirebaseYcargarPedidos, 100);
  }
}

esperarFirebaseYcargarPedidos();



















});




