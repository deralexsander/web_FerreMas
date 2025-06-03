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

          // ✅ Guardar usuario globalmente
          window.usuarioActual = datos;

          const ruta = window.location.pathname;

          if (
            ruta === "/direccion/" &&
            typeof cargarDirecciones === "function" &&
            document.getElementById("tbody-direcciones")
          ) {
            await cargarDirecciones();

            // Esperar un poco antes de buscar la dirección seleccionada
            setTimeout(async () => {
              try {
                const refSeleccion = window.doc(
                  window.firebaseDB,
                  "direccionesSeleccionadas",
                  user.uid
                );
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
            }, 300);
          }

          // ✅ Si estamos en la vista de pedidos, cargar pedidos inmediatamente
          if (ruta === "/pedidos_realizados/" && typeof cargarPedidosEnTablas === "function") {
            cargarPedidosEnTablas();
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
  // tabla de todos los trabajadores
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
  //
  // tabla de productos (bodega)
  //
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

  //---------------------------------
  //
  // tabla de últimos productos (tarjetas)
  //
  //---------------------------------
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



  //---------------------------------
  //
  // tabla de direcciones del usuario
  //
  //---------------------------------
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

  //---------------------------------
  //
  // tabla de transferencias pendientes
  //
  //---------------------------------
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
              pedido: "En espera de preparación",
              boleta: "enviada"
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







  //---------------------------------
  //
  // tabla de historial de transferencias
  //
  //---------------------------------
  window.cargarHistorialTransferencias = async function () {
    const tabla = document.querySelector("#historial-tabla-transferencias tbody");
    if (!tabla) return;

    try {
      const ref = window.collection(window.firebaseDB, "pedidos");
      const snapshot = await window.getDocs(ref);

      tabla.innerHTML = "";

      let hayHistorial = false;

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

        hayHistorial = true;

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

      if (!hayHistorial) {
        tabla.innerHTML = `
          <tr>
            <td colspan="9" style="text-align: center; padding: 20px;">
              <em>📄 No hay historial de transferencias disponibles.</em>
            </td>
          </tr>
        `;
      }

    } catch (error) {
      console.error("❌ Error al cargar historial:", error);
      alert("No se pudo cargar el historial de pagos.");
    }
  };

  //---------------------------------
  //
  // tabla de pedidos (por preparar y sucursal)
  //
  //---------------------------------
  window.llamarPedidos = async function () {
    try {
      const ref = window.collection(window.firebaseDB, "pedidos");
      const snapshot = await window.getDocs(ref);
      const pedidos = [];
      snapshot.forEach(docSnap => {
        pedidos.push({ id: docSnap.id, ...docSnap.data() });
      });
      return pedidos;
    } catch (error) {
      return [];
    }
  };

  window.renderPedidos = function (pedidos) {
    const cuerpoDomicilio = document.querySelector("#tabla-pedidos-domicilio tbody");
    const cuerpoSucursal = document.querySelector("#tabla-pedidos-sucursal tbody");

    if (!cuerpoDomicilio || !cuerpoSucursal) return;

    cuerpoDomicilio.innerHTML = "";
    cuerpoSucursal.innerHTML = "";

    const pedidosFiltrados = pedidos.filter(p => {
      const estado = (p.pedido || "").toLowerCase();
      return (
        estado === "en espera de preparación" ||
        estado === "en preparación" ||
        estado === "en preparación - armando" ||
        estado === "en preparación - terminado" ||
        estado === "listo para entrega/envío" ||
        estado === "listo para entrega" ||
        estado === "pedido enviado" 
      );
    });

    pedidosFiltrados.forEach(p => {
      const fila = document.createElement("tr");

      let fechaCorta = "none";
      try {
        const fechaObj = typeof p.timestamp === "string"
          ? new Date(p.timestamp)
          : p.timestamp.toDate?.() || new Date(p.timestamp);
        if (!isNaN(fechaObj)) {
          fechaCorta = fechaObj.toLocaleDateString("es-CL");
        }
      } catch (e) {}

      const total = typeof p.total === "number" ? `$${p.total.toLocaleString("es-CL")}` : "none";
      const tipoEntrega = (p.tipoEntrega || "").toLowerCase();
      const estadoPedido = p.pedido || "none";
      const id = p.uid || p.id || "none";

      const direccion = p.direccionDespacho || {};
      const rut = p.rutTitular || direccion.rut || "none";
      const nombreTitular = p.nombreTitular || direccion.nombre || "none";
      const email = p.email || direccion.email || direccion.correo || "none";
      const comuna = p.comuna || direccion.comuna || p.comunaSucursal || "none";
      const region = p.region || direccion.region || p.regionSucursal || "none";
      const calleNumero = direccion.calleNumero || "";
      const departamento = direccion.departamento || "";
      const direccionCompleta = `${calleNumero} ${departamento}`.trim();

      const productosArray = Array.isArray(p.productos)
        ? p.productos
        : Array.isArray(p.carrito)
          ? p.carrito
          : [];

      const productos = productosArray.length > 0
        ? `<ul style="padding-left: 0; list-style: none;">${productosArray.map(prod => `
            <li style="display: flex; align-items: center; margin-bottom: 6px;">
              ${prod.imagen ? `<img src="${prod.imagen}" alt="${prod.nombre}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">` : ""}
              <span>${prod.cantidad || 1} × ${prod.nombre || "Producto"} — $${prod.precio?.toLocaleString("es-CL") || "0"}</span>
            </li>`).join("")}</ul>`
        : "<em>No hay productos</em>";

      // Para el cuerpo del correo
      const productosTexto = productosArray.length > 0
        ? productosArray.map(prod => `- ${prod.cantidad || 1} × ${prod.nombre || "Producto"}`).join('\n')
        : "Sin productos";

      let botonTomar = "";
      const estadoLower = estadoPedido.toLowerCase();

      if (tipoEntrega === "tienda") {
        if (estadoLower === "en espera de preparación") {
          botonTomar = `<button class="btn btn-tomar" data-id="${id}">🛒 Tomar pedido</button>`;
        } else if (estadoLower === "en preparación") {
          botonTomar = `<button class="btn" disabled style="opacity: 0.6; cursor: not-allowed;">📦 Pedido enviado al bodeguero</button>`;
        } else if (estadoLower === "en preparación - armando") {
          botonTomar = `<button class="btn" disabled style="opacity: 0.6; cursor: not-allowed;">🛠️ En armado</button>`;
        } else if (estadoLower === "en preparación - terminado") {
          // Cuando el pedido está terminado, mostrar botón para notificar retiro en tienda
          botonTomar = `<button class="btn btn-recibir-tienda" data-id="${id}" data-email="${email}" data-nombre="${nombreTitular}" data-productos="${encodeURIComponent(productosTexto)}" data-region="${region}" data-comuna="${comuna}">✅ Pedido listo para retiro</button>`;
        } else if (estadoLower === "listo para entrega/envío") {
          botonTomar = `<button class="btn" disabled style="opacity: 0.6; cursor: not-allowed;">⏳ Esperando retiro</button>`;
        }
      } else if (tipoEntrega === "domicilio") {
        if (estadoLower === "en espera de preparación") {
          botonTomar = `<button class="btn btn-tomar" data-id="${id}">🛒 Tomar pedido</button>`;
        } else if (estadoLower === "en preparación") {
          botonTomar = `<button class="btn" disabled style="opacity: 0.6; cursor: not-allowed;">📦 Pedido enviado al bodeguero</button>`;
        } else if (estadoLower === "en preparación - armando") {
          botonTomar = `<button class="btn" disabled style="opacity: 0.6; cursor: not-allowed;">🛠️ En armado</button>`;
        } else if (estadoLower === "en preparación - terminado") {
          // Mostrar botón para notificar envío a domicilio
          botonTomar = `<button class="btn btn-recibir-domicilio" data-id="${id}" data-email="${email}" data-nombre="${nombreTitular}" data-productos="${encodeURIComponent(productosTexto)}" data-calle="${calleNumero}" data-depto="${departamento}" data-region="${region}" data-comuna="${comuna}">🚚 Pedido enviado</button>`;
        } else if (estadoLower === "listo para entrega/envío") {
          // Mostrar botón para marcar como enviado (si se requiere)
          botonTomar = `<button class="btn btn-enviado-domicilio" data-id="${id}" disabled style="opacity: 0.6; cursor: not-allowed;">✈️ Pedido enviado</button>`;
        }
      }

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
                ${tipoEntrega === "domicilio" ? `<p><strong>Dirección:</strong> ${direccionCompleta}</p>` : ""}
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
                ${botonTomar}
                <button class="btn btn-mensaje" data-id="${id}">📩 Enviar mensaje</button>
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

    if (cuerpoDomicilio.children.length === 0) {
      cuerpoDomicilio.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;"><em>No hay pedidos a domicilio por preparar.</em></td></tr>`;
    }

    if (cuerpoSucursal.children.length === 0) {
      cuerpoSucursal.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;"><em>No hay pedidos en sucursal por preparar.</em></td></tr>`;
    }
  };

  // 🚀 Tomar pedido y botones personalizados
  document.addEventListener("click", async (event) => {
    // Tomar pedido
    if (event.target.classList.contains("btn-tomar")) {
      const idPedido = event.target.dataset.id;
      if (!idPedido) return;

      try {
        const pedidoRef = window.doc(window.firebaseDB, "pedidos", idPedido);
        const pedidoSnap = await window.getDoc(pedidoRef);

        if (!pedidoSnap.exists()) {
          alert("❌ El pedido no existe.");
          return;
        }

        const data = pedidoSnap.data();

        if ((data.pedido || "").toLowerCase() !== "en espera de preparación") {
          alert("⚠️ Este pedido ya fue tomado por otro vendedor. Actualizando la página...");
          location.reload();
          return;
        }

        await window.updateDoc(pedidoRef, { pedido: "En preparación" });

        alert("✅ Pedido tomado con éxito.");
        if (typeof window.recargarPedidos === "function") window.recargarPedidos();

      } catch (error) {
        console.error("Error al tomar pedido:", error);
        alert("❌ Ocurrió un error al intentar tomar el pedido.");
      }
    }

    // Botón para notificar retiro en tienda
    if (event.target.classList.contains("btn-recibir-tienda")) {
      const idPedido = event.target.dataset.id;
      const email = event.target.dataset.email;
      const nombre = event.target.dataset.nombre;
      const productos = decodeURIComponent(event.target.dataset.productos || "");
      const region = event.target.dataset.region;
      const comuna = event.target.dataset.comuna;

      if (!idPedido) return;

      try {
        // Actualizar estado
        const pedidoRef = window.doc(window.firebaseDB, "pedidos", idPedido);
        await window.updateDoc(pedidoRef, { pedido: "listo para entrega" });

        // Enviar correo
        const asunto = "Pedido listo para retiro en sucursal";
        const cuerpo = `Hola ${nombre},\n\nTu pedido (${idPedido}) con los siguientes productos:\n${productos}\n\nestá listo para ser retirado en la sucursal de ${region}, ${comuna} que seleccionaste.\n\nGracias por tu preferencia.`;

        const enlace = document.createElement("a");
        enlace.href = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
        enlace.style.display = "none";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        alert("📦 El cliente ha sido notificado para retirar el pedido en sucursal.");
        if (typeof window.recargarPedidos === "function") window.recargarPedidos();

      } catch (error) {
        console.error("Error al marcar como listo para retiro:", error);
        alert("❌ Error al actualizar el pedido.");
      }
    }

    // Botón para notificar envío a domicilio
    if (event.target.classList.contains("btn-recibir-domicilio")) {
      const idPedido = event.target.dataset.id;
      const email = event.target.dataset.email;
      const nombre = event.target.dataset.nombre;
      const productos = decodeURIComponent(event.target.dataset.productos || "");
      const calle = event.target.dataset.calle || "";
      const depto = event.target.dataset.depto || "";
      const region = event.target.dataset.region;
      const comuna = event.target.dataset.comuna;
      const direccion = `${calle} ${depto}`.trim();

      if (!idPedido) return;

      try {
        // Actualizar estado
        const pedidoRef = window.doc(window.firebaseDB, "pedidos", idPedido);
        await window.updateDoc(pedidoRef, { pedido: "pedido enviado" });

        // Enviar correo
        const asunto = "Tu pedido ha sido enviado";
        const cuerpo = `Hola ${nombre},\n\nTu pedido (${idPedido}) con los siguientes productos:\n${productos}\n\nha sido enviado a tu dirección: ${direccion}, ${comuna}, ${region}.\n\nGracias por tu preferencia.`;

        const enlace = document.createElement("a");
        enlace.href = `mailto:${email}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
        enlace.style.display = "none";
        document.body.appendChild(enlace);
        enlace.click();
        document.body.removeChild(enlace);

        alert("🚚 El cliente ha sido notificado del envío a domicilio.");
        if (typeof window.recargarPedidos === "function") window.recargarPedidos();

      } catch (error) {
        console.error("Error al marcar como enviado:", error);
        alert("❌ Error al actualizar el pedido.");
      }
    }

    // Botón para marcar como enviado (domicilio) - solo informativo, no hace nada extra
    if (event.target.classList.contains("btn-enviado-domicilio")) {
      alert("El pedido ya fue marcado como enviado.");
    }
  });


  async function cargarPedidosEnTablas() {
    const usuario = window.usuarioActual;

    if (!usuario) {
      setTimeout(cargarPedidosEnTablas, 100);
      return;
    }

    const pedidos = await window.llamarPedidos();
    const filtro = document.getElementById("sucursal")?.value || "mi_sucursal";

    const comunaSucursal = normalizarTexto(usuario?.comunaSucursal || "");
    const regionSucursal = normalizarTexto(usuario?.regionSucursal || "");

    let pedidosFiltrados;

    if (filtro === "enviados/listos") {
      // Solo mostrar pedidos con estado "pedido enviado" o "listo para entrega"
      pedidosFiltrados = pedidos.filter(p => {
        const estado = (p.pedido || "").toLowerCase();
        return estado === "pedido enviado" || estado === "listo para entrega";
      });
    } else if (filtro === "mi_sucursal") {
      pedidosFiltrados = pedidos.filter(p => {
        const comuna = normalizarTexto(p.comuna || p.comunaSucursal || p.direccionDespacho?.comuna || "");
        const region = normalizarTexto(p.region || p.regionSucursal || p.direccionDespacho?.region || "");

        const matchComuna = comuna === comunaSucursal;
        const matchRegion = region.includes(regionSucursal) || regionSucursal.includes(region);

        const perteneceAMiSucursal = matchComuna && matchRegion;

        // Si el pedido no tiene región o comuna clara, lo mostramos
        const direccionInvalida = comuna === "none" || region === "none";

        // Mostrar si:
        // - Pertenece a mi sucursal
        // - O la dirección es inválida
        const mostrar = perteneceAMiSucursal || direccionInvalida;

        // Excluir los estados "pedido enviado" y "listo para entrega"
        const estado = (p.pedido || "").toLowerCase();
        if (estado === "pedido enviado" || estado === "listo para entrega") return false;

        return mostrar;
      });
    } else if (filtro === "todos") {
      // Mostrar todos, excepto los enviados/listos
      pedidosFiltrados = pedidos.filter(p => {
        const estado = (p.pedido || "").toLowerCase();
        return estado !== "pedido enviado" && estado !== "listo para entrega";
      });
    } else {
      pedidosFiltrados = pedidos;
    }

    window.renderPedidos(pedidosFiltrados);
  }

  // ✅ Función para limpiar texto: minúsculas, sin espacios dobles ni acentos
  function normalizarTexto(texto) {
    return texto
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") // elimina tildes
      .replace(/\s+/g, " "); // colapsa múltiples espacios en uno
  }



  document.getElementById("sucursal")?.addEventListener("change", () => {
    cargarPedidosEnTablas();
  });

  //---------------------------------
  //
  // tabla de pedidos por armar
  //
  //---------------------------------
  window.cargarPedidosAArmar = async function () {
    const tabla = document.querySelector("#tabla-armar-pedidos-pedidos-sucursal tbody");
    if (!tabla) return;

    tabla.innerHTML = "";
    const pedidos = await window.llamarPedidos();
    const usuario = window.usuarioActual;

    const comunaSucursal = normalizarTexto(usuario?.comunaSucursal || "");
    const regionSucursal = normalizarTexto(usuario?.regionSucursal || "");
    const filtro = document.getElementById("sucursal")?.value || "mi_sucursal";

    const pedidosFiltrados = pedidos.filter(p => {
      const estado = (p.pedido || "").toLowerCase();
      const esPreparacion = estado === "en preparación" || estado === "en preparación - armando";
      if (!esPreparacion) return false;

      const comuna = normalizarTexto(p.comuna || p.comunaSucursal || p.direccionDespacho?.comuna || "");
      const region = normalizarTexto(p.region || p.regionSucursal || p.direccionDespacho?.region || "");
      if (filtro === "todos") return true;

      const matchComuna = comuna === comunaSucursal;
      const matchRegion = region.includes(regionSucursal) || regionSucursal.includes(region);
      return matchComuna && matchRegion;
    });

    if (pedidosFiltrados.length === 0) {
      tabla.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;"><em>No hay pedidos por armar en esta vista.</em></td></tr>`;
      return;
    }

    pedidosFiltrados.forEach(p => {
      const fila = document.createElement("tr");

      let fechaCorta = "none";
      try {
        const fechaObj = typeof p.timestamp === "string"
          ? new Date(p.timestamp)
          : p.timestamp.toDate?.() || new Date(p.timestamp);
        if (!isNaN(fechaObj)) fechaCorta = fechaObj.toLocaleDateString("es-CL");
      } catch (e) {}

      const total = typeof p.total === "number" ? `$${p.total.toLocaleString("es-CL")}` : "none";
      const estadoPedido = p.pedido || "none";
      const idDoc = p.id || null;

      const direccion = p.direccionDespacho || {};
      const rut = p.rutTitular || direccion.rut || "none";
      const nombreTitular = p.nombreTitular || direccion.nombre || "none";
      const comuna = p.comuna || direccion.comuna || p.comunaSucursal || "none";
      const region = p.region || direccion.region || p.regionSucursal || "none";

      const productosArray = Array.isArray(p.productos) ? p.productos : (Array.isArray(p.carrito) ? p.carrito : []);
      const productos = productosArray.length > 0
        ? `<ul style="padding-left: 0; list-style: none;">${productosArray.map(prod => `
          <li style="display: flex; align-items: center; margin-bottom: 6px;">
            ${prod.imagen ? `<img src="${prod.imagen}" alt="${prod.nombre}" style="width: 50px; height: 50px; object-fit: cover; margin-right: 10px; border-radius: 4px;">` : ""}
            <span>${prod.cantidad || 1} × ${prod.nombre || "Producto"} — $${prod.precio?.toLocaleString("es-CL") || "0"}</span>
          </li>`).join("")}</ul>`
        : "<em>No hay productos</em>";

      let boton = "";
      const estadoLower = estadoPedido.toLowerCase();
      if (estadoLower === "en preparación") {
        boton = `<button class="btn btn-armar" data-id="${idDoc}">🛠️ Armar pedido</button>`;
      } else if (estadoLower === "en preparación - armando") {
        boton = `<button class="btn btn-terminar" data-id="${idDoc}">✅ Pedido terminado</button>`;
      }

      fila.innerHTML = `
        <td colspan="9">
          <div class="contenedor-pedido-grid">
            <div class="lado-datos">
              <div class="lado-izquierdo">
                <p><strong>RUT:</strong> ${rut}</p>
                <p><strong>Nombre:</strong> ${nombreTitular}</p>
                <p><strong>Estado pedido:</strong> ${estadoPedido}</p>
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
              <div class="contenedor-botones">${boton}</div>
            </div>
          </div>
        </td>`;
      tabla.appendChild(fila);
    });
  };


  // 🟥 Evento para botones "Armar" y "Terminar"
  document.body.addEventListener("click", async (e) => {
    const id = e.target.dataset.id;
    if (!id) return;

    if (e.target.classList.contains("btn-armar")) {
      const pedidoRef = window.doc(window.firebaseDB, "pedidos", id);
      const snap = await window.getDoc(pedidoRef);
      if (!snap.exists()) return mostrarMensaje("❌ No existe el pedido.");

      const data = snap.data();
      if ((data.pedido || "").toLowerCase() !== "en preparación") {
        mostrarMensaje("⚠️ El pedido ya fue tomado.");
        return location.reload();
      }

      await window.updateDoc(pedidoRef, { pedido: "En preparación - armando" });
      mostrarMensaje("✅ Pedido tomado correctamente.");
      return location.reload();
    }

    if (e.target.classList.contains("btn-terminar")) {
      const pedidoRef = window.doc(window.firebaseDB, "pedidos", id);
      const snap = await window.getDoc(pedidoRef);
      if (!snap.exists()) return mostrarMensaje("❌ No existe el pedido.");

      const data = snap.data();
      if ((data.pedido || "").toLowerCase() !== "en preparación - armando") {
        mostrarMensaje("⚠️ El pedido ya fue terminado.");
        return location.reload();
      }

      const productos = Array.isArray(data.productos) ? data.productos : (Array.isArray(data.carrito) ? data.carrito : []);
      for (const item of productos) {
        const uid = item.uid;
        const cantidad = item.cantidad || 1;
        if (!uid) continue;

        const prodRef = window.doc(window.firebaseDB, "productos", uid);
        const prodSnap = await window.getDoc(prodRef);
        if (!prodSnap.exists()) continue;

        const stock = prodSnap.data().stock || 0;
        await window.setDoc(prodRef, { stock: Math.max(0, stock - cantidad) }, { merge: true });
      }

      await window.setDoc(pedidoRef, {
        pedido: "En preparación - terminado",
        terminadoEn: new Date()
      }, { merge: true });

      mostrarMensaje("✅ Pedido terminado y stock descontado.");
      location.reload();
    }
  });

  // 🟨 Esperador para cargar pedidos a armar correctamente
  function esperarFirebaseYcargarPedidosAArmar() {
    if (
      typeof window.firebaseDB !== "undefined" &&
      typeof window.collection === "function" &&
      typeof window.getDocs === "function" &&
      typeof window.usuarioActual !== "undefined" &&
      window.usuarioActual !== null
    ) {
      window.cargarPedidosAArmar();
    } else {
      setTimeout(esperarFirebaseYcargarPedidosAArmar, 100);
    }
  }

  // 🟩 Llamar la función al iniciar
  esperarFirebaseYcargarPedidosAArmar();

  // 🔁 También cuando cambia el select de sucursal
  document.getElementById("sucursal")?.addEventListener("change", () => {
    window.cargarPedidosAArmar();
  });


  window.cargarPedidosAArmar();

  //---------------------------------
  //
  // tabla de historial de pedidos
  //
  //---------------------------------
  window.cargarHistorialPedidos = async function () {
    const tabla = document.querySelector("#tabla-historial-pedidos tbody");
    if (!tabla) return;

    tabla.innerHTML = "<tr><td colspan='9'>Cargando pedidos...</td></tr>";

    try {
      const ref = window.collection(window.firebaseDB, "pedidos");
      const snapshot = await window.getDocs(ref);

      tabla.innerHTML = "";

      if (snapshot.empty) {
        tabla.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 20px;"><em>No hay pedidos en el historial.</em></td></tr>`;
        return;
      }

      snapshot.forEach((docSnap) => {
        const p = docSnap.data();
        const id = docSnap.id;

        let fechaCorta = "-";
        try {
          const fechaObj = typeof p.timestamp === "string"
            ? new Date(p.timestamp)
            : p.timestamp?.toDate?.() || new Date(p.timestamp);
          if (!isNaN(fechaObj)) fechaCorta = fechaObj.toLocaleDateString("es-CL");
        } catch {}

        const total = typeof p.total === "number" ? `$${p.total.toLocaleString("es-CL")}` : "-";
        const estadoPedido = p.pedido || "-";
        const rut = p.rutTitular || p.direccionDespacho?.rut || "-";
        const nombreTitular = p.nombreTitular || p.direccionDespacho?.nombre || "-";
        const comuna = p.comuna || p.direccionDespacho?.comuna || p.comunaSucursal || "-";
        const region = p.region || p.direccionDespacho?.region || p.regionSucursal || "-";

        const productosArray = Array.isArray(p.productos)
          ? p.productos
          : Array.isArray(p.carrito)
            ? p.carrito
            : [];
        const productos = productosArray.length > 0
          ? `<ul style="padding-left: 0; list-style: none;">${productosArray.map(prod => `
              <li style="display: flex; align-items: center; margin-bottom: 6px;">
                ${prod.imagen ? `<img src="${prod.imagen}" alt="${prod.nombre}" style="width: 40px; height: 40px; object-fit: cover; margin-right: 8px; border-radius: 4px;">` : ""}
                <span>${prod.cantidad || 1} × ${prod.nombre || "Producto"} — $${prod.precio?.toLocaleString("es-CL") || "0"}</span>
              </li>`).join("")}</ul>`
          : "<em>No hay productos</em>";

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td colspan="9">
            <div class="contenedor-pedido-grid">
              <div class="lado-datos">
                <div class="lado-izquierdo">
                  <p><strong>RUT:</strong> ${rut}</p>
                  <p><strong>Nombre:</strong> ${nombreTitular}</p>
                  <p><strong>Estado pedido:</strong> ${estadoPedido}</p>
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
                <div><strong>ID Pedido:</strong> ${id}</div>
              </div>
            </div>
          </td>
        `;
        tabla.appendChild(fila);
      });

    } catch (error) {
      console.error("❌ Error al cargar historial de pedidos:", error);
      tabla.innerHTML = `<tr><td colspan="9">Ocurrió un error al cargar los pedidos.</td></tr>`;
    }
  };

  // Puedes llamar esta función cuando abras el modal:
  document.getElementById("modal-historial")?.addEventListener("show", () => {
    window.cargarHistorialPedidos();
  });

  // O simplemente llama window.cargarHistorialPedidos() cuando quieras mostrar el historial.

});




