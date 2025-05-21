// --------------------------
// SCRIPT FIREBASE (AUTH + DB) - Versión consolidada
// --------------------------

window.addEventListener('DOMContentLoaded', async () => {
  // Importaciones de Firebase
  
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js");
  const {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
  } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
  const {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    addDoc,
    collection,
    getDocs,
    query,
    where,
    Timestamp,
    orderBy, 
    limit,
    deleteDoc
  } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCOsIJF-ywgaQPqT5ApyodIcRRBCiU-mtI",
    authDomain: "ferremas-1a2c4.firebaseapp.com",
    projectId: "ferremas-1a2c4",
    storageBucket: "ferremas-1a2c4.appspot.com",
    messagingSenderId: "427152375883",
    appId: "1:427152375883:web:f3dc467e589520bbf44dce"
  };

  // Inicialización de Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth();
  const db = getFirestore(app);

  const { v4: uuidv4 } = await import("https://jspm.dev/uuid");



  const form = document.getElementById("crearProductoForm");

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
  
      const formData = new FormData(form);
      const getValue = (key) => formData.get(key)?.trim() || null;
  
      const uid = uuidv4(); // Código único para imagen y producto
  
      // Agregamos el código de imagen al FormData (para Django)
      formData.append("codigo_imagen", uid);
  
      try {
        // 1. Subir la imagen a Django
        const imagenResponse = await fetch("/api/subir-imagen/", {
          method: "POST",
          body: formData
        });
  
        if (!imagenResponse.ok) {
          throw new Error("Error al subir la imagen a Django");
        }
  
        // 2. Crear el producto en Firebase
        const producto = {
          nombre: getValue("nombre"),
          categoria: getValue("categoria"),
          descripcion: getValue("descripcion"),
          marca: getValue("marca"),
          precio: parseInt(getValue("precio")) || 0,
          stock: parseInt(getValue("stock")) || 0,
          codigo: getValue("codigo"),
          potencia: getValue("potencia") ? parseInt(getValue("potencia")) : null,
          voltaje: getValue("voltaje"),
          color: getValue("color"),
          tamano: getValue("tamano"),
          material: getValue("material"),
          presentacion: getValue("presentacion"),
          garantia: getValue("garantia"),
          uso: getValue("uso"),
          peso: getValue("peso") ? parseFloat(getValue("peso")) : null,
          dimensiones: getValue("dimensiones"),
          vencimiento: getValue("vencimiento") || null,
          creadoEn: Timestamp.now(),
          codigoImagen: uid // vínculo con la imagen en Django
        };
  
        const ref = doc(db, "productos", uid);
        await setDoc(ref, producto);
  
        alert("✅ Producto guardado con imagen vinculada");
        form.reset();
      } catch (error) {
        console.error("❌ Error al guardar el producto o la imagen:", error);
        alert("❌ No se pudo guardar el producto o la imagen. Revisa la consola.");
      }
    });
  }
  




  // Función para mostrar mensajes
  function mostrarMensaje(mensaje, tipo = 'error') {
    console.log(tipo.toUpperCase() + ":", mensaje);
    alert(mensaje);
  }

  // Función para cambiar entre formularios
  function cambiarFormulario(ocultar, mostrar) {
    if (ocultar && mostrar) {
      ocultar.style.display = 'none';
      mostrar.style.display = 'block';
    }
  }


    function mostrarMensaje(texto) {
    const contenedor = document.getElementById('contenedor-mensaje');
    const mensajeTexto = document.getElementById('mensaje-texto');
    const cerrarBtn = document.getElementById('cerrar-mensaje');

    mensajeTexto.textContent = texto;
    contenedor.classList.remove('oculto', 'ocultar-pop');
    contenedor.style.display = 'block';

    setTimeout(() => {
      contenedor.classList.add('ocultar-pop');
      setTimeout(() => {
        contenedor.classList.remove('ocultar-pop');
        contenedor.classList.add('oculto');
      }, 1500);
    }, 4000);
  }

  // ========== FUNCIÓN PARA CREAR TRABAJADORES (GLOBAL) ==========
  window.crearTrabajador = async function() {
    try {
      const correo = document.getElementById("correo-trabajador").value.trim().toLowerCase();
      const nombre = document.getElementById("nombre-trabajador").value.trim();
      const apellidoPaterno = document.getElementById("apellido-paterno-trabajador").value.trim();
      const apellidoMaterno = document.getElementById("apellido-materno-trabajador").value.trim();
      const rut = document.getElementById("rut-trabajador").value.trim();
      const rol = document.getElementById("rol-trabajador").value;
      const password = document.getElementById("password-trabajador").value.trim();
      
      // ⚠️ ESTO FALTABA
      const regionSucursal = document.getElementById("region-sucursal").value;
      const comunaSucursal = document.getElementById("comuna-sucursal").value;
  
      // Validación de campos
      if (!correo || !nombre || !apellidoPaterno || !apellidoMaterno || !rut || !rol || !password || !regionSucursal || !comunaSucursal) {
        mostrarMensaje("Todos los campos son obligatorios.");
        return;
      }
  
      const adminActual = auth.currentUser;
      const adminEmail = adminActual.email;
      const adminPassword = prompt("Por seguridad, ingrese su contraseña de administrador:");
  
      if (!adminPassword) {
        mostrarMensaje("Se requiere la contraseña de administrador.");
        return;
      }
  
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
        regionSucursal,     // ✅ guardamos región
        comunaSucursal      // ✅ guardamos comuna
      };
  
      await setDoc(doc(db, "trabajadores", nuevoUsuario.uid), nuevoTrabajador);
  
      await signOut(auth);
      await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
  
      mostrarMensaje("Trabajador creado correctamente", "success");
      document.querySelectorAll('input').forEach(input => input.value = '');
  
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
  











// ======= FUNCIONALIDAD DE CANTIDAD (+ / -) =======
const inputCantidad = document.getElementById("cantidad");
const btnIncrementar = document.querySelector(".btn-aumentar");
const btnDecrementar = document.querySelector(".btn-disminuir");

if (inputCantidad && btnIncrementar && btnDecrementar) {
  btnIncrementar.addEventListener("click", () => {
    inputCantidad.value = parseInt(inputCantidad.value) + 1;
  });

  btnDecrementar.addEventListener("click", () => {
    const actual = parseInt(inputCantidad.value);
    if (actual > 1) inputCantidad.value = actual - 1;
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

// ======= AGREGAR PRODUCTO AL CARRITO =======
const btnAgregarCarrito = document.getElementById("btn-agregar-carrito");

if (btnAgregarCarrito) {
  btnAgregarCarrito.addEventListener("click", () => {
    const nombre = document.getElementById("modal-nombre").textContent.trim();
    const precioTexto = document.getElementById("modal-precio").textContent.trim().replace(/\$/g, "").replace(/\./g, "").replace(",", ".");
    const precio = parseFloat(precioTexto);
    const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
    const uid = document.getElementById("modal-producto").getAttribute("data-uid"); // ✅ Usar uid del producto
    const imagen = document.getElementById("modal-imagen").src;

    if (!uid) {
      alert("❌ No se pudo identificar el producto. Intenta nuevamente.");
      return;
    }

    const nuevoItem = {
      uid,
      nombre,
      precio,
      cantidad,
      imagen
    };

    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const productoExistente = carrito.find(item => item.uid === nuevoItem.uid);

    if (productoExistente) {
      productoExistente.cantidad += cantidad;
    } else {
      carrito.push(nuevoItem);
    }

    localStorage.setItem("carrito", JSON.stringify(carrito));
    actualizarContadorProductosDiferentes(); // 🔁 Refresca el contador
  });
}




  function renderizarCarrito() {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    const contenedor = document.getElementById("carrito-contenido");
    const btnPagar = document.getElementById("btn-pagar");
  
    if (!contenedor || !btnPagar) return;
  
    if (carrito.length === 0) {
      contenedor.innerHTML = "<p>No hay productos en el carrito. Debes tener al menos un producto para continuar con la compra.</p>";
    btnPagar.disabled = true;
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
          <p>Código: ${item.codigo}</p>
          <div class="cantidad-control">
            <button class="btn-cantidad-menor" data-index="${index}">-</button>
            <span class="cantidad">${item.cantidad}</span>
            <button class="btn-cantidad-mayor" data-index="${index}">+</button>
          </div>
          <p>Precio unidad: $${item.precio.toLocaleString('es-CL')}</p>
          <p>Subtotal: $${subtotal.toLocaleString('es-CL')}</p>
          <button class="btn-eliminar" data-index="${index}">❌ Eliminar</button>
          <hr>
        </div>
      `;
    }).join("");
  
  // Ya no se muestra el total
  contenedor.innerHTML = html;
  
    document.querySelectorAll(".btn-cantidad-mayor").forEach(btn => {
      btn.addEventListener("click", () => modificarCantidad(btn.dataset.index, 1));
    });
    document.querySelectorAll(".btn-cantidad-menor").forEach(btn => {
      btn.addEventListener("click", () => modificarCantidad(btn.dataset.index, -1));
    });
    document.querySelectorAll(".btn-eliminar").forEach(btn => {
      btn.addEventListener("click", () => eliminarProducto(btn.dataset.index));
    });
  }


const btnPagar = document.getElementById("btn-pagar");

if (btnPagar) {
  btnPagar.addEventListener("click", async () => {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

    if (carrito.length === 0) {
      alert("⚠️ Debes agregar al menos un producto.");
      return;
    }

    // Obtener tipo de entrega seleccionado
    const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value || "tienda";

    // Guardar tipo de entrega en localStorage
    localStorage.setItem("tipo_entrega", tipoEntrega);

    if (tipoEntrega === "tienda") {
      const region = document.getElementById("region-sucursal")?.value || "";
      const comuna = document.getElementById("comuna-sucursal")?.value || "";

      if (!region || !comuna) {
        alert("⚠️ Debes seleccionar una región y comuna para el retiro en tienda.");
        return;
      }

      localStorage.setItem("region_sucursal", region);
      localStorage.setItem("comuna_sucursal", comuna);
    } else {
      // Limpia si es despacho
      localStorage.removeItem("region_sucursal");
      localStorage.removeItem("comuna_sucursal");
    }

    try {
      const respuesta = await fetch("/crear-preferencia/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: carrito,
          tipo_entrega: tipoEntrega
        })
      });

      const data = await respuesta.json();

      if (data.init_point) {
        window.location.href = data.init_point;
      } else {
        alert("❌ Error al generar el pago.");
      }
    } catch (error) {
      console.error("Error al conectar con el servidor:", error);
      alert("❌ Hubo un problema al generar el pago.");
    }
  });
}









  function modificarCantidad(index, delta) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (!carrito[index]) return;
  
    carrito[index].cantidad += delta;
    if (carrito[index].cantidad < 1) carrito[index].cantidad = 1;
  
    localStorage.setItem("carrito", JSON.stringify(carrito));
    if (document.getElementById("carrito-contenido")) {
      renderizarCarrito();
}
  }
  
  function eliminarProducto(index) {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    carrito.splice(index, 1);
    localStorage.setItem("carrito", JSON.stringify(carrito));
    if (document.getElementById("carrito-contenido")) {
      renderizarCarrito();
}
  }
  
  function vaciarCarrito() {
    localStorage.removeItem("carrito");
    if (document.getElementById("carrito-contenido")) {
      renderizarCarrito();
    } 
  }
  
    if (document.getElementById("carrito-contenido")) {
      renderizarCarrito();
    }
  
    const btnVaciar = document.getElementById("btn-vaciar-carrito");
    if (btnVaciar) {
      btnVaciar.addEventListener("click", vaciarCarrito);
    }
  

  













  async function cargarTrabajadores() {
    const tabla = document.querySelector("#tabla-trabajadores tbody");
    if (!tabla) return;
  
    try {
      const snapshot = await getDocs(collection(db, "trabajadores"));
      tabla.innerHTML = "";
  
      snapshot.forEach(doc => {
        const data = doc.data();
        const cambiarChecked = data.cambiarContraseña === true ? "checked" : "";
  
        const fila = document.createElement("tr");
        fila.innerHTML = `
          <td>${data.nombre || ""} ${data.apellidoPaterno || ""} ${data.apellidoMaterno || ""}</td>
          <td>${data.correo || ""}</td>
          <td>${data.rut || ""}</td>
          <td>${data.rol || ""}</td>
          <td>${data.creadoEn?.toDate().toLocaleDateString("es-CL") || ""}</td>
          <td><code>${data.password || "No disponible"}</code></td>
          <td>
            <input type="checkbox" data-id="${doc.id}" ${cambiarChecked} class="toggle-cambiar-checkbox" />
          </td>
          <td>
            <button class="btn-eliminar" data-id="${doc.id}">🗑️ Eliminar</button>
          </td>
        `;
        tabla.appendChild(fila);
      });
  
      // Checkbox funcional
      document.querySelectorAll(".toggle-cambiar-checkbox").forEach(checkbox => {
        checkbox.addEventListener("change", async () => {
          const id = checkbox.getAttribute("data-id");
          const nuevoValor = checkbox.checked;
  
          try {
            await setDoc(doc(db, "trabajadores", id), { cambiarContraseña: nuevoValor }, { merge: true });
            mostrarMensajeSeguro("✅ Campo actualizado correctamente.");
          } catch (error) {
            console.error("Error al actualizar:", error);
            mostrarMensajeSeguro("❌ Error al actualizar el campo.");
          }
        });
      });
  
      // Botón eliminar
      document.querySelectorAll(".btn-eliminar").forEach(boton => {
        boton.addEventListener("click", async () => {
          const id = boton.getAttribute("data-id");
          const confirmar = confirm("¿Estás seguro de que quieres eliminar a este trabajador?");
          if (!confirmar) return;
  
          try {
            await deleteDoc(doc(db, "trabajadores", id));
            alert("⚠️ El trabajador ha sido eliminado de trabajadores. Ahora quedará como cliente.");
            cargarTrabajadores();
          } catch (error) {
            console.error("Error al eliminar trabajador:", error);
            alert("❌ Error al eliminar el trabajador.");
          }
        });
      });
  
    } catch (error) {
      console.error("Error al cargar trabajadores:", error);
      alert("❌ No se pudieron cargar los trabajadores.");
    }
  }
  
  
  
  
  // Llama esta función donde lo necesites, por ejemplo:
  if (document.querySelector("#tabla-trabajadores tbody")) {
    cargarTrabajadores();
  }



  

  async function cargarProductosBodega() {
    const productosSnapshot = await getDocs(collection(db, "productos"));
    const tbodyReponer = document.querySelector("#tabla-reponer tbody");
    const tbodyDisponibles = document.querySelector("#tabla-disponibles tbody");
    const selectFiltro = document.getElementById("filtro-categoria");
  
    const categoriasSet = new Set();
  
    tbodyReponer.innerHTML = "";
    tbodyDisponibles.innerHTML = "";
    selectFiltro.innerHTML = '<option value="todas">Todas</option>';
  
    productosSnapshot.forEach(doc => {
      const producto = doc.data();
      const fila = document.createElement("tr");
      categoriasSet.add(producto.categoria || "Sin categoría");
  
      if (producto.stock <= 5) {
        fila.innerHTML = `
          <td>${producto.nombre}</td>
          <td>${producto.categoria}</td>
          <td>${producto.stock}</td>
          <td>
            <input type="number" class="input-reponer" data-id="${doc.id}" min="1" placeholder="Cantidad" />
            <button class="btn-reponer" data-id="${doc.id}">Reponer</button>
            <button class="btn-eliminar-producto" data-id="${doc.id}">Eliminar</button>
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
            <button class="btn-eliminar-producto" data-id="${doc.id}">Eliminar</button>
          </td>
        `;
        tbodyDisponibles.appendChild(fila);
      }
    });
  
    categoriasSet.forEach(cat => {
      const option = document.createElement("option");
      option.value = cat;
      option.textContent = cat;
      selectFiltro.appendChild(option);
    });
  
    selectFiltro.addEventListener("change", () => {
      const categoriaSeleccionada = selectFiltro.value;
      document.querySelectorAll("#tabla-disponibles tbody tr").forEach(fila => {
        const cat = fila.getAttribute("data-categoria");
        fila.style.display = (categoriaSeleccionada === "todas" || cat === categoriaSeleccionada) ? "" : "none";
      });
    });
  
    document.querySelectorAll(".btn-reponer").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const input = document.querySelector(`.input-reponer[data-id="${id}"]`);
        const cantidad = parseInt(input.value);
  
        if (!cantidad || cantidad <= 0) {
          alert("⚠️ Ingresa una cantidad válida para reponer.");
          return;
        }
  
        const docRef = doc(db, "productos", id);
        const productoSnap = await getDoc(docRef);
  
        if (!productoSnap.exists()) return alert("❌ Producto no encontrado.");
  
        const stockActual = productoSnap.data().stock || 0;
        const nuevoStock = stockActual + cantidad;
  
        try {
          await setDoc(docRef, { stock: nuevoStock }, { merge: true });
          alert(`✅ Producto repuesto con +${cantidad} unidades`);
          cargarProductosBodega(); // recargar tabla
        } catch (err) {
          console.error(err);
          alert("❌ Error al actualizar el stock");
        }
      });
    });
  
    document.querySelectorAll(".btn-eliminar-producto").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const confirmar = confirm("⚠️ ¿Estás seguro de que quieres eliminar este producto? Esta acción es irreversible.");
        if (!confirmar) return;
  
        try {
          await deleteDoc(doc(db, "productos", id));
          alert("🗑️ Producto eliminado correctamente");
          cargarProductosBodega(); // recargar tabla
        } catch (err) {
          console.error(err);
          alert("❌ Error al eliminar el producto");
        }
      });
    });
  }
  
  
  
  if (
    document.querySelector("#tabla-reponer tbody") &&
    document.querySelector("#tabla-disponibles tbody") &&
    document.getElementById("filtro-categoria")
  ) {
    cargarProductosBodega();
  }
  




  const formEnvio = document.getElementById("formulario-direccion");

  if (formEnvio) {
    formEnvio.addEventListener("submit", async (e) => {
      e.preventDefault();

      const user = auth.currentUser;
      if (!user) {
        alert("Debes iniciar sesión");
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
        alert("Debe seleccionar región y comuna.");
        return;
      }

      const guardar = document.getElementById("guardar-envio")?.checked;

      if (guardar) {
        try {
          const ref = collection(db, "direcciones", user.uid, "items");
          await addDoc(ref, direccion);
          alert("✅ Dirección guardada");
          formEnvio.reset();
          document.getElementById("comuna").innerHTML = '<option value="">Seleccione una comuna</option>';
          document.getElementById("comuna").disabled = true;
          cargarDirecciones();
        } catch (error) {
          console.error("❌ Error al guardar dirección:", error);
          alert("Ocurrió un error al guardar la dirección");
        }
      } else {
        alert("✅ Dirección utilizada solo para esta compra (no guardada)");
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

      snapshot.forEach((docSnap) => {
        const datos = docSnap.data();
        const div = document.createElement("div");
        div.innerHTML = `
          <p><strong>${datos.nombre}</strong><br>
          ${datos.calleNumero}, ${datos.comuna}, ${datos.region}<br>
          <button onclick="eliminarDireccion('${docSnap.id}')">Eliminar</button>
          </p>
          <hr>
        `;
        contenedor.appendChild(div);
      });
    } catch (error) {
      console.error("❌ Error al cargar direcciones:", error);
    }
  }

  window.eliminarDireccion = async function(idDireccion) {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(doc(db, "direcciones", user.uid, "items", idDireccion));
      alert("🗑️ Dirección eliminada correctamente");
      cargarDirecciones();
    } catch (error) {
      console.error("❌ Error al eliminar dirección:", error);
    }
  };

  if (document.getElementById("lista-direcciones")) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        cargarDirecciones();
      }
    });
  }




// Cuando carga la página
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  if (status === "success") {
    onAuthStateChanged(auth, async (user) => {
      if (!user) return;

      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (carrito.length === 0) return;

      try {
        const direccionesRef = collection(db, "direcciones", user.uid, "items");
        const snap = await getDocs(query(direccionesRef, orderBy("fechaGuardado", "desc"), limit(1)));
        if (snap.empty) {
          console.warn("No hay dirección registrada.");
          return;
        }

        const datosDireccion = snap.docs[0].data();
        const nombreCliente = datosDireccion.nombre || "";
        const rutCliente = datosDireccion.rut || "";

        const tipoEntrega = localStorage.getItem("tipo_entrega") || "tienda";
        const costoEnvio = tipoEntrega === "domicilio" ? 5000 : 0;
        const regionSucursal = localStorage.getItem("region_sucursal") || null;
        const comunaSucursal = localStorage.getItem("comuna_sucursal") || null;
        const total = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0) + costoEnvio;

        await addDoc(collection(db, "pedidos"), {
          nombreCliente,
          rutCliente,
          correoCliente: user.email,
          carrito,
          tipoEntrega,
          costoEnvio,
          total,
          regionSucursal: tipoEntrega === "tienda" ? regionSucursal : null,
          comunaSucursal: tipoEntrega === "tienda" ? comunaSucursal : null,
          estadoPedido: "Pagado",
          creadoEn: Timestamp.now(),
          uidCliente: user.uid
        });

        alert("✅ ¡Pago exitoso! Tu pedido ha sido registrado.");
        localStorage.removeItem("carrito");
        localStorage.removeItem("tipo_entrega");
        localStorage.removeItem("region_sucursal");
        localStorage.removeItem("comuna_sucursal");
        renderizarCarrito?.();

      } catch (err) {
        console.error("Error al guardar pedido:", err);
        alert("❌ Ocurrió un error al guardar tu pedido.");
      }
    });
  }





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

          // Actualizar estado en Firestore
          await setDoc(doc(db, "transferencias", id), {
            estadoTransferencia: nuevoEstado
          }, { merge: true });

          // Si fue aceptada, descontar stock y generar pedido
          if (nuevoEstado === "Transferencia aceptada") {
            const transferenciaSnap = await getDoc(doc(db, "transferencias", id));
            const datosTransferencia = transferenciaSnap.data();
            const carrito = datosTransferencia.carrito || [];

            // Descontar stock
            for (const item of carrito) {
              if (!item.uid) continue;
              const productoRef = doc(db, "productos", item.uid);
              const productoSnap = await getDoc(productoRef);

              if (productoSnap.exists()) {
                const producto = productoSnap.data();
                const stockActual = producto.stock || 0;
                const nuevoStock = Math.max(0, stockActual - item.cantidad);
                await setDoc(productoRef, { stock: nuevoStock }, { merge: true });
              }
            }

            // Crear nuevo pedido en Firestore
            const refPedidos = collection(db, "pedidos");
            await addDoc(refPedidos, {
              ...datosTransferencia,
              estadoPedido: "Pendiente de preparación",
              creadoEn: Timestamp.now(),
              idTransferencia: id
            });
          }
        }

        alert("✅ Cambios guardados correctamente, stock actualizado y pedidos creados.");
        Object.keys(cambiosPendientes).forEach(id => delete cambiosPendientes[id]);
      } catch (error) {
        console.error("Error al guardar cambios o actualizar stock:", error);
        alert("❌ Hubo un problema al guardar los cambios o actualizar el stock.");
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



    const tipoEntregaRadios = document.querySelectorAll('input[name="tipo_entrega"]');
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

    // Recalcular si cambia el tipo de entrega
    tipoEntregaRadios.forEach(radio => {
      radio.addEventListener("change", calcularTotal);
    });


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
      const estadoPedido = p.estadoPedido || "-";
      const estaEnPreparacion = estadoPedido === "Preparando pedido";
      const estaListoEnvio = estadoPedido === "Pedido listo para envío/entrega";
      const estaConstruyendo = estadoPedido === "Construyendo pedido";
      const tipo = p.tipoEntrega;

      // Obtener dirección
      let direccion = "-";
      if (tipo === "domicilio") {
        direccion = p.direccionEnvio || p.direccion || "-";
        if ((!direccion || direccion === "-") && p.uidCliente) {
          const direccionesRef = collection(db, "direcciones", p.uidCliente, "items");
          const direccionesSnap = await getDocs(query(direccionesRef, orderBy("fechaGuardado", "desc"), limit(1)));
          if (!direccionesSnap.empty) {
            const d = direccionesSnap.docs[0].data();
            direccion = `${d.calleNumero || ""}, ${d.comuna || ""}, ${d.region || ""}`;
          }
        }
      } else if (tipo === "tienda") {
        direccion = `Sucursal: ${p.comunaSucursal || "-"}, ${p.regionSucursal || "-"}`;
      }

      // Deshabilitar botón si está en preparación, listo para envío/entrega o construyendo pedido
      const deshabilitarBtn = estaEnPreparacion || estaListoEnvio || estaConstruyendo;
      let btnTexto = "Tomar pedido";
      if (estaEnPreparacion, estaListoEnvio, estaConstruyendo) btnTexto = "En preparación";

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
          <button class="btn-tomar-pedido" data-id="${idPedido}" ${deshabilitarBtn ? "disabled" : ""}>
            ${btnTexto}
          </button>
        </td>
      `;

      if (tipo === "domicilio") {
        tablaDomicilio.appendChild(fila);
      } else {
        tablaSucursal.appendChild(fila);
      }
    }

    // Evento para los botones de ambas tablas
    document.querySelectorAll(".btn-tomar-pedido").forEach(btn => {
      btn.addEventListener("click", async () => {
        const id = btn.getAttribute("data-id");
        const fila = btn.closest("tr");
        const estadoCelda = fila.querySelector(".estado-pedido");

        try {
          const pedidoRef = doc(db, "pedidos", id);
          const pedidoSnap = await getDoc(pedidoRef);

          if (!pedidoSnap.exists()) {
            alert("❌ Este pedido ya no existe.");
            return;
          }

          const pedidoData = pedidoSnap.data();
          const estadoActual = pedidoData.estadoPedido;

          if (
            estadoActual !== "Pendiente de preparación"
          ) {
            alert("⚠️ Este pedido ya fue tomado por otro vendedor o está en otro estado.");
            btn.textContent =
              estadoActual === "Preparando pedido"
                ? "En preparación"
                : estadoActual === "Pedido listo para envío/entrega"
                ? "Listo para envío/entrega"
                : estadoActual === "Construyendo pedido"
                ? "Construyendo pedido"
                : "Ya tomado";
            btn.disabled = true;
            estadoCelda.textContent = estadoActual;
            return;
          }

          await setDoc(pedidoRef, { estadoPedido: "Preparando pedido" }, { merge: true });

          btn.textContent = "En preparación";
          btn.disabled = true;
          estadoCelda.textContent = "Preparando pedido";

          // ========== MAILTO ==========
          const correoCliente = pedidoData.correoCliente || "";
          const nombreCliente = pedidoData.nombreCliente || "Cliente";
          const tipoEntrega = pedidoData.tipoEntrega === "domicilio" ? "Despacho a domicilio" : "Retiro en tienda";
          const total = typeof pedidoData.total === "number" ? `$${pedidoData.total.toLocaleString("es-CL")}` : "-";
          const codigoPedido = pedidoData.codigoPedido || id;

          let nombresProductos = [];
          if (Array.isArray(pedidoData.carrito)) {
            nombresProductos = pedidoData.carrito.map(p => `${p.nombre || "Producto"} x${p.cantidad || 1}`);
          }

          const asunto = `🧺 Tu pedido ${codigoPedido} está en preparación`;
          const cuerpo = `
Hola ${nombreCliente},

Te contamos que tu pedido ha sido tomado por nuestro equipo y ya está en preparación. Aquí tienes los detalles:

🆔 Código del Pedido: ${codigoPedido}
🛍️ Productos:
${nombresProductos.join("\n")}

💰 Total: ${total}
🚚 Entrega: ${tipoEntrega}

Te avisaremos cuando esté listo para el despacho o retiro.

Gracias por tu compra 🙌

Equipo Ferremas
          `;

          const mailtoLink = `mailto:${correoCliente}?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(cuerpo)}`;
          window.open(mailtoLink, '_blank');

        } catch (error) {
          console.error("❌ Error al tomar pedido:", error);
          alert("❌ Hubo un problema. Intenta nuevamente.");
        }
      });
    });

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
  window.addEventListener("click", (e) => {
    if (e.target === errorModal) {
      errorModal.style.display = "none";
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && errorModal?.style.display === "block") {
      errorModal.style.display = "none";
    }
  });





  
});