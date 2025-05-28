


  





  // Función para cambiar entre formularios
  function cambiarFormulario(ocultar, mostrar) {
    if (ocultar && mostrar) {
      ocultar.style.display = 'none';
      mostrar.style.display = 'block';
    }
  }

  // ========== FUNCIÓN PARA CREAR TRABAJADORES (GLOBAL) ==========
  window.crearTrabajador = async function() {
    let adminActual, adminEmail, adminPassword;
    try {
      const correo = document.getElementById("correo-trabajador").value.trim().toLowerCase();
      const nombre = document.getElementById("nombre-trabajador").value.trim();
      const apellidoPaterno = document.getElementById("apellido-paterno-trabajador").value.trim();
      const apellidoMaterno = document.getElementById("apellido-materno-trabajador").value.trim();
      const rut = document.getElementById("rut-trabajador").value.trim();
      const rol = document.getElementById("rol-trabajador").value;
      const password = document.getElementById("password-trabajador").value.trim();
      const regionSucursal = document.getElementById("region-sucursal").value;
      const comunaSucursal = document.getElementById("comuna-sucursal").value;

      // Validación de campos
      if (!correo || !nombre || !apellidoPaterno || !apellidoMaterno || !rut || !rol || !password || !regionSucursal || !comunaSucursal) {
        mostrarMensaje("Todos los campos son obligatorios.");
        return;
      }

      adminActual = auth.currentUser;
      adminEmail = adminActual.email;
      adminPassword = prompt("Por seguridad, ingrese su contraseña de administrador:");

      if (!adminPassword) {
        mostrarMensaje("Se requiere la contraseña de administrador.");
        return;
      }

      // Crear el usuario trabajador
      const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
      const nuevoUsuario = userCredential.user;

      const nuevoTrabajador = {
        uid: nuevoUsuario.uid,
        correo,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        rut,
        rol,
        password,
        cambiarContraseña: true,
        creadoEn: Timestamp.now(),
        creadoPor: adminActual.uid,
        regionSucursal,
        comunaSucursal
      };

      await setDoc(doc(db, "trabajadores", nuevoUsuario.uid), nuevoTrabajador);

      // Cerrar sesión del trabajador recién creado
      await signOut(auth);

      // Volver a iniciar sesión como admin
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

      // IMPORTANTE: Recargar la página para evitar que el modal de cambiar contraseña se muestre al admin
      window.location.reload();

      // mostrarMensaje("Trabajador creado correctamente", "success");
      // document.querySelectorAll('input').forEach(input => input.value = '');

    } catch (error) {
      console.error("Error completo:", error);

      if (error.code === 'permission-denied') {
        mostrarMensaje("Error: No tienes permisos para realizar esta acción. Contacta al administrador.");
      } else if (error.code === 'auth/email-already-in-use') {
        mostrarMensaje("Error: Este correo ya está registrado.");
      } else {
        mostrarMensaje("Error: " + error.message);
      }

      if (adminActual && adminEmail && adminPassword) {
        try {
          await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        } catch (reauthError) {
          console.error("Error al reautenticar:", reauthError);
        }
      }
    }
  };
  

  // ========== MANEJO DE AUTENTICACIÓN ==========
  const pathActual = window.location.pathname;

  onAuthStateChanged(auth, async (user) => {
    const trabajadorStorage = JSON.parse(sessionStorage.getItem("trabajador"));
    if (!user || (trabajadorStorage && user.uid !== trabajadorStorage.id)) {
      sessionStorage.removeItem("trabajador");
    }

    const botonAccesoLink = document.querySelector('a[href="/acceso/"]');
    if (botonAccesoLink) botonAccesoLink.setAttribute('href', user ? '/perfil/' : '/acceso/');
    if (user && pathActual === '/acceso/') window.location.href = '/perfil/';
    if (!user && pathActual === '/perfil/') window.location.href = '/acceso/';

    const nombreUsuario = document.getElementById('nombre-usuario');
    const correoUsuario = document.getElementById('correo-usuario');
    const tipoUsuario = document.getElementById('rol-usuario');

    let rol = "";
    let datosTrabajador = null;

    try {
      if (user) {
        const docRef = doc(db, "trabajadores", user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          datosTrabajador = docSnap.data();
          rol = (datosTrabajador?.rol || "").toLowerCase().trim();
          sessionStorage.setItem("trabajador", JSON.stringify({ ...datosTrabajador, id: user.uid }));

          if (datosTrabajador?.cambiarContraseña === true) {
            const modal = document.getElementById("passwordChangeModal");
            if (modal) modal.style.display = "block";
          }
        } else {
          const q = query(
            collection(db, "trabajadores"),
            where("correo", "==", user.email.toLowerCase())
          );
          const resultado = await getDocs(q);

          if (!resultado.empty) {
            const data = resultado.docs[0].data();
            rol = (data?.rol || "").toLowerCase().trim();
            datosTrabajador = { ...data, id: resultado.docs[0].id };
            sessionStorage.setItem("trabajador", JSON.stringify(datosTrabajador));

            if (data?.cambiarContraseña === true) {
              const modal = document.getElementById("passwordChangeModal");
              if (modal) modal.style.display = "block";
            }
          } else {
            rol = "cliente";
            sessionStorage.setItem("trabajador", JSON.stringify({ rol: "cliente" }));
          }
        }
      }
    } catch (e) {
      console.error("Error obteniendo datos de trabajador:", e);
      rol = "";
    }

    if (tipoUsuario) {
      const rolesDisplay = {
        admin: "Tipo: Admin",
        vendedor: "Tipo: Vendedor",
        contador: "Tipo: Contador",
        bodeguero: "Tipo: Bodeguero",
        cliente: "Tipo: Cliente"
      };
      tipoUsuario.textContent = rolesDisplay[rol] || rolesDisplay.cliente;
    }

    const body = document.body;
    const roleClasses = [
      'usuario-admin',
      'usuario-vendedor',
      'usuario-contador',
      'usuario-bodeguero',
      'usuario-cliente'
    ];
    body.classList.remove(...roleClasses);
    body.classList.add(`usuario-${rol || "cliente"}`);

    if (nombreUsuario && correoUsuario && user) {
      const trabajadorCorreo = datosTrabajador?.correo || "";

      await user.reload();
      const userRefrescado = auth.currentUser;

      const sessionNombre = sessionStorage.getItem("nombreRegistroCliente") || "";
      const nombreBase = userRefrescado.displayName || sessionNombre || datosTrabajador?.nombre || "";
      const apellidoPaterno = datosTrabajador?.apellidoPaterno || "";
      const apellidoMaterno = datosTrabajador?.apellidoMaterno || "";

      let nombreCompleto = `${nombreBase} ${apellidoPaterno} ${apellidoMaterno}`.trim();
      if (!nombreCompleto) {
        nombreCompleto = user.email.split("@")[0];
      }

      nombreUsuario.textContent = nombreCompleto;
      correoUsuario.textContent = trabajadorCorreo || user.email;

      // ✅ Mostrar región y comuna
      const regionUsuario = document.getElementById("region-trabajador");
      const comunaUsuario = document.getElementById("comuna-trabajador");

      if (regionUsuario) regionUsuario.textContent = `Región: ${datosTrabajador?.regionSucursal || "No registrada"}`;
      if (comunaUsuario) comunaUsuario.textContent = `Comuna: ${datosTrabajador?.comunaSucursal || "No registrada"}`;
    }

    // Mostrar/ocultar botones según el rol
    if (rol === "admin") {
      document.querySelectorAll(".solo-trabajadores").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-admin").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-vendedor, .solo-bodeguero, .solo-contador .solo-vendedor").forEach(btn => {
        btn.style.display = "block";
      });
      if (document.querySelector("#tabla-trabajadores tbody")) {
        cargarTrabajadores();
      }
    } else if (rol === "vendedor") {
      document.querySelectorAll(".solo-trabajadores").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-vendedor").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-admin, .solo-bodeguero, .solo-contador").forEach(btn => {
        btn.style.display = "none";
      });
    } else if (rol === "bodeguero") {
      document.querySelectorAll(".solo-trabajadores").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-bodeguero").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-admin, .solo-vendedor, .solo-contador").forEach(btn => {
        btn.style.display = "none";
      });
    } else if (rol === "contador") {
      document.querySelectorAll(".solo-trabajadores").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-contador").forEach(btn => {
        btn.style.display = "block";
      });
      document.querySelectorAll(".solo-admin, .solo-vendedor, .solo-bodeguero").forEach(btn => {
        btn.style.display = "none";
      });
    } else if (rol === "cliente") {
      document.querySelectorAll(".solo-trabajadores, .solo-admin, .solo-vendedor, .solo-bodeguero, .solo-contador").forEach(btn => {
        btn.style.display = "none";
      });
    } else {
      document.querySelectorAll(".solo-trabajadores, .solo-admin, .solo-vendedor, .solo-bodeguero, .solo-contador").forEach(btn => {
        btn.style.display = "none";
      });
    }
  });

  
  



  
  // ========== MANEJO DE FORMULARIOS ==========

  // Formulario de registro de cliente
  const formularioRegistro = document.querySelector('.centrar-registro-cliente .form');
  if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = formularioRegistro.querySelector('input[type="email"]').value.trim();
      const username = document.getElementById("nombre-registro-cliente").value.trim();
      const password = formularioRegistro.querySelectorAll('input[type="password"]')[0].value;
      const confirmPassword = formularioRegistro.querySelectorAll('input[type="password"]')[1].value;      
      if (!email || !username || !password || !confirmPassword) return mostrarMensaje('Por favor, completa todos los campos.');
      if (password !== confirmPassword) return mostrarMensaje('Las contraseñas no coinciden');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        sessionStorage.setItem("nombreRegistroCliente", username);
        await userCredential.user.reload();
        window.location.href = "/";
      } catch (error) {
        console.error(error);
        mostrarMensaje(error.message);
      }
    });
  }








  // Formulario de login de cliente
  const formularioLogin = document.querySelector('.centrar-login-cliente .form');
  if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = formularioLogin.querySelectorAll('.input');
      const email = inputs[0].value.trim();
      const password = inputs[1].value.trim();
      if (!email || !password) return mostrarMensaje('Por favor, completa ambos campos.');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        sessionStorage.setItem("trabajador", JSON.stringify({ rol: null }));
        window.location.href = "/";
      } catch (error) {
        console.error(error);
        mostrarMensaje('Usuario o contraseña incorrectos.');
      }
    });
  }


  // Formulario de recuperación de contraseña
  const formularioRecuperar = document.querySelector('.centrar-recuperar .form');
  const botonRecuperar = formularioRecuperar?.querySelector('.button-submit');

  if (formularioRecuperar && botonRecuperar) {
    botonRecuperar.addEventListener('click', async (e) => {
      e.preventDefault();
      const inputCorreo = formularioRecuperar.querySelector('.input');
      const email = inputCorreo.value.trim();

      if (!email) {
        mostrarMensaje('Por favor, ingresa tu correo.');
        return;
      }

      try {
        await sendPasswordResetEmail(auth, email);
        mostrarMensaje('Te hemos enviado un correo para restablecer tu contraseña.');
        inputCorreo.value = '';

        // Cambia al formulario de login del cliente
        const loginCliente = document.querySelector('.centrar-login-cliente');
        cambiarFormulario(formularioRecuperar.closest('.centrar-recuperar'), loginCliente);

      } catch (error) {
        console.error(error);
        mostrarMensaje('Correo no registrado o error al enviar el correo.');
      }
    });
  }

  const botonLogout = document.getElementById('boton-logout');
  if (botonLogout) {
    botonLogout.addEventListener('click', async () => {
      try {
        await signOut(auth);
        sessionStorage.removeItem("trabajador");
        localStorage.clear(); // ✅ Limpia todo el localStorage
        alert('Has cerrado sesión correctamente.');
        window.location.href = '/acceso/';
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error al intentar cerrar sesión.');
      }
    });
  }





  const modal = document.getElementById("passwordChangeModal");
  const trabajador = JSON.parse(sessionStorage.getItem("trabajador"));
  
  // Mostrar u ocultar el modal según cambiarContraseña
  if (trabajador?.cambiarContraseña === true) {
    modal.style.display = "block";
  } else {
    modal.style.display = "none";
  }
  
  // Lógica del formulario de cambio de contraseña
  const formCambio = document.getElementById("changePasswordForm");
  if (formCambio) {
    formCambio.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const currentPassword = document.getElementById("currentPassword").value.trim();
      const newPassword = document.getElementById("newPassword").value.trim();
      const confirmPassword = document.getElementById("confirmPassword").value.trim();
      const contraseñaInicial = "ni209mu!835co";
  
      if (!currentPassword || !newPassword || !confirmPassword) {
        alert("Completa todos los campos.");
        return;
      }
  
      if (newPassword !== confirmPassword) {
        alert("La nueva contraseña no coincide con la confirmación.");
        return;
      }
  
      if (newPassword.length < 6) {
        alert("La nueva contraseña debe tener al menos 6 caracteres.");
        return;
      }
  
      if (currentPassword === newPassword) {
        alert("La nueva contraseña no puede ser igual a la actual.");
        return;
      }
  
      if (newPassword === contraseñaInicial) {
        alert("No puedes usar la contraseña inicial predeterminada.");
        return;
      }
  
      try {
        const user = auth.currentUser;
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
  
        // Reautenticar al usuario
        await reauthenticateWithCredential(user, credential);
  
        // Cambiar contraseña
        await updatePassword(user, newPassword);
  
        // Asegurar que el trabajador esté bien cargado
        let trabajador = JSON.parse(sessionStorage.getItem("trabajador"));
        if (!trabajador || !trabajador.id) {
          throw new Error("No se pudo obtener la información del trabajador desde sessionStorage.");
        }
  
        // Actualizar cambiarContraseña a false en Firestore y sessionStorage
        await setDoc(
          doc(db, "trabajadores", trabajador.id),
          { cambiarContraseña: false },
          { merge: true }
        );
        trabajador.cambiarContraseña = false;
        sessionStorage.setItem("trabajador", JSON.stringify(trabajador));
  
        alert("Contraseña cambiada con éxito.");
        modal.style.display = "none";
      } catch (error) {
        console.error("Error al cambiar la contraseña:", error);
        alert("Error al cambiar la contraseña. Verifica la contraseña actual o inténtalo nuevamente.");
      }
    });
  }
  











  const contenedor = document.getElementById("contenedor-productos");

  async function cargarUltimosProductos() {
    const productosRef = collection(db, "productos");
    const q = query(productosRef, orderBy("creadoEn", "desc"), limit(3));
  
    try {
      const snapshot = await getDocs(q);
  
      snapshot.forEach(doc => {
        const producto = doc.data();
        const imagenUrl = producto.codigoImagen
          ? `/media/productos/${producto.codigoImagen}.jpg`
          : '/static/img/imagen-no-disponible.jpg';
  
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-producto";
        tarjeta.innerHTML = `
          <div class="tarjeta-producto__shine"></div>
          <div class="tarjeta-producto__glow"></div>
          <div class="tarjeta-producto__content">
            <div class="tarjeta-producto__badge">NUEVO</div>
            <div class="tarjeta-producto__image" style="background-image: url('${imagenUrl}'); background-size: cover; background-position: center;"></div>
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
          document.getElementById("modal-nombre").textContent = producto.nombre || "Producto sin nombre";
          document.getElementById("modal-categoria").textContent = producto.categoria || "Sin categoría";
          document.getElementById("modal-descripcion").textContent = producto.descripcion || "Sin descripción";
          document.getElementById("modal-marca").textContent = `Marca: ${producto.marca || "Sin marca"}`;
          document.getElementById("modal-precio").textContent = `$${(producto.precio || 0).toLocaleString('es-CL')}`;
          document.getElementById("modal-stock").textContent = `Disponibles: ${producto.stock || 0}`;
          document.getElementById("modal-codigo").textContent = `Codigo: ${producto.codigo || "Sin código"}`;
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
          document.getElementById("modal-producto").setAttribute("data-uid", doc.id);  
          document.getElementById("modal-producto").style.display = "block";
          document.getElementById("cantidad").value = 1;
        });
  
        contenedor.appendChild(tarjeta);
      });
    } catch (e) {
      console.error("Error al cargar productos:", e);
    }
  }






  
  async function cargarProductosPorCategoria(nombreCategoria, idContenedor) {
    const contenedor = document.getElementById(idContenedor);
    if (!contenedor) return;
  
    const productosRef = collection(db, "productos");
    const q = query(productosRef, where("categoria", "==", nombreCategoria));
  
    try {
      const snapshot = await getDocs(q);
      if (snapshot.empty) {
        contenedor.innerHTML = "<p>No hay productos disponibles.</p>";
        return;
      }
  
      snapshot.forEach(doc => {
        const producto = doc.data();
        const imagenUrl = producto.codigoImagen
          ? `/media/productos/${producto.codigoImagen}.jpg`
          : '/static/img/imagen-no-disponible.jpg';
  
        const tarjeta = document.createElement("div");
        tarjeta.className = "tarjeta-producto";
        tarjeta.innerHTML = `
          <div class="tarjeta-producto__shine"></div>
          <div class="tarjeta-producto__glow"></div>
          <div class="tarjeta-producto__content">
            <div class="tarjeta-producto__badge">${producto.novedad ? "NUEVO" : ""}</div>
            <div class="tarjeta-producto__image" style="background-image: url('${imagenUrl}'); background-size: cover; background-position: center;"></div>
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
          document.getElementById("modal-nombre").textContent = producto.nombre || "Producto sin nombre";
          document.getElementById("modal-categoria").textContent = producto.categoria || "Sin categoría";
          document.getElementById("modal-descripcion").textContent = producto.descripcion || "Sin descripción";
          document.getElementById("modal-marca").textContent = `Marca: ${producto.marca || "Sin marca"}`;
          document.getElementById("modal-precio").textContent = `$${(producto.precio || 0).toLocaleString('es-CL')}`;
          document.getElementById("modal-stock").textContent = `Disponibles: ${producto.stock || 0}`;
          document.getElementById("modal-codigo").textContent = `Codigo: ${producto.codigo || "Sin código"}`;
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
          document.getElementById("modal-producto").setAttribute("data-uid", doc.id);  
          document.getElementById("modal-producto").style.display = "block";
          document.getElementById("cantidad").value = 1;
        });

  
        contenedor.appendChild(tarjeta);
      });
  
    } catch (e) {
      console.error(`Error al cargar productos de categoría ${nombreCategoria}:`, e);
    }
  }
  
  // Llamadas
  cargarUltimosProductos();
  cargarProductosPorCategoria("herramientas_manual", "categoria-herramientas-manuales");
  cargarProductosPorCategoria("herramientas_electricas", "categoria-herramientas-electricas");
  cargarProductosPorCategoria("pinturas", "categoria-pinturas");
  cargarProductosPorCategoria("materiales_electricos", "categoria-materiales-electricos");
  cargarProductosPorCategoria("accesorios", "categoria-accesorios");
  cargarProductosPorCategoria("seguridad", "categoria-seguridad");

  




  




  // Modal: cerrar con botón, clic fuera o ESC
  const modalProducto = document.getElementById("modal-producto");
  const cerrarModalProducto = document.getElementById("cerrar-modal");
  
  if (modalProducto && cerrarModalProducto) {
    cerrarModalProducto.addEventListener("click", () => {
      modalProducto.style.display = "none";
    });
  
    window.addEventListener("click", (e) => {
      if (e.target === modalProducto) {
        modalProducto.style.display = "none";
      }
    });
  
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && modalProducto.style.display === "block") {
        modalProducto.style.display = "none";
      }
    });
  }
  

// ======= CONTADOR DE PRODUCTOS DIFERENTES =======
function actualizarContadorProductosDiferentes() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const badgeContador = document.getElementById("contador-productos");
  if (badgeContador) {
    badgeContador.textContent = carrito.length;
  }
}

// ======= ACTUALIZAR AL CARGAR LA PÁGINA =======
actualizarContadorProductosDiferentes();










// ======= CONTADOR DE PRODUCTOS DIFERENTES =======
function actualizarContadorProductosDiferentes() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const badgeContador = document.getElementById("contador-productos");
  if (badgeContador) {
    badgeContador.textContent = carrito.length;
  }
}

// ======= ACTUALIZAR AL CARGAR LA PÁGINA =======
actualizarContadorProductosDiferentes();

// ======= AGREGAR PRODUCTO AL CARRITO =======
const btnAgregarCarrito = document.getElementById("btn-agregar-carrito");

if (btnAgregarCarrito) {
  btnAgregarCarrito.addEventListener("click", () => {
    const nombre = document.getElementById("modal-nombre").textContent.trim();
    const precioTexto = document.getElementById("modal-precio").textContent.trim().replace(/\$/g, "").replace(/\./g, "").replace(",", ".");
    const precio = parseFloat(precioTexto);
    const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
    const uid = document.getElementById("modal-producto").getAttribute("data-uid");
    const imagen = document.getElementById("modal-imagen").src;

    if (!uid) {
      alert("❌ No se pudo identificar el producto. Intenta nuevamente.");
      return;
    }

    const nuevoItem = { uid, nombre, precio, cantidad, imagen };
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productoExistente = carrito.find(item => item.uid === nuevoItem.uid);

    if (productoExistente) {
      productoExistente.cantidad += cantidad;
    } else {
      carrito.push(nuevoItem);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorProductosDiferentes();
    renderizarCarrito();
  });
}

function obtenerCostoEnvio() {
  const inputSeleccionado = document.querySelector('input[name="tipo_entrega"]:checked');
  const tipoEntrega = inputSeleccionado ? inputSeleccionado.value : localStorage.getItem("tipo_entrega") || "tienda";
  return tipoEntrega === "domicilio" ? 5000 : 0;
}






function renderizarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contenedor = document.getElementById("carrito-contenido");
  const totalPagar = document.getElementById("total-pagar");
  const btnPagar = document.getElementById("btn-pagar");

  if (!contenedor || !totalPagar || !btnPagar) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = "<h1 class='titulo-form-center'>No hay productos en el carrito. Debes tener al menos un producto para continuar con la compra.</h1>";
    btnPagar.disabled = true;
    totalPagar.textContent = "$0";
    return;
  }

  btnPagar.disabled = false;

  let total = 0;
  const html = carrito.map((item, index) => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    return `
      <div class="producto-carrito">
        <img src="${item.imagen}" width="80">
        <h4>${item.nombre}</h4>
        <p>Código: ${item.codigo || item.uid}</p>
        <div class="cantidad-control">
          <button class="btn-cantidad-menor" data-index="${index}">-</button>
          <span class="cantidad">${item.cantidad}</span>
          <button class="btn-cantidad-mayor" data-index="${index}">+</button>
        </div>
        <p>Precio unidad: $${item.precio.toLocaleString("es-CL")}</p>
        <p>Subtotal: $${subtotal.toLocaleString("es-CL")}</p>
        <button class="btn-eliminar" data-index="${index}">❌ Eliminar</button>
      </div>
    `;
  }).join("");

  contenedor.innerHTML = html;

  const costoEnvio = obtenerCostoEnvio();
  const totalFinal = total + costoEnvio;
  totalPagar.textContent = `$${totalFinal.toLocaleString("es-CL")}`;

  // Reasignar eventos
  document.querySelectorAll(".btn-cantidad-mayor").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modificarCantidad(btn.dataset.index, 1);
    });
  });

  

  document.querySelectorAll(".btn-cantidad-menor").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      modificarCantidad(btn.dataset.index, -1);
    });
  });

  document.querySelectorAll(".btn-eliminar").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      eliminarProducto(btn.dataset.index);
    });
  });



  if (btnPagar) {
    btnPagar.addEventListener("click", async () => {
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (carrito.length === 0) {
        alert("⚠️ No hay productos en el carrito.");
        return;
      }

      const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value || "tienda";

      try {
        const response = await fetch("/crear_preferencia/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: carrito,
            tipo_entrega: tipoEntrega
          })
        });

        const data = await response.json();
        if (data.init_point) {
          window.location.href = data.init_point; // Redirige al checkout de Mercado Pago
        } else {
          alert("❌ No se pudo iniciar el pago. Intenta más tarde.");
        }
      } catch (error) {
        console.error("❌ Error al iniciar el pago:", error);
        alert("❌ Error al conectar con el servidor.");
      }
    });
  }

}






const btnVaciarCarrito = document.getElementById("btn-vaciar-carrito");

if (btnVaciarCarrito) {
  btnVaciarCarrito.addEventListener("click", () => {
    const confirmar = confirm("🗑 ¿Estás seguro de que quieres vaciar el carrito?");
    if (!confirmar) return;

    localStorage.removeItem("carrito");
    renderizarCarrito();
    console.log("🧹 Carrito vaciado exitosamente.");
  });
}



function modificarCantidad(index, delta) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  if (!carrito[index]) return;

  carrito[index].cantidad += delta;
  if (carrito[index].cantidad < 1) carrito[index].cantidad = 1;

  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

function eliminarProducto(index) {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  carrito.splice(index, 1);
  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
}

if (document.getElementById("carrito-contenido")) {
  renderizarCarrito();
}

// ======= Recalcular total cuando se cambia tipo de entrega =======
document.querySelectorAll('input[name="tipo_entrega"]').forEach(radio => {
  radio.addEventListener("change", () => {
    renderizarCarrito();
  });
});















  






const formEnvio = document.getElementById("formulario-direccion");

if (formEnvio) {
  formEnvio.addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("⚠️ Debes iniciar sesión para guardar tu dirección.");
      return;
    }

    const direccion = {
      nombre: document.getElementById("nombre")?.value.trim() || "",
      rut: document.getElementById("rut")?.value.trim() || "",
      telefono: document.getElementById("telefono")?.value.trim() || "",
      correo: document.getElementById("correo")?.value.trim() || "",
      calleNumero: document.getElementById("calle-numero")?.value.trim() || "",
      departamento: document.getElementById("departamento")?.value.trim() || "",
      comuna: document.getElementById("comuna")?.value || "",
      region: document.getElementById("region")?.value || "",
      codigoPostal: document.getElementById("codigo-postal")?.value.trim() || "",
      fechaGuardado: new Date()
    };

    if (!direccion.region || !direccion.comuna) {
      alert("📍 Debes seleccionar región y comuna.");
      return;
    }

    const guardar = document.getElementById("guardar-envio")?.checked;

    if (guardar) {
      try {
        const ref = collection(db, "direcciones", user.uid, "items");
        await addDoc(ref, direccion);

        alert("✅ Dirección guardada exitosamente.");

        formEnvio.reset();
        document.getElementById("comuna").innerHTML = '<option value="">Seleccione una comuna</option>';
        document.getElementById("comuna").disabled = true;
        cargarDirecciones();
      } catch (error) {
        console.error("❌ Error al guardar dirección:", error);
        alert("🚫 Ocurrió un error al guardar tu dirección. Intenta nuevamente.");
      }
    } else {
      alert("ℹ️ Dirección utilizada solo para esta compra. No será guardada.");
    }
  });
}



async function cargarDirecciones() {
  const user = auth.currentUser;
  if (!user) return;

  const contenedor = document.getElementById("lista-direcciones");
  if (!contenedor) return;

  try {
    const ref = collection(db, "direcciones", user.uid, "items");
    const snapshot = await getDocs(ref);

    contenedor.innerHTML = "";

    if (snapshot.empty) {
      contenedor.innerHTML = "<h1 class='titulo-form mensaje-info'>⚠️ Aún no tienes direcciones registradas.</h1>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const datos = docSnap.data();
      const div = document.createElement("div");
      div.classList.add("direccion-guardada");

      div.innerHTML = `
        <div class="direccion-info">
          <p class="nombre">👤 <strong>${datos.nombre}</strong></p>
          <p class="texto">📍 ${datos.calleNumero}${datos.departamento ? ', ' + datos.departamento : ''}</p>
          <p class="texto">🏙️ ${datos.comuna}, ${datos.region}</p>
          <p class="texto">📞 ${datos.telefono}</p>
          <p class="texto">📧 ${datos.correo}</p>
        </div>
        <div class="acciones-direccion">
          <button onclick="eliminarDireccion('${docSnap.id}')">🗑 Eliminar</button>
        </div>
      `;
      contenedor.appendChild(div);
    });
  } catch (error) {
    console.error("❌ Error al cargar direcciones:", error);
  }
}

async function cargarUltimaDireccion() {
  const user = auth.currentUser;
  if (!user) return;

  const contenedor = document.getElementById("lista-ultimas-direcciones");
  if (!contenedor) return;

  try {
    const ref = collection(db, "direcciones", user.uid, "items");
    const q = query(ref, orderBy("fechaGuardado", "desc"), limit(1));
    const snapshot = await getDocs(q);

    contenedor.innerHTML = "";

    if (snapshot.empty) {
      contenedor.innerHTML = "<p class='mensaje-info'>⚠️ Aún no tienes direcciones registradas.</p>";
      return;
    }

    const docSnap = snapshot.docs[0];
    const datos = docSnap.data();

    const div = document.createElement("div");
    div.classList.add("direccion-guardada");

    div.innerHTML = `
      <div class="direccion-info">
        <p class="nombre">👤 <strong>${datos.nombre}</strong></p>
        <p class="texto">📍 ${datos.calleNumero}${datos.departamento ? ', ' + datos.departamento : ''}</p>
        <p class="texto">🏙️ ${datos.comuna}, ${datos.region}</p>
        <p class="texto">📞 ${datos.telefono}</p>
        <p class="texto">📧 ${datos.correo}</p>
      </div>
    `;

    contenedor.appendChild(div);
  } catch (error) {
    console.error("❌ Error al cargar la última dirección:", error);
  }
}

if (document.getElementById("lista-ultimas-direcciones")) {
  onAuthStateChanged(auth, (user) => {
    if (user) {
      cargarUltimaDireccion();  // 👉 esta función debe estar definida antes
    }
  });
}


window.eliminarDireccion = async function(idDireccion) {
  const user = auth.currentUser;
  if (!user) return;

  try {
    await deleteDoc(doc(db, "direcciones", user.uid, "items", idDireccion));
    alert("🗑️ Dirección eliminada correctamente.");
    cargarDirecciones();
  } catch (error) {
    console.error("❌ Error al eliminar dirección:", error);
    alert("🚫 No se pudo eliminar la dirección. Intenta nuevamente.");
  }
};


  if (document.getElementById("lista-direcciones")) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        cargarDirecciones();
      }
    });
  }


  
  const radiosEntrega = document.querySelectorAll('input[name="tipo_entrega"]');
  const regionSucursal = document.getElementById("region-sucursal");
  const comunaSucursal = document.getElementById("comuna-sucursal");
  const grupoDespacho = document.getElementById("grupo-despacho");
  const contenedorDireccion = document.getElementById("contenedor-direccion");

  function actualizarVistaEntrega() {
    const tipo = document.querySelector('input[name="tipo_entrega"]:checked')?.value;

    if (tipo === "tienda") {
      // Mostrar grupo de selección de sucursales y ocultar dirección
      grupoDespacho.classList.remove("oculto");
      regionSucursal.disabled = false;
      comunaSucursal.disabled = false;

      contenedorDireccion.classList.add("oculto");
    } else if (tipo === "domicilio") {
      // Ocultar grupo de sucursales y mostrar dirección de envío
      grupoDespacho.classList.add("oculto");
      regionSucursal.disabled = true;
      comunaSucursal.disabled = true;

      contenedorDireccion.classList.remove("oculto");
    }
  }

  // Asignar evento a los radios
  radiosEntrega.forEach(radio => {
    radio.addEventListener("change", actualizarVistaEntrega);
  });

  // Aplicar el estado inicial
  actualizarVistaEntrega();











const formTransferencia = document.getElementById("form-transferencia");

if (formTransferencia) {
  formTransferencia.addEventListener("submit", async (e) => {
    e.preventDefault();

    const nombreTitular = formTransferencia.nombre.value.trim();
    const rutTitular = formTransferencia.rut.value.trim();
    const banco = formTransferencia.banco.value;
    const acepta = formTransferencia.acepta.checked;

    if (!nombreTitular || !rutTitular || !banco || !acepta) {
      alert("⚠️ Debes completar todos los campos y aceptar la validación manual.");
      return;
    }

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
      alert("⚠️ No hay productos en el carrito.");
      return;
    }

    // Obtener tipo de entrega
    const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value || "tienda";

    // Calcular total base
    let total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);

    // Sumar costo de envío si corresponde
    const costoEnvio = tipoEntrega === "domicilio" ? 5000 : 0;
    const totalFinal = total + costoEnvio;

    // Capturar región y comuna si es retiro en tienda
    let regionSucursal = "";
    let comunaSucursal = "";
    if (tipoEntrega === "tienda") {
      regionSucursal = document.getElementById("region-sucursal")?.value || "";
      comunaSucursal = document.getElementById("comuna-sucursal")?.value || "";
      if (!regionSucursal || !comunaSucursal) {
        alert("⚠️ Debes seleccionar una región y comuna para el retiro en tienda.");
        return;
      }
    }

    try {
      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión para hacer esta solicitud.");
        return;
      }

      const direccionesRef = collection(db, "direcciones", user.uid, "items");
      const direccionesSnap = await getDocs(query(direccionesRef, orderBy("fechaGuardado", "desc"), limit(1)));

      if (direccionesSnap.empty) {
        alert("No se encontró dirección registrada para este usuario.");
        return;
      }

      const datosDireccion = direccionesSnap.docs[0].data();
      const nombreCliente = datosDireccion.nombre || "";
      const rutCliente = datosDireccion.rut || "";

      const ref = collection(db, "transferencias");
      await addDoc(ref, {
        nombreCliente,
        rutCliente,
        nombreTitular,
        rutTitular,
        banco,
        correoCliente: user.email,
        carrito,
        tipoEntrega,
        costoEnvio,
        total: totalFinal,
        regionSucursal: tipoEntrega === "tienda" ? regionSucursal : null,
        comunaSucursal: tipoEntrega === "tienda" ? comunaSucursal : null,
        estadoTransferencia: "En validación",
        timestamp: Timestamp.now(),
        uidCliente: user.uid
      });

      alert("✅ Gracias. Hemos recibido tu solicitud. Validaremos la transferencia una vez sea realizada.");
      formTransferencia.reset();
      localStorage.removeItem("carrito");
      renderizarCarrito();

    } catch (error) {
      console.error("Error al guardar la solicitud de transferencia:", error);
      alert("❌ Ocurrió un error al guardar tu solicitud. Intenta nuevamente.");
    }
  });
}




async function cargarTransferencias() {
  const tabla = document.querySelector("#tabla-transferencias tbody");
  const botonConfirmar = document.getElementById("btn-confirmar-cambios");
  if (!tabla || !botonConfirmar) return;

  try {
    const snapshot = await getDocs(collection(db, "transferencias"));
    tabla.innerHTML = "";

    const cambiosPendientes = {};

    snapshot.forEach(docSnap => {
      const t = docSnap.data();
      const id = docSnap.id;
      const estado = t.estadoTransferencia || "En validación";

      const cantidadTotal = Array.isArray(t.carrito)
        ? t.carrito.reduce((acc, item) => acc + (item.cantidad || 0), 0)
        : 0;

      const totalPagar = typeof t.total === "number"
        ? `$${t.total.toLocaleString('es-CL')}`
        : "-";

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${t.rutCliente || "-"}</td>
        <td>${t.nombreCliente || "-"}</td>
        <td>${t.correoCliente || "-"}</td>
        <td>${t.rutTitular || "-"}</td>
        <td>${t.nombreTitular || "-"}</td>
        <td>${t.banco || "-"}</td>
        <td>${cantidadTotal}</td>
        <td>${totalPagar}</td>
        <td>
          <select class="select-estado" data-id="${id}">
            <option value="En validación" ${estado === "En validación" ? "selected" : ""}>En validación</option>
            <option value="Transferencia aceptada" ${estado === "Transferencia aceptada" ? "selected" : ""}>Transferencia aceptada</option>
            <option value="Problemas con tu pago" ${estado === "Problemas con tu pago" ? "selected" : ""}>Problemas con tu pago</option>
          </select>
        </td>
      `;
      tabla.appendChild(fila);
    });

    document.querySelectorAll(".select-estado").forEach(select => {
      select.addEventListener("change", () => {
        const id = select.getAttribute("data-id");
        const nuevoEstado = select.value;
        cambiosPendientes[id] = nuevoEstado;
      });
    });

    botonConfirmar.addEventListener("click", async () => {
      if (Object.keys(cambiosPendientes).length === 0) {
        alert("No hay cambios pendientes.");
        return;
      }

      const confirmar = confirm("¿Estás seguro de que quieres guardar todos los cambios?");
      if (!confirmar) return;

      try {
        for (const id in cambiosPendientes) {
          const nuevoEstado = cambiosPendientes[id];

          // Actualizar estado de la transferencia
          await setDoc(doc(db, "transferencias", id), {
            estadoTransferencia: nuevoEstado
          }, { merge: true });

          // Crear pedido si fue aceptada la transferencia
          if (nuevoEstado === "Transferencia aceptada") {
            const transferenciaSnap = await getDoc(doc(db, "transferencias", id));
            const datosTransferencia = transferenciaSnap.data();

            const refPedidos = collection(db, "pedidos");
            await addDoc(refPedidos, {
              ...datosTransferencia,
              estadoPedido: "Pendiente de preparación",
              creadoEn: Timestamp.now(),
              idTransferencia: id
            });
          }
        }

        alert("✅ Cambios guardados correctamente. Las transferencias aceptadas fueron añadidas a pedidos.");
        Object.keys(cambiosPendientes).forEach(id => delete cambiosPendientes[id]);
      } catch (error) {
        console.error("Error al guardar cambios o crear pedido:", error);
        alert("❌ Hubo un problema al guardar los cambios.");
      }
    });

  } catch (error) {
    console.error("❌ Error al cargar transferencias:", error);
    alert("No se pudieron cargar las transferencias.");
  }
}




// Ejecutar función al cargar si hay tabla en la página
if (document.querySelector("#tabla-transferencias")) {
  cargarTransferencias();
}



    const totalElemento = document.getElementById("total-pagar");

    // Obtener el carrito del localStorage
    let carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    function calcularTotal() {
      let total = 0;
      carrito.forEach(item => {
        total += item.precio * item.cantidad;
      });

      const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value;
      if (tipoEntrega === "domicilio") {
        total += 5000;
      }

      if (totalElemento) { // <-- Agrega esta verificación
        totalElemento.textContent = `$${total.toLocaleString("es-CL")}`;
      }
    }

    // Calcular total al cargar la página
    calcularTotal();


















async function cargarPedidos() {
  const tablaSucursal = document.querySelector("#tabla-pedidos-sucursal tbody");
  const tablaDomicilio = document.querySelector("#tabla-pedidos-domicilio tbody");

  if (!tablaSucursal || !tablaDomicilio) {
    console.warn("No se encontraron una o ambas tablas de pedidos");
    return;
  }

  try {
    const snapshot = await getDocs(collection(db, "pedidos"));
    tablaSucursal.innerHTML = "";
    tablaDomicilio.innerHTML = "";

    if (snapshot.empty) {
      tablaSucursal.innerHTML = `<tr><td colspan="8">📭 No hay pedidos en sucursal.</td></tr>`;
      tablaDomicilio.innerHTML = `<tr><td colspan="8">📭 No hay pedidos a domicilio.</td></tr>`;
      return;
    }

    for (const docSnap of snapshot.docs) {
      const p = docSnap.data();
      const idPedido = docSnap.id;
      const fecha = p.creadoEn?.toDate().toLocaleString("es-CL") || "-";
      const total = typeof p.total === "number" ? `$${p.total.toLocaleString("es-CL")}` : "-";
      const codigoPedido = p.codigoPedido || idPedido;

      const estadoRaw = p.estadoPedido || "-";
      const estadoPedido = (estadoRaw === "Pagado") ? "Pendiente de preparación" : estadoRaw;

      const estaEnPreparacion = estadoPedido === "Preparando pedido";
      const estaListoEnvio = estadoPedido === "Pedido listo para envío/entrega";
      const estaConstruyendo = estadoPedido === "Construyendo pedido";
      const estaEntregado = estadoPedido === "Entregado";
      const tipo = p.tipoEntrega;

      let direccion = "-";
      if (tipo === "domicilio") {
        direccion = p.direccionEnvio || p.direccion || "-";

        if ((!direccion || direccion.trim() === "-") && p.uidCliente) {
          try {
            const direccionesRef = collection(db, "direcciones", p.uidCliente, "items");
            const direccionesSnap = await getDocs(query(direccionesRef, orderBy("fechaGuardado", "desc"), limit(1)));
            if (!direccionesSnap.empty) {
              const d = direccionesSnap.docs[0].data();
              direccion = `${d.calleNumero || ""}, ${d.comuna || ""}, ${d.region || ""}`;

              // Guardar dirección completa en el pedido para evitar este problema en el futuro
              const pedidoRef = doc(db, "pedidos", idPedido);
              await setDoc(pedidoRef, {
                direccionEnvio: direccion
              }, { merge: true });
            } else {
              direccion = "(sin dirección registrada)";
            }
          } catch (err) {
            console.warn("⚠️ No se pudo obtener dirección desde subcolección:", err);
            direccion = "(error al obtener dirección)";
          }
        }
      } else if (tipo === "tienda") {
        direccion = `Sucursal: ${p.comunaSucursal || "-"}, ${p.regionSucursal || "-"}`;
      }

      const deshabilitarBtn = estaEnPreparacion || estaListoEnvio || estaConstruyendo || estaEntregado;
      const mostrarBoleta = estadoPedido === "Pedido listo para envío/entrega";
      let btnTexto = "Tomar pedido";
      if (estadoPedido === "Preparando pedido") btnTexto = "En preparación";
      if (estadoPedido === "Entregado") btnTexto = "Entregado";

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${codigoPedido}</td>
        <td>${p.nombreCliente || "-"}</td>
        <td>${p.correoCliente || "-"}</td>
        <td>${fecha}</td>
        <td>${total}</td>
        <td class="estado-pedido">${estadoPedido}</td>
        <td>${direccion}</td>
        <td>
          <button class="btn-tomar-pedido" data-id="${idPedido}" ${deshabilitarBtn ? "disabled" : ""}>${btnTexto}</button>
          <button class="btn-rechazar-pedido" data-id="${idPedido}" ${deshabilitarBtn ? "disabled" : ""}>Rechazar</button>
          ${mostrarBoleta && !estaEntregado ? `<button class="btn-boleta" data-id="${idPedido}">📄 Generar Boleta</button><button class="btn-confirmar-envio" data-id="${idPedido}">📬 Confirmar Entrega</button>` : ""}
        </td>
      `;

      if (tipo === "domicilio") {
        tablaDomicilio.appendChild(fila);
      } else {
        tablaSucursal.appendChild(fila);
      }
    }

  } catch (error) {
    console.error("❌ Error al cargar pedidos:", error);
    tablaSucursal.innerHTML = `<tr><td colspan="8">❌ Error al cargar pedidos.</td></tr>`;
    tablaDomicilio.innerHTML = `<tr><td colspan="8">❌ Error al cargar pedidos.</td></tr>`;
  }
}

if (
  document.querySelector("#tabla-pedidos-domicilio") &&
  document.querySelector("#tabla-pedidos-sucursal")
) {
  cargarPedidos();
}




















async function cargarPedidosEnPreparacion() {
  const tabla = document.querySelector("#tabla-preparacion-pedidos tbody");
  if (!tabla) return;

  tabla.innerHTML = "";

  try {
    const snapshot = await getDocs(collection(db, "pedidos"));

    if (snapshot.empty) {
      tabla.innerHTML = `<tr><td colspan="3">📭 No hay pedidos en preparación.</td></tr>`;
      return;
    }

    snapshot.forEach(docSnap => {
      const pedido = docSnap.data();
      const idPedido = docSnap.id;

      // Solo mostrar si está en preparación o construcción
      if (pedido.estadoPedido === "Preparando pedido" || pedido.estadoPedido === "Construyendo pedido") {
        const productos = Array.isArray(pedido.carrito)
          ? pedido.carrito.map(item => `${item.nombre} x${item.cantidad}`).join("<br>")
          : "-";

        const estaConstruyendo = pedido.estadoPedido === "Construyendo pedido";
        const estaEnPreparacion = pedido.estadoPedido === "Preparando pedido";

        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${idPedido}</td>
          <td>${productos}</td>
          <td>
            <button class="btn-tomar-construccion" data-id="${idPedido}" ${estaConstruyendo ? "disabled" : ""}>
              ${estaConstruyendo ? "Construyendo pedido" : "Tomar pedido"}
            </button>
            <br><br>
            <button class="btn-entregar-pedido" data-id="${idPedido}" ${estaEnPreparacion ? "disabled" : ""}>
              Pedido entregado al vendedor
            </button>
          </td>
        `;
        tabla.appendChild(fila);
      }
    });

    // === Botón TOMAR PEDIDO ===
    document.querySelectorAll(".btn-tomar-construccion").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const fila = btn.closest("tr");
        const btnEntregar = fila.querySelector(".btn-entregar-pedido");

        try {
          const pedidoRef = doc(db, "pedidos", id);
          const pedidoSnap = await getDoc(pedidoRef);

          if (!pedidoSnap.exists()) {
            alert("❌ Este pedido ya no existe.");
            return;
          }

          const pedidoData = pedidoSnap.data();

          if (pedidoData.estadoPedido !== "Preparando pedido") {
            alert("⚠️ Este pedido ya fue tomado por otro trabajador de bodega.");
            btn.textContent = "Ya tomado";
            btn.disabled = true;
            return;
          }

          await setDoc(pedidoRef, { estadoPedido: "Construyendo pedido" }, { merge: true });

          btn.textContent = "Construyendo pedido";
          btn.disabled = true;

          if (btnEntregar) {
            btnEntregar.disabled = false;
          }

        } catch (error) {
          console.error("❌ Error al tomar pedido:", error);
          alert("❌ No se pudo tomar el pedido.");
        }
      });
    });

    // === Botón ENTREGAR A VENDEDOR ===
    document.querySelectorAll(".btn-entregar-pedido").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");

        try {
          const pedidoRef = doc(db, "pedidos", id);
          await setDoc(pedidoRef, { estadoPedido: "Pedido listo para envío/entrega" }, { merge: true });

          alert("✅ Pedido marcado como listo para envío o entrega.");
          cargarPedidosEnPreparacion();
        } catch (error) {
          console.error("❌ Error al entregar pedido:", error);
          alert("❌ No se pudo actualizar el estado del pedido.");
        }
      });
    });

  } catch (error) {
    console.error("❌ Error al cargar pedidos:", error);
    tabla.innerHTML = `<tr><td colspan="3">❌ Error al cargar pedidos.</td></tr>`;
  }
}

if (document.querySelector("#tabla-preparacion-pedidos")) {
  cargarPedidosEnPreparacion();
}
















// Mostrar modal automáticamente si hay error o pendiente
const urlParams = new URLSearchParams(window.location.search);
const estado = urlParams.get("status");

// === GUARDAR PEDIDO SI STATUS ES SUCCESS ===
if (estado === "success") {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value || localStorage.getItem("tipo_entrega") || "tienda";
  let regionSucursal = "";
  let comunaSucursal = "";

  if (tipoEntrega === "tienda") {
    regionSucursal = document.getElementById("region-sucursal")?.value || localStorage.getItem("region_sucursal") || "";
    comunaSucursal = document.getElementById("comuna-sucursal")?.value || localStorage.getItem("comuna_sucursal") || "";
  }

  let total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
  if (tipoEntrega === "domicilio") total += 5000;

  onAuthStateChanged(auth, async (user) => {
    if (!user) return;

    const ref = collection(db, "pedidos");
    await addDoc(ref, {
      carrito,
      total,
      tipoEntrega,
      regionSucursal: tipoEntrega === "tienda" ? regionSucursal : null,
      comunaSucursal: tipoEntrega === "tienda" ? comunaSucursal : null,
      estadoPedido: "Pagado",
      creadoEn: Timestamp.now(),
      uidCliente: user.uid,
      correoCliente: user.email
    });

    localStorage.removeItem("carrito");
    alert("✅ ¡Compra registrada correctamente! Puedes ver tu pedido en tu perfil.");
    // window.location.href = "/perfil/";
  });
}

const errorModal = document.getElementById("errorModal");

if ((estado === "failure" || estado === "pending") && errorModal) {
  errorModal.style.display = "block";
}

// Para cerrar el modal de error al enviar el formulario
const errorForm = errorModal?.querySelector("form");

if (errorForm) {
  errorForm.addEventListener("submit", (e) => {
    e.preventDefault();
    errorModal.style.display = "none";

    // Opcional: limpiar el parámetro de la URL sin recargar
    const nuevaUrl = window.location.origin + window.location.pathname;
    window.history.replaceState({}, document.title, nuevaUrl);
  });
}

// (Opcional extra) cerrar con ESC o clic fuera

























onAuthStateChanged(auth, async (user) => {
  if (user) {
    const uidCliente = user.uid;
    mostrarPedidosDelCliente(uidCliente);
  } else {
    console.log("Usuario no autenticado");
    document.querySelector("#tabla-datos-pedidos tbody").innerHTML =
      "<tr><td colspan='9'>🔒 Debes iniciar sesión para ver tus pedidos.</td></tr>";
  }
});

async function mostrarPedidosDelCliente(uidCliente) {
  const tabla = document.querySelector("#tabla-datos-pedidos tbody");

  if (!tabla) {
    console.warn("No se encontró la tabla");
    return;
  }

  tabla.innerHTML = "";

  try {
    const pedidosRef = collection(db, "pedidos");
    const snapshot = await getDocs(pedidosRef);

    const pedidosFiltrados = snapshot.docs.filter(docSnap => {
      const p = docSnap.data();
      return p.uidCliente === uidCliente;
    });

    if (pedidosFiltrados.length === 0) {
      tabla.innerHTML = "<tr><td colspan='9'>📭 No tienes pedidos registrados.</td></tr>";
      return;
    }

    pedidosFiltrados.forEach(docSnap => {
      const p = docSnap.data();

      const fila = document.createElement("tr");
      fila.innerHTML = `
        <td>${docSnap.id}</td>
        <td>${p.nombreCliente || "-"}</td>
        <td>${p.correoCliente || "-"}</td>
        <td>${p.rutCliente || "-"}</td>
        <td>$${p.total?.toLocaleString("es-CL") || "0"}</td>
        <td>${p.banco || "-"}</td>
        <td>${p.tipoEntrega || "-"}</td>
        <td>${p.estadoPedido || "-"}</td>
        <td>${p.estadoTransferencia || "-"}</td>
      `;
      tabla.appendChild(fila);
    });
  } catch (error) {
    console.error("Error al cargar los pedidos:", error);
    tabla.innerHTML = "<tr><td colspan='9'>❌ Error al cargar los datos.</td></tr>";
  }
}



obtenerTodosLosDatosDePedidos();




