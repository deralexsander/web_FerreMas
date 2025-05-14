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

      // Validación de campos
      if (!correo || !nombre || !apellidoPaterno || !apellidoMaterno || !rut || !rol || !password) {
        mostrarMensaje("Todos los campos son obligatorios.");
        return;
      }

      // 1. Guardar credenciales del admin actual
      const adminActual = auth.currentUser;
      const adminEmail = adminActual.email;
      const adminPassword = prompt("Por seguridad, ingrese su contraseña de administrador:");

      if (!adminPassword) {
        mostrarMensaje("Se requiere la contraseña de administrador.");
        return;
      }

      // 2. Crear el nuevo usuario en Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
      const nuevoUsuario = userCredential.user;

      // 3. Crear documento en Firestore
      const nuevoTrabajador = {
        uid: nuevoUsuario.uid,
        correo,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        rut,
        rol,
        password, // Considera no almacenar la contraseña en Firestore
        cambiarContraseña: true,
        creadoEn: Timestamp.now(),
        creadoPor: adminActual.uid
      };

      await setDoc(doc(db, "trabajadores", nuevoUsuario.uid), nuevoTrabajador);

      // 4. Volver a autenticar al admin
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
      
      // Intenta reautenticar al admin si hubo error
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
    // Limpiar datos antiguos si el usuario cambió
    const trabajadorStorage = JSON.parse(sessionStorage.getItem("trabajador"));
    if (!user || (trabajadorStorage && user.uid !== trabajadorStorage.id)) {
      sessionStorage.removeItem("trabajador");
    }

    // Actualizar enlaces de acceso/perfil
    const botonAccesoLink = document.querySelector('a[href="/acceso/"]');
    if (botonAccesoLink) botonAccesoLink.setAttribute('href', user ? '/perfil/' : '/acceso/');
    if (user && pathActual === '/acceso/') window.location.href = '/perfil/';
    if (!user && pathActual === '/perfil/') window.location.href = '/acceso/';

    // Elementos de la UI
    const nombreUsuario = document.getElementById('nombre-usuario');
    const correoUsuario = document.getElementById('correo-usuario');
    const fotoUsuario = document.getElementById('foto-usuario');
    const tipoUsuario = document.getElementById('rol-usuario');

    let rol = "";
    let datosTrabajador = null;

    try {
      // Siempre obtener datos frescos de Firestore
      if (user) {
        // Intentar obtener por UID primero (más eficiente)
        const docRef = doc(db, "trabajadores", user.uid);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
          datosTrabajador = docSnap.data();
          rol = (datosTrabajador?.rol || "").toLowerCase().trim();
          sessionStorage.setItem("trabajador", JSON.stringify({ ...datosTrabajador, id: user.uid }));
    
          // Mostrar modal si cambiarContraseña está en true
          if (datosTrabajador?.cambiarContraseña === true) {
            const modal = document.getElementById("passwordChangeModal");
            if (modal) modal.style.display = "block";
          }
    
        } else {
          // Si no existe por UID, buscar por correo (para compatibilidad)
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
    
            // Mostrar modal si cambiarContraseña está en true
            if (data?.cambiarContraseña === true) {
              const modal = document.getElementById("passwordChangeModal");
              if (modal) modal.style.display = "block";
            }
    
          } else {
            // Usuario normal (cliente)
            rol = "cliente";
            sessionStorage.setItem("trabajador", JSON.stringify({ rol: "cliente" }));
          }
        }
      }
    } catch (e) {
      console.error("Error obteniendo datos de trabajador:", e);
      rol = "";
    }
    

    // Actualizar UI según el rol
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

    // Actualizar clases CSS según rol
    const body = document.body;
    const roleClasses = [
      'usuario-admin',
      'usuario-vendedor',
      'usuario-contador',
      'usuario-bodeguero',
      'usuario-cliente'
    ];
    body.classList.remove(...roleClasses);
    
    if (rol) {
      body.classList.add(`usuario-${rol}`);
    } else {
      body.classList.add('usuario-cliente');
    }

    // Mostrar información del usuario
    if (nombreUsuario && correoUsuario && fotoUsuario && user) {
      const trabajadorCorreo = datosTrabajador?.correo || "";

      await user.reload();
      const userRefrescado = auth.currentUser;

      const sessionNombre = sessionStorage.getItem("nombreRegistroCliente") || "";
      const nombreBase = userRefrescado.displayName || sessionNombre || datosTrabajador?.nombre || "";
      const apellidoPaterno = datosTrabajador?.apellidoPaterno || "";
      const apellidoMaterno = datosTrabajador?.apellidoMaterno || "";

      let nombreCompleto = `${nombreBase} ${apellidoPaterno} ${apellidoMaterno}`.trim();
      if (!nombreCompleto || nombreCompleto === "") {
        nombreCompleto = user.email.split("@")[0];
      }

      nombreUsuario.textContent = nombreCompleto;
      correoUsuario.textContent = trabajadorCorreo || user.email;
      fotoUsuario.src = user.photoURL || "https://placehold.co/100x100";
    }

    // Si es admin, mostrar datos de trabajadores (para debug)
    if (rol === "admin") {
      try {
        const trabajadoresSnapshot = await getDocs(collection(db, "trabajadores"));
        console.log("Documentos de trabajadores:");
        trabajadoresSnapshot.forEach((doc) => {
          console.log(doc.id, doc.data());
        });
      } catch (e) {
        console.error("Error leyendo trabajadores como admin:", e);
      }
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
              <p class="tarjeta-producto__description">${producto.descripcion}</p>
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
          // Llenar datos del modal
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
  
          // Mostrar modal
          const modal = document.getElementById("modal-producto");
          modal.style.display = "block";
          modal.style.opacity = 1;
  
          // Reiniciar cantidad
          const inputCantidad = document.getElementById("cantidad");
          if (inputCantidad) inputCantidad.value = 1;
  
          // Botones + y -
          const btnIncrementar = document.getElementById("btn-incrementar");
          const btnDecrementar = document.getElementById("btn-decrementar");
  
          if (btnIncrementar && btnDecrementar && inputCantidad) {
            btnIncrementar.onclick = () => {
              inputCantidad.value = parseInt(inputCantidad.value) + 1;
            };
  
            btnDecrementar.onclick = () => {
              const valor = parseInt(inputCantidad.value);
              if (valor > 1) inputCantidad.value = valor - 1;
            };
          }
        });
  
        contenedor.appendChild(tarjeta);
      });
    } catch (e) {
      console.error("Error al cargar productos:", e);
    }
  }
  
  // Cargar los productos
  cargarUltimosProductos();
  
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

  // ======= AGREGAR AL CARRITO DESDE MODAL =======
  const btnAgregarCarrito = document.getElementById("btn-agregar-carrito");

  if (btnAgregarCarrito) {
    btnAgregarCarrito.addEventListener("click", () => {
      const nombre = document.getElementById("modal-nombre").textContent.trim();
      const precioTexto = document.getElementById("modal-precio").textContent.trim().replace(/\$/g, "").replace(/\./g, "").replace(",", ".");
      const precio = parseFloat(precioTexto);
      const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
      const codigo = document.getElementById("modal-codigo").textContent.replace("Codigo:", "").trim();
      const imagen = document.getElementById("modal-imagen").src;

      const nuevoItem = {
        codigo,
        nombre,
        precio,
        cantidad,
        imagen
      };

      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      const productoExistente = carrito.find(item => item.codigo === nuevoItem.codigo);

      if (productoExistente) {
        productoExistente.cantidad += cantidad;
      } else {
        carrito.push(nuevoItem);
      }

      localStorage.setItem("carrito", JSON.stringify(carrito));
      alert("✅ Producto agregado al carrito");
    });
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
  cargarTrabajadores();



  

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
  
  
  
  cargarProductosBodega();
  




  // Este bloque va DENTRO de tu window.addEventListener('DOMContentLoaded', async () => { ... })
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
        telefono: document.getElementById("telefono")?.value.trim() || "",
        correo: document.getElementById("correo")?.value.trim() || "",
        calleNumero: document.getElementById("calle-numero")?.value.trim() || "",
        departamento: document.getElementById("departamento")?.value.trim() || "",
        comuna: document.getElementById("comuna")?.value.trim() || "",
        ciudad: document.getElementById("ciudad")?.value.trim() || "",
        region: document.getElementById("region")?.value.trim() || "",
        codigoPostal: document.getElementById("codigo-postal")?.value.trim() || "",
        fechaGuardado: new Date()
      };

      const guardar = document.getElementById("guardar-envio")?.checked;

      if (guardar) {
        try {
          const ref = collection(db, "direcciones", user.uid, "items");
          await addDoc(ref, direccion);
          alert("✅ Dirección guardada");
          formEnvio.reset();
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
          ${datos.calleNumero}, ${datos.comuna}, ${datos.ciudad}<br>
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

  // Al cargar la página, intenta cargar direcciones (solo si el contenedor existe)
  if (document.getElementById("lista-direcciones")) {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        cargarDirecciones();
      }
    });
  }

  
});