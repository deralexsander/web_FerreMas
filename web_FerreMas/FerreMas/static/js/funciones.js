//---------------------------------
//
// Variables globales
//
//---------------------------------
let centrarLogin;
let correoTrabajadorActual = "";
let passwordTrabajadorActual = "";




window.addEventListener('DOMContentLoaded', async () => {

  //---------------------------------
  //
  // Función global para mostrar mensajes
  //
  //---------------------------------
  window.mostrarMensaje = function (texto, tipo = 'error') {
    const esError = tipo === 'error';

    const contenedor = document.getElementById(
      esError ? 'contenedor-mensaje' : 'contenedor-mensaje-success'
    );
    const mensajeTexto = document.getElementById(
      esError ? 'mensaje-texto' : 'mensaje-texto-success'
    );

    if (contenedor && mensajeTexto) {
      mensajeTexto.textContent = texto;

      contenedor.style.display = 'block';
      contenedor.classList.remove('animacion-salida', 'oculto');
      contenedor.classList.add('animacion-entrada');

      setTimeout(() => {
        contenedor.classList.remove('animacion-entrada');
        contenedor.classList.add('animacion-salida');

        setTimeout(() => {
          contenedor.classList.remove('animacion-salida');
          contenedor.classList.add('oculto');
          contenedor.style.display = 'none';
        }, 400);
      }, 4000);
    } else {
      alert(texto);
    }
  };


  aplicarAnimacionSiEsRegistroPersonal();

  //---------------------------------
  //
  // Referencias a formularios
  //
  //---------------------------------
  centrarLogin = document.querySelector('.centrar-login-cliente');
  const centrarRegistro = document.querySelector('.centrar-registro-cliente');
  const centrarRecuperar = document.querySelector('.centrar-recuperar');
  const centrarTrabajador = document.querySelector('.centrar-login-trabajador');

  //---------------------------------
  //
  // Links de navegación
  //
  //---------------------------------
  const linkRegistro = document.querySelector('.centrar-login-cliente .span:not(.ir-recuperar):not(.ir-trabajador)');
  const linkRecuperar = document.querySelector('.ir-recuperar');
  const linkIrRegistroDesdeRecuperar = document.querySelector('.centrar-recuperar .ir-registro');
  const linkLoginTodos = document.querySelectorAll('.volver-login');
  const linkIrTrabajador = document.querySelector('.ir-trabajador');

  //---------------------------------
  //
  // Métodos de pago y transferencia
  //
  //---------------------------------
  const btnTransferencia = document.getElementById("btn-mostrar-transferencia");
  const formTransferencia = document.getElementById("formulario-transferencia");
  const btnPagar = document.getElementById("btn-pagar");
  const seccionMetodosPago = btnPagar?.closest(".form");

  //---------------------------------
  //
  // Botón volver para transferencia
  //
  //---------------------------------
  const volverMetodoPago = document.createElement("button");
  volverMetodoPago.textContent = "⬅ Volver a métodos de pago";
  volverMetodoPago.className = "btn";
  volverMetodoPago.type = "button";
  if (formTransferencia) {
    formTransferencia.appendChild(volverMetodoPago);
  }


  //---------------------------------
  //
  // Navegación entre formularios principales
  //
  //---------------------------------
  if (linkRegistro) {
    linkRegistro.addEventListener('click', () => cambiarFormulario(centrarLogin, centrarRegistro));
  }
  if (linkRecuperar) {
    linkRecuperar.addEventListener('click', () => cambiarFormulario(centrarLogin, centrarRecuperar));
  }
  if (linkIrRegistroDesdeRecuperar) {
    linkIrRegistroDesdeRecuperar.addEventListener('click', () => cambiarFormulario(centrarRecuperar, centrarRegistro));
  }
  if (linkIrTrabajador) {
    linkIrTrabajador.addEventListener('click', () => cambiarFormulario(centrarLogin, centrarTrabajador));
  }
  if (linkLoginTodos.length > 0) {
    linkLoginTodos.forEach(btn => {
      btn.addEventListener('click', () => {
        const actual = btn.closest('.centrar-registro-cliente') || btn.closest('.centrar-recuperar') || btn.closest('.centrar-login-trabajador');
        cambiarFormulario(actual, centrarLogin);
      });
    });
  }

  //---------------------------------
  //
  // Métodos de pago: mostrar transferencia y volver
  //
  //---------------------------------
  if (btnTransferencia && formTransferencia && seccionMetodosPago) {
    btnTransferencia.addEventListener("click", (e) => {
      e.preventDefault();
      cambiarFormulario(seccionMetodosPago, formTransferencia);
    });

    volverMetodoPago.addEventListener("click", () => {
      cambiarFormulario(formTransferencia, seccionMetodosPago);
    });
  }
















  //-----------------------------
  // Escritura en Firestore si ?status=success|failure|pending
  //-----------------------------
  function esperarGuardarPedidoConAuth(status) {
    if (
      typeof window.firebaseAuth !== "undefined" &&
      typeof window.firebaseAuth.onAuthStateChanged === "function"
    ) {
      window.firebaseAuth.onAuthStateChanged(async (user) => {
        if (!user) {
          console.warn("⚠️ No hay usuario autenticado. No se escribirá en Firestore.");
          return;
        }

        try {

          const uid = crypto.randomUUID();
          const tipoEntrega = localStorage.getItem("tipo_entrega") || "no especificado";
          const region = localStorage.getItem("region") || null;
          const comuna = localStorage.getItem("comuna") || null;

          // Recuperar y formatear carrito
          const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
          const productos = carrito.map((item) => ({
            nombre: item.nombre || "Producto sin nombre",
            precio: parseFloat(item.precio) || 0,
            cantidad: parseInt(item.cantidad) || 1,
            imagen: item.imagen || null  // 👈 Aquí agregas la imagen
          }));

          // Validar que haya productos
          if (productos.length === 0) {
            console.warn("⚠️ No hay productos válidos en el carrito. No se guardará el pedido.");
            return;
          }

          let total = productos.reduce((sum, prod) => sum + prod.precio * prod.cantidad, 0);

          if (tipoEntrega === "domicilio") {
            total += 5000;
          }

          const pedidoData = {
            uid,
            userId: user.uid,
            email: user.email,
            tipoEntrega,
            region,
            comuna,
            productos,
            pedido: "En espera de preparación",
            total,
            tipoDePago: "Tarjeta",
            timestamp: new Date().toISOString()
          };

          if (tipoEntrega === "domicilio") {
            const direccionId = localStorage.getItem("direccionSeleccionada");
            if (direccionId) {
              const direccionRef = window.doc(window.firebaseDB, "direcciones", user.uid, "items", direccionId);
              const direccionSnap = await window.getDoc(direccionRef);

              if (direccionSnap.exists()) {
                pedidoData.direccionDespacho = direccionSnap.data();
                console.log("📬 Dirección de despacho añadida:", direccionSnap.data());
              } else {
                console.warn("⚠️ Dirección seleccionada no encontrada.");
              }
            }
          }

          const pedidoRef = window.doc(window.firebaseDB, "pedidos", uid);
          await window.setDoc(pedidoRef, pedidoData);

          console.log(`✅ Pedido guardado con UID: ${uid}, total: $${total}, tipo: ${tipoEntrega}`);

          // 🧹 Limpiar localStorage
          localStorage.removeItem("carrito");
          localStorage.removeItem("tipo_entrega");
          localStorage.removeItem("region");
          localStorage.removeItem("comuna");
          localStorage.removeItem("direccionSeleccionada");

          // 🔄 Redirigir a /carrito/
          setTimeout(() => {
            window.location.href = "/carrito/";
          }, 1000);

        } catch (err) {
          console.error("❌ Error al guardar en Firestore:", err);
          mostrarMensaje("❌ No se pudo registrar el pedido.", "error");
        }
      });
    } else {
      console.warn("🔁 Esperando que firebaseAuth esté disponible...");
      setTimeout(() => esperarGuardarPedidoConAuth(status), 100);
    }
  }







  //-----------------------------
  // Detectar si hay status en la URL
  //-----------------------------
  const params = new URLSearchParams(window.location.search);
  const status = params.get("status");

  const estadosValidos = ["success", "failure", "pending"];
  if (estadosValidos.includes(status)) {
    esperarGuardarPedidoConAuth(status);
  }







  //---------------------------------
  //
  // funcionBotón pagar 
  //
  //---------------------------------
  if (btnPagar) {
    btnPagar.addEventListener("click", async (e) => {
      e.preventDefault();

      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (carrito.length === 0) {
        mostrarMensaje("Tu carrito está vacío. Debes agregar productos antes de pagar.", "error");
        return;
      }

      const user = window.firebaseAuth?.currentUser;
      if (!user) {
        mostrarMensaje("Debes iniciar sesión antes de pagar.", "error");
        return;
      }

      const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value;
      const region = document.getElementById("region-sucursal")?.value;
      const comuna = document.getElementById("comuna-sucursal")?.value;

      if (!tipoEntrega) {
        mostrarMensaje("Debes seleccionar un tipo de entrega.", "error");
        return;
      }

      if (tipoEntrega === "tienda") {
        if (!region) {
          mostrarMensaje("Debes seleccionar una región para el retiro en tienda.", "error");
          return;
        }
        if (!comuna) {
          mostrarMensaje("Debes seleccionar una comuna para el retiro en tienda.", "error");
          return;
        }
      }

      if (tipoEntrega === "domicilio") {
        const direccionSeleccionada = localStorage.getItem("direccionSeleccionada");
        if (!direccionSeleccionada) {
          mostrarMensaje("Debes seleccionar una dirección para el despacho a domicilio.", "error");
          return;
        }

        try {
          await asegurarFirestore();

          const ref = window.doc(window.firebaseDB, "direcciones", user.uid, "items", direccionSeleccionada);
          const snap = await window.getDoc(ref);

          if (!snap.exists()) {
            mostrarMensaje("No hay ninguna dirección disponible. Agrega una antes de continuar.", "error");
            return;
          }
        } catch (err) {
          console.error("❌ Error al validar dirección:", err);
          mostrarMensaje("❌ Error al verificar tu dirección. Intenta nuevamente.", "error");
          return;
        }
      }

      const carritoFormateado = carrito.map((item) => ({
        nombre: item.nombre || "Producto sin nombre",
        precio: parseFloat(item.precio) || 0,
        cantidad: parseInt(item.cantidad) || 1
      }));

      console.log("🧺 Carrito enviado:", carritoFormateado);

      localStorage.setItem("tipo_entrega", tipoEntrega);
      localStorage.setItem("region", region || "");
      localStorage.setItem("comuna", comuna || "");

      try {
        const response = await fetch("/crear_preferencia/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            items: carritoFormateado,
            tipo_entrega: tipoEntrega
          })
        });

        const data = await response.json();
        if (data.init_point) {
          window.location.href = data.init_point;
        } else {
          alert("❌ No se pudo iniciar el pago. Intenta más tarde.");
        }
      } catch (error) {
        console.error("❌ Error al iniciar el pago:", error);
        alert("❌ Error al conectar con el servidor.");
      }
    });
  }





  //---------------------------------
  //
  // función de validación de formulario de inicio de sesión
  //
  //---------------------------------
  const formularioLogin = centrarLogin?.querySelector('form');

  if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (e) => {
      e.preventDefault();

      const inputs = formularioLogin.querySelectorAll('.input');
      const email = inputs[0]?.value.trim();
      const password = inputs[1]?.value.trim();

      if (!email) {
        mostrarMensaje("Por favor ingresa tu correo.", "error");
        return;
      }

      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(email)) {
        mostrarMensaje("El correo ingresado no es válido.", "error");
        return;
      }

      if (!password) {
        mostrarMensaje("Por favor ingresa tu contraseña.", "error");
        return;
      }

      // Autenticación con Firebase
      try {
        const userCredential = await firebaseSignIn(firebaseAuth, email, password);
        const user = userCredential.user;
        console.log("Inicio de sesión exitoso:", user);
        window.location.href = "/perfil/"; // Cambia esta URL según tu sistema
      } catch (error) {
        console.error("Error de autenticación:", error);

        // Muestra errores comunes con mensajes claros
        if (error.code === "auth/too-many-requests") {
          mostrarMensaje("Demasiados intentos fallidos, Intenta más tarde.", "error");
        } else {
          mostrarMensaje("Correo o contraseña son incorrectos.", "error");
        }
      }
    });
  }


  //---------------------------------
  //
  // Validación del formulario de registro
  //
  //---------------------------------
  const formularioRegistro = document.querySelector('.centrar-registro-cliente form');

  if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();

      const inputs = formularioRegistro.querySelectorAll('.input');
      const email = inputs[0]?.value.trim();
      const usuario = inputs[1]?.value.trim();
      const password = inputs[2]?.value.trim();
      const confirmPassword = inputs[3]?.value.trim();

      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        mostrarMensaje("Por favor ingresa tu correo.", "error");
        return;
      }

      if (!regexCorreo.test(email)) {
        mostrarMensaje("El correo ingresado no es válido.", "error");
        return;
      }

      if (!usuario) {
        mostrarMensaje("Por favor ingresa tu nombre de usuario.", "error");
        return;
      }

      if (!password) {
        mostrarMensaje("Por favor ingresa tu contraseña.", "error");
        return;
      }

      if (!confirmPassword) {
        mostrarMensaje("Confirma tu contraseña.", "error");
        return;
      }

      if (password !== confirmPassword) {
        mostrarMensaje("Las contraseñas no coinciden.", "error");
        return;
      }

      // Registro en Firebase
      try {
        const userCredential = await window.createUserWithEmailAndPassword(window.firebaseAuth, email, password);
        const user = userCredential.user;

        await window.updateProfile(user, { displayName: usuario });

        console.log("Registro exitoso:", user);
        window.location.href = "/perfil/"; // Ajusta la URL según tu sistema

      } catch (error) {
        console.error("Error al registrar:", error);

        if (error.code === "auth/email-already-in-use") {
          mostrarMensaje("Este correo ya está registrado.", "error");
        } else if (error.code === "auth/weak-password") {
          mostrarMensaje("La contraseña debe tener al menos 6 caracteres.", "error");
        } else {
          mostrarMensaje("Ocurrió un error al registrarte. Intenta nuevamente.", "error");
        }
      }
    });
  }


  //---------------------------------
  //
  // Validación del formulario de recuperación de contraseña
  //
  //---------------------------------
  const formularioRecuperar = document.querySelector('.centrar-recuperar form');

  if (formularioRecuperar) {
    formularioRecuperar.addEventListener('submit', async (e) => {
      e.preventDefault();

      const email = formularioRecuperar.querySelector('.input')?.value.trim();
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) {
        mostrarMensaje("Por favor ingresa tu correo.", "error");
        return;
      }

      if (!regexCorreo.test(email)) {
        mostrarMensaje("El correo ingresado no es válido.", "error");
        return;
      }

      try {
        // Verificar si existe una cuenta con este correo
        const { fetchSignInMethodsForEmail } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const methods = await fetchSignInMethodsForEmail(firebaseAuth, email);

        // Enviar correo de recuperación
        await sendPasswordResetEmail(firebaseAuth, email);
        mostrarMensaje("Te hemos enviado un correo para restablecer tu contraseña.", "success");
        formularioRecuperar.reset();
      } catch (error) {
        console.error("Error al procesar la recuperación:", error);

        if (error.code === "auth/too-many-requests") {
          mostrarMensaje("Demasiados intentos. Intenta más tarde.", "error");
        } else {
          mostrarMensaje("Ocurrió un error. Intenta nuevamente.", "error");
        }
      }
    });
  }



//---------------------------------
//
// Validación del formulario de carrito
//
//---------------------------------

if (formTransferencia) {
  formTransferencia.addEventListener("submit", async (e) => {
    e.preventDefault();

    // 1. Validar productos en el carrito
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
      mostrarMensaje("Tu carrito está vacío. Debes agregar productos antes de pagar.", "error");
      return;
    }

    // 2. Validar tipo de entrega
    const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value;
    const region = document.getElementById("region-sucursal")?.value;
    const comuna = document.getElementById("comuna-sucursal")?.value;

    if (tipoEntrega === "tienda") {
      if (!region) {
        mostrarMensaje("Debes seleccionar una región para el retiro en tienda.", "error");
        return;
      }
      if (!comuna) {
        mostrarMensaje("Debes seleccionar una comuna para el retiro en tienda.", "error");
        return;
      }
    }

    // 3. Validar campos del formulario
    const nombre = formTransferencia.querySelector('input[name="nombre"]')?.value.trim();
    const rut = formTransferencia.querySelector('input[name="rut"]')?.value.trim();
    const banco = document.getElementById("banco")?.value;
    const acepta = formTransferencia.querySelector('input[name="acepta"]')?.checked;

    const regexRut = /^\d{7,8}-[\dkK]$/;

    if (!nombre) {
      mostrarMensaje("Por favor ingresa el nombre del titular.", "error");
      return;
    }
    if (!rut || !regexRut.test(rut)) {
      mostrarMensaje("El RUT ingresado no es válido. Ej: 12345678-9", "error");
      return;
    }
    if (!banco) {
      mostrarMensaje("Debes seleccionar un banco.", "error");
      return;
    }
    if (!acepta) {
      mostrarMensaje("Debes aceptar que el pago será validado manualmente.", "error");
      return;
    }

    // 4. Verificar si el usuario ha iniciado sesión
    const user = firebaseAuth?.currentUser;
    if (!user) {
      mostrarMensaje("Debes iniciar sesión para realizar la transferencia.", "error");
      return;
    }

    // 5. Validar dirección SOLO si es despacho a domicilio
    if (tipoEntrega === "domicilio") {
      try {
        const direccionesRef = collection(firebaseDB, "direcciones", user.uid, "items");
        const direccionesSnap = await getDocs(query(direccionesRef, orderBy("fechaGuardado", "desc"), limit(1)));

        if (direccionesSnap.empty) {
          mostrarMensaje("No tienes ninguna dirección guardada. Agrega una antes de continuar.", "error");
          return;
        }

      } catch (error) {
        console.error("Error al validar la dirección:", error);
        mostrarMensaje(" Ocurrió un error al validar tu dirección. Intenta nuevamente.", "error");
        return;
      }
    }

    // 6. Todo validado, mostrar mensaje de carga
    mostrarMensaje(" Guardando carrito, Por favor no recargar. ", "info", "success");

    // 7. Ejecutar función que guarda la transferencia
    await formTransferencias();
  });
}




  //---------------------------------
  //
  // Funcion para desloguear con el botón de logout
  //
  //---------------------------------

  // 👇 Esto lo agregas en el logout
const botonLogout = document.getElementById('boton-logout');
if (botonLogout) {
  botonLogout.addEventListener('click', async () => {
    try {
      await window.firebaseAuth.signOut();

      // 🧹 Limpieza al cerrar sesión
      localStorage.removeItem("esTrabajador");
      document.cookie = "esTrabajador=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";

      window.location.href = '/acceso/';
    } catch (error) {
      alert('Error al cerrar sesión');
      console.error(error);
    }
  });
}



  //---------------------------------
  //
  // funcion para bloquear paguinas si no hay usuario autenticado
  //
  //---------------------------------


  function esperarOnFirebaseAuthStateChanged() {
    if (typeof window.onFirebaseAuthStateChanged === "function") {
      const pathActual = window.location.pathname;
      window.onFirebaseAuthStateChanged(async (user) => {
        // 🔐 Si NO hay usuario o no tiene correo, redirige a /acceso/
        if (!user || !user.email) {
          if (pathActual === '/perfil/' || pathActual.startsWith('/perfil')) {
            window.location.href = '/acceso/';
            return;
          }
        }

        // ✅ Si hay usuario con correo y está en /acceso/, lo redirige al perfil
        if (user?.email && pathActual === '/acceso/') {
          window.location.href = '/perfil/';
          return;
        }

        // Enlace dinámico del botón
        const botonAccesoLink = document.querySelector('a[href="/acceso/"]');
        if (botonAccesoLink) {
          botonAccesoLink.setAttribute('href', user ? '/perfil/' : '/acceso/');
        }

        // (Opcional) Mostrar en consola
        if (user?.email) {
          console.log("Usuario autenticado con correo:", user.email);
        } else {
          console.log("No hay usuario autenticado");
        }
      });
    } else {
      setTimeout(esperarOnFirebaseAuthStateChanged, 100); // Intenta de nuevo en 100ms
    }
  }

  esperarOnFirebaseAuthStateChanged();


  //---------------------------------
  //
  // funcion para generar contraseña de trabajador 
  //
  //---------------------------------

  // 👉 Vincular inputs para generación automática de contraseña
  document.getElementById('rut-trabajador')?.addEventListener('input', generarPassword);
  document.getElementById('nombre-trabajador')?.addEventListener('input', generarPassword);
  document.getElementById('apellido-paterno-trabajador')?.addEventListener('input', generarPassword);

  // 👉 Vincular botón para copiar contraseña (más moderno)
  const botonCopiar = document.querySelector('button[onclick="copiarPassword()"]');
  if (botonCopiar) {
    botonCopiar.addEventListener("click", copiarPassword);
  }

  function generarPassword() {
    const rut = document.getElementById('rut-trabajador').value.trim();
    const nombre = document.getElementById('nombre-trabajador').value.trim().toLowerCase();
    const apellido = document.getElementById('apellido-paterno-trabajador').value.trim().toLowerCase();
    const passInput = document.getElementById('password-trabajador');

    if (rut && nombre && apellido) {
      const rutClean = rut.replace(/\./g, '').replace(/-/g, '');
      const simbolos = ['!', '@', '#', '$', '%'];
      const simbolo = simbolos[Math.floor(Math.random() * simbolos.length)];
      const parte1 = nombre.slice(0, 2);
      const parte2 = apellido.slice(0, 2);
      const parte3 = nombre.slice(2, 4);
      const password = `${parte1}${rutClean.slice(0, 3)}${parte2}${simbolo}${rutClean.slice(-3)}${parte3}`;
      passInput.value = password;
    } else {
      passInput.value = "";
    }
  }

  // Modifica la función copiarPassword para copiar ambos datos
  function copiarPassword() {
    const texto = `Correo trabajador: ${correoTrabajadorActual}, contraseña de un solo uso de cuenta: ${passwordTrabajadorActual}`;
    // Copiar al portapapeles
    if (navigator.clipboard) {
      navigator.clipboard.writeText(texto).then(() => {
        mostrarMensaje('Correo y contraseña copiados al portapapeles', "success");
      });
    } else {
      // Fallback para navegadores antiguos
      const tempInput = document.createElement("input");
      tempInput.value = texto;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      mostrarMensaje('Correo y contraseña copiados al portapapeles', "success");
    }
  }
//---------------------------------
//
// función para hacer los pasos de registro de trabajador
//
//---------------------------------
if (window.location.pathname === "/registro_personal/") {
  const pasos = ["paso-1", "paso-2", "paso-3", "paso-4"];
  let pasoActual = 0;

  function mostrarPaso(index) {
    const actual = document.getElementById(pasos[pasoActual]);
    const destino = document.getElementById(pasos[index]);
    if (actual !== destino) {
      if (typeof window.cambiarFormulario === "function") {
        window.cambiarFormulario(actual, destino);
      } else {
        actual.style.display = "none";
        destino.style.display = "block";
      }
    }
    pasoActual = index;
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (index === 3) {
      const correoInput = document.querySelector('#paso-2 #correo-trabajador');
      const passwordInput = document.getElementById('password-trabajador');
      correoTrabajadorActual = correoInput?.value || "";
      passwordTrabajadorActual = passwordInput?.value || "";
      const infoDiv = document.getElementById('info-cuenta-trabajador');
      if (infoDiv) {
        infoDiv.textContent = `Correo trabajador: ${correoTrabajadorActual}, contraseña de un solo uso de cuenta: ${passwordTrabajadorActual}`;
      }
      const correoPaso4 = document.querySelector('#paso-4 #correo-trabajador-final');
      if (correoPaso4) correoPaso4.value = correoTrabajadorActual;
    }
  }
  window.mostrarPaso = mostrarPaso;

  //---------------------------------
//
// función para validar formulario trabajador 
//
//---------------------------------

  async function validarFormulario(form, index) {
    let valido = true;

    if (index === 0) {
      const nombre = form.querySelector('#nombre-trabajador');
      const apellidoP = form.querySelector('#apellido-paterno-trabajador');
      const apellidoM = form.querySelector('#apellido-materno-trabajador');
      if (!nombre.value.trim()) {
        mostrarMensaje("Por favor ingresa el nombre del trabajador.", "error");
        valido = false;
      } else if (!apellidoP.value.trim()) {
        mostrarMensaje("Por favor ingresa el apellido paterno.", "error");
        valido = false;
      } else if (!apellidoM.value.trim()) {
        mostrarMensaje("Por favor ingresa el apellido materno.", "error");
        valido = false;
      }
    } else if (index === 1) {
      const correo = form.querySelector('#correo-trabajador');
      const rut = form.querySelector('#rut-trabajador');
      const rol = form.querySelector('#rol-trabajador');
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const regexRut = /^\d{7,8}-[\dkK]$/;
      if (!correo.value.trim()) {
        mostrarMensaje("Por favor ingresa el correo del trabajador.", "error");
        valido = false;
      } else if (!regexCorreo.test(correo.value.trim())) {
        mostrarMensaje("El correo ingresado no es válido.", "error");
        valido = false;
      } else if (!rut.value.trim()) {
        mostrarMensaje("Por favor ingresa el RUT del trabajador.", "error");
        valido = false;
      } else if (!regexRut.test(rut.value.trim())) {
        mostrarMensaje("El RUT ingresado no es válido. Ej: 12345678-9", "error");
        valido = false;
      } else if (!rol.value) {
        mostrarMensaje("Debes seleccionar un rol para el trabajador.", "error");
        valido = false;
      }
    }

    return valido;
  }

  // Manejo de formularios paso 1 y paso 2
  const formularioPaso1 = document.querySelector('#paso-1 form');
  if (formularioPaso1) {
    formularioPaso1.addEventListener('submit', async (e) => {
      e.preventDefault();
      const valido = await validarFormulario(formularioPaso1, 0);
      if (valido) mostrarPaso(1);
    });
  }

  const formularioPaso2 = document.querySelector('#paso-2 form');
  if (formularioPaso2) {
    formularioPaso2.addEventListener('submit', async (e) => {
      e.preventDefault();
      const valido = await validarFormulario(formularioPaso2, 1);
      if (valido) mostrarPaso(2);
    });
  }

  // Botones "Volver" entre pasos
  document.querySelectorAll('.volver-atras').forEach((boton) => {
    boton.addEventListener('click', () => {
      if (pasoActual > 0) mostrarPaso(pasoActual - 1);
    });
  });
}



  //---------------------------------
  //
  // función para mostrar la ruta actual
  //
  //---------------------------------
  function mostrarRutaActual() {
    const pathActual = window.location.pathname.replace(/\/+$/, "") + "/";
    console.log("Ruta actual:", pathActual);
    return pathActual;
  }

  //---------------------------------
  //
  // función para mostrar/ocultar navbar o contenedor
  //
  //---------------------------------
function aplicarAnimacionSiEsRegistroPersonal() {
  const path = mostrarRutaActual();
  const contenedor = document.querySelector(".button-container");

  if (!contenedor) return;

  contenedor.classList.remove("pop-in", "pop-out");

  // Rutas que deben activar pop-out + marcar pop-in para después
  const rutasQueAniman = ["/registro_personal/", "/crear_producto/", "/datos_personales/", "/pedidos_realizados/", "/trasferencias/", "/armado_pedidos/"];

  if (rutasQueAniman.includes(path)) {
    contenedor.classList.add("pop-out");
    localStorage.setItem("animar_popin", "true");

  } else {
    const debeAnimarPopIn = localStorage.getItem("animar_popin") === "true";

    if (debeAnimarPopIn) {
      contenedor.style.opacity = 0;
      contenedor.classList.add("pop-in");

      localStorage.removeItem("animar_popin");

      setTimeout(() => {
        contenedor.style.opacity = "";
      }, 2500); // Duración de la animación
    }
  }
}




  //---------------------------------
  //
  // función para cambiar de formulario a tabla
  //
  //---------------------------------

  function alternarFormularioTablaAnimado() {
    const btnCrear = document.getElementById("btn-crear");
    const btnTabla = document.getElementById("btn-tabla");
    const modalTabla = document.getElementById("modal-tabla-trabajadores");
    const cerrarModal = document.getElementById("cerrar-modal");

    // Solo correr si todos los elementos existen
    if (!btnCrear || !btnTabla || !modalTabla || !cerrarModal) {
      // Elimina este error para que no moleste en páginas donde no aplica
      return;
    }

    // ✅ Abrir el modal al hacer clic en "Tabla trabajadores"
    btnTabla.addEventListener("click", () => {
      if (btnTabla.classList.contains("active")) return;

      btnTabla.classList.add("active");
      btnCrear.classList.remove("active");

      modalTabla.style.display = "block";

      if (typeof cargarTrabajadores === "function") {
        cargarTrabajadores();
      }
    });

    // ✅ Cerrar modal con botón cerrar (X)
    cerrarModal.addEventListener("click", () => {
      modalTabla.style.display = "none";
      btnCrear.classList.add("active");
      btnTabla.classList.remove("active");
    });

    // ✅ Cerrar modal al hacer clic en "Crear trabajador"
    btnCrear.addEventListener("click", () => {
      if (btnCrear.classList.contains("active")) return;

      btnCrear.classList.add("active");
      btnTabla.classList.remove("active");

      modalTabla.style.display = "none";
    });

    // ✅ Cerrar modal si se hace clic fuera del contenido
    window.addEventListener("click", (event) => {
      if (event.target === modalTabla) {
        modalTabla.style.display = "none";
        btnCrear.classList.add("active");
        btnTabla.classList.remove("active");
      }
    });
  }

  // ✅ Inicialización
  if (document.getElementById("btn-crear") && document.getElementById("btn-tabla")) {
    alternarFormularioTablaAnimado();
  }


//---------------------------------
//
// función para cambiar de formulario a tabla de productos
//
//---------------------------------

function alternarFormularioTablaAnimadoProductos() {
  const btnCrear = document.getElementById("btn-crear-producto");
  const btnTabla = document.getElementById("btn-tabla-productos");

  const modalTabla = document.getElementById("modal-tabla-productos");
  const cerrarModal = document.getElementById("cerrar-modal");

  if (!btnCrear || !btnTabla || !modalTabla || !cerrarModal) {
    console.error("❌ Faltan elementos necesarios para el funcionamiento");
    return;
  }

  // ✅ Abrir el modal al hacer clic en "Tabla productos"
  btnTabla.addEventListener("click", () => {
    if (btnTabla.classList.contains("active")) return;

    btnTabla.classList.add("active");
    btnCrear.classList.remove("active");

    modalTabla.style.display = "block";

    // Si tienes una función para cargar productos, se ejecuta
    if (typeof cargarProductos === "function") {
      cargarProductos();
    }
  });

  // ✅ Cerrar modal con botón cerrar (X)
  cerrarModal.addEventListener("click", () => {
    modalTabla.style.display = "none";
    btnCrear.classList.add("active");
    btnTabla.classList.remove("active");
  });

  // ✅ Cerrar modal al hacer clic en "Crear producto"
  btnCrear.addEventListener("click", () => {
    if (btnCrear.classList.contains("active")) return;

    btnCrear.classList.add("active");
    btnTabla.classList.remove("active");

    modalTabla.style.display = "none";
  });

  // ✅ Cerrar modal si se hace clic fuera del contenido
  window.addEventListener("click", (event) => {
    if (event.target === modalTabla) {
      modalTabla.style.display = "none";
      btnCrear.classList.add("active");
      btnTabla.classList.remove("active");
    }
  });
}

// ✅ Inicialización si los elementos existen
if (
  document.getElementById("btn-crear-producto") &&
  document.getElementById("btn-tabla-productos")
) {
  alternarFormularioTablaAnimadoProductos();
}




  //---------------------------------
  //
  // función validar form productos
  //
  //---------------------------------

  // ✅ Mostrar cantidad de imágenes seleccionadas
  const inputFoto = document.querySelector('input[name="foto"]');
  const contador = document.getElementById("contador-fotos");
  if (inputFoto && contador) {
    inputFoto.addEventListener("change", () => {
      const total = inputFoto.files.length;
      contador.textContent = total === 0
        ? "No has seleccionado imágenes."
        : `Has seleccionado ${total} imagen${total > 1 ? 'es' : ''}.`;
    });
  }

  // ✅ Función para cambiar de paso
  function cambiarPaso(desde, hacia) {
    const pasoActual = document.getElementById(`paso-${desde}-producto`);
    const pasoDestino = document.getElementById(`paso-${hacia}-producto`);

    if (pasoActual && pasoDestino) {
      pasoActual.classList.remove('visible');
      pasoActual.classList.add('oculto');

      pasoDestino.classList.remove('oculto');
      pasoDestino.classList.add('visible');
    }
  }

  // ✅ Validación por paso al presionar "Siguiente"
  document.querySelectorAll(".btn-siguiente").forEach((boton) => {
    boton.addEventListener("click", () => {
      const pasoActual = parseInt(boton.dataset.paso);
      const contenedor = document.getElementById(`paso-${pasoActual}-producto`);
      const campos = contenedor.querySelectorAll("input, select, textarea");

      for (let input of campos) {
        if (input.name === "foto") {
          const files = input.files;
          if (!files || files.length < 1) {
            alert("Debes subir al menos 1 imagen del producto.");
            return;
          }
          if (files.length > 3) {
            alert("Solo puedes subir hasta 3 imágenes.");
            return;
          }
          continue;
        }

        if (input.hasAttribute("required") && !input.value.trim()) {
          const label = input.closest(".inputForm")?.previousElementSibling?.innerText || input.name;
          alert(`Por favor completa el campo: ${label}`);
          return;
        }
      }

      cambiarPaso(pasoActual, pasoActual + 1);
    });
  });

  // ✅ Botones "Volver"
  document.querySelectorAll(".volver-atras").forEach((boton) => {
    boton.addEventListener("click", () => {
      const visible = document.querySelector(".contenedor_informacion.visible");
      if (!visible) return;

      const pasoActual = parseInt(visible.id.match(/\d+/)[0]);
      cambiarPaso(pasoActual, pasoActual - 1);
    });
  });


if (window.location.pathname === "/crear_producto/") {
  const btnTabla = document.getElementById("btn-tabla-productos");
  const modal = document.getElementById("modal-tabla-productos");
  const cerrarModal = document.getElementById("cerrar-modal");

  if (btnTabla && modal && cerrarModal) {
    btnTabla.addEventListener("click", () => {
      modal.classList.remove("oculto");
    });

    cerrarModal.addEventListener("click", () => {
      modal.classList.add("oculto");
    });

    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.add("oculto");
      }
    });
  } else {
    console.error("❌ No se encontró alguno de los elementos del modal.");
  }
}













window.inicializarControlesCantidad = function () {
  const contenedor = document.querySelector('.input-cantidad-container');
  if (!contenedor) return;

  const input = contenedor.querySelector('.cantidad-productos');
  const botones = contenedor.querySelectorAll('.btn-cantidad');
  const stockMaximo = parseInt(input.dataset.stock) || Infinity;

  botones.forEach((btn) => {
    btn.addEventListener('click', () => {
      let valor = parseInt(input.value) || 1;

      if (btn.textContent === '+') {
        if (valor < stockMaximo) valor++;
      } else if (btn.textContent === '-' && valor > 1) {
        valor--;
      }

      input.value = valor;
    });
  });
};






function cerrarModalProducto() {
  const modal = document.getElementById("modal-producto");
  const inputCantidad = document.getElementById("cantidad");
  const stockTexto = document.getElementById("modal-stock");

  // Reiniciar cantidad y data-stock
  if (inputCantidad) {
    inputCantidad.value = 1;
    delete inputCantidad.dataset.stock;
  }

  // Restaurar estilo de stock
  if (stockTexto) {
    stockTexto.textContent = "";
    stockTexto.style.color = "";
  }

  // Animación de salida
  modal.classList.remove("activo");
  modal.classList.add("saliendo");

  setTimeout(() => {
    modal.classList.remove("saliendo");
    modal.style.display = "none";
  }, 1900);
}

// Botón de cerrar
document.querySelector('.boton_salir')?.addEventListener('click', cerrarModalProducto);

// Presionar ESC
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && document.getElementById("modal-producto")?.classList.contains("activo")) {
    cerrarModalProducto();
  }
});

// Clic fuera del modal
document.getElementById("modal-producto")?.addEventListener("click", (e) => {
  if (e.target.id === "modal-producto") {
    cerrarModalProducto();
  }
});

















// ======= CONTADOR DE PRODUCTOS DIFERENTES =======
function actualizarContadorProductosDiferentes() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const badgeContador = document.getElementById("contador-productos");
  if (badgeContador) badgeContador.textContent = carrito.length;
}

// ======= OBTENER COSTO DE ENVÍO =======
function obtenerCostoEnvio() {
  const inputSeleccionado = document.querySelector('input[name="tipo_entrega"]:checked');
  const tipoEntrega = inputSeleccionado ? inputSeleccionado.value : localStorage.getItem("tipo_entrega") || "tienda";
  return tipoEntrega === "domicilio" ? 5000 : 0;
}

// ======= AGREGAR PRODUCTO AL CARRITO =======
function agregarAlCarrito() {
  const cantidad = parseInt(document.getElementById("cantidad").value) || 1;
  const uid = document.getElementById("modal-producto").getAttribute("data-uid");
  const nombre = document.getElementById("modal-nombre").textContent;
  const precioTexto = document.getElementById("modal-precio").textContent;
  const precio = parseInt(precioTexto.replace(/\D/g, "")) || 0;
  const imagen = document.getElementById("modal-imagen").src;

  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];

  const existente = carrito.find(p => p.uid === uid);
  if (existente) {
    existente.cantidad += cantidad;
  } else {
    carrito.push({ uid, nombre, precio, cantidad, imagen });
  }

  localStorage.setItem("carrito", JSON.stringify(carrito));
  renderizarCarrito();
  actualizarContadorProductosDiferentes();
  mostrarMensaje(" Producto agregado al carrito", "success");
}

// ======= MODIFICAR CANTIDAD Y ELIMINAR =======
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

// ======= VISTA DEL CARRITO =======
function renderizarCarrito() {
  const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
  const contenedor = document.getElementById("carrito-contenido");
  const totalPagar = document.getElementById("total-pagar");
  const btnPagar = document.getElementById("btn-pagar");

  if (!contenedor || !totalPagar || !btnPagar) return;

  if (carrito.length === 0) {
    contenedor.innerHTML = "<h1 class='titulo-form-center'>No hay productos en el carrito.</h1>";
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
  totalPagar.textContent = `$${(total + costoEnvio).toLocaleString("es-CL")}`;

  document.querySelectorAll(".btn-cantidad-mayor").forEach(btn =>
    btn.addEventListener("click", () => modificarCantidad(btn.dataset.index, 1))
  );
  document.querySelectorAll(".btn-cantidad-menor").forEach(btn =>
    btn.addEventListener("click", () => modificarCantidad(btn.dataset.index, -1))
  );
  document.querySelectorAll(".btn-eliminar").forEach(btn =>
    btn.addEventListener("click", () => eliminarProducto(btn.dataset.index))
  );
}

// ======= VACIAR CARRITO =======
document.getElementById("btn-vaciar-carrito")?.addEventListener("click", () => {
  if (confirm("🗑 ¿Estás seguro de que quieres vaciar el carrito?")) {
    localStorage.removeItem("carrito");
    renderizarCarrito();
    actualizarContadorProductosDiferentes();
  }
});

// ======= EVENTO PARA BOTÓN DE AGREGAR AL CARRITO =======
document.getElementById("btn-agregar-carrito")?.addEventListener("click", agregarAlCarrito);

// ======= REACTIVAR CUANDO CAMBIA TIPO DE ENTREGA =======
document.querySelectorAll('input[name="tipo_entrega"]').forEach(radio => {
  radio.addEventListener("change", renderizarCarrito);
});

// ======= CARGAR AL INICIO =======
actualizarContadorProductosDiferentes();
renderizarCarrito();













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


























function alternarFormularioTablaDirecciones() {
  const btnAgregar = document.getElementById("btn-agregar-direccion");
  const btnTabla = document.getElementById("btn-tabla-direcciones");

  const modalDirecciones = document.getElementById("modal-direcciones");
  const cerrarModal = document.getElementById("cerrar-modal-direcciones");

  if (!btnAgregar || !btnTabla || !modalDirecciones || !cerrarModal) {
    console.error("❌ Faltan elementos necesarios para direcciones");
    return;
  }

  // ✅ Abrir el modal al hacer clic en "Tus direcciones"
  btnTabla.addEventListener("click", () => {
    if (btnTabla.classList.contains("active")) return;

    btnTabla.classList.add("active");
    btnAgregar.classList.remove("active");

    modalDirecciones.style.display = "block";

    if (typeof cargarDirecciones === "function") {
      cargarDirecciones();
    }
  });

  // ✅ Cerrar modal con botón cerrar (X)
  cerrarModal.addEventListener("click", () => {
    modalDirecciones.style.display = "none";
    btnAgregar.classList.add("active");
    btnTabla.classList.remove("active");
  });

  // ✅ Cerrar modal al hacer clic en "Agregar dirección"
  btnAgregar.addEventListener("click", () => {
    if (btnAgregar.classList.contains("active")) return;

    btnAgregar.classList.add("active");
    btnTabla.classList.remove("active");

    modalDirecciones.style.display = "none";
  });

  // ✅ Cerrar modal al hacer clic fuera del contenido
  window.addEventListener("click", (event) => {
    if (event.target === modalDirecciones) {
      modalDirecciones.style.display = "none";
      btnAgregar.classList.add("active");
      btnTabla.classList.remove("active");
    }
  });
}

// ✅ Inicialización
if (
  document.getElementById("btn-agregar-direccion") &&
  document.getElementById("btn-tabla-direcciones")
) {
  alternarFormularioTablaDirecciones();
}


// ---------- Validación individual ----------
function validarFormularioPaso(formulario) {
  const inputs = formulario.querySelectorAll('input, select');

  for (let input of inputs) {
    if (input.hasAttribute('required')) {
      const valor = input.value.trim();
      const label = input.closest('.inputForm')?.previousElementSibling?.innerText || 'Este campo';

      if (!valor) {
        input.classList.add('input-error');
        mostrarMensaje(`El campo '${label}' es obligatorio.`, 'error');
        input.focus();
        return false;
      }

      if (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(valor)) {
        input.classList.add('input-error');
        mostrarMensaje(`El campo '${label}' debe ser un correo válido.`, 'error');
        input.focus();
        return false;
      }

      if (input.id === 'telefono' && !/^\d+$/.test(valor)) {
        input.classList.add('input-error');
        mostrarMensaje(`El campo '${label}' debe contener solo números.`, 'error');
        input.focus();
        return false;
      }

      if (input.id === 'rut' && !/^[0-9]+-[0-9kK]{1}$/.test(valor)) {
        input.classList.add('input-error');
        mostrarMensaje(`El campo '${label}' debe tener un RUT válido (Ej: 12345678-9).`, 'error');
        input.focus();
        return false;
      }

      input.classList.remove('input-error');
    }
  }

  return true;
}

// ---------- Cambio de pasos con validación al avanzar ----------
function mostrarPaso(numero) {
  const pasoActual = document.querySelector('.contenedor_informacion.visible');
  const pasoDestino = document.getElementById(`paso-${numero}-direccion`);

  if (!pasoActual || !pasoDestino || pasoActual === pasoDestino) return;

  const numeroActual = parseInt(pasoActual.id.split('-')[1]);
  if (numero > numeroActual) {
    const formulario = pasoActual.querySelector('form');
    if (formulario && !validarFormularioPaso(formulario)) return;
  }

  pasoActual.classList.remove('visible');
  cambiarFormulario(pasoActual, pasoDestino);
}

// ---------- Guardar dirección en Firebase Cloud ----------
window.guardarDireccion = async function () {
  const paso3 = document.getElementById('paso-3-direccion');
  const formulario = paso3?.querySelector('form');
  if (!formulario) return;
  if (!validarFormularioPaso(formulario)) return;

  const user = window.firebaseAuth?.currentUser;
  if (!user) {
    mostrarMensaje("Debes iniciar sesión para guardar tu dirección.", "error");
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
    mostrarMensaje("📍 Debes seleccionar región y comuna.", "error");
    return;
  }

  try {
    // Asegurarse de que addDoc esté cargado
    if (!window.addDoc) {
      const firestore = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
      window.addDoc = firestore.addDoc;
    }

    const ref = window.collection(window.firebaseDB, "direcciones", user.uid, "items");
    const docRef = await window.addDoc(ref, direccion);

    mostrarMensaje(" Dirección guardada correctamente.", "success");

    // Limpiar formularios
    const paso1 = document.getElementById('paso-1-direccion');
    paso3.classList.remove('visible');
    cambiarFormulario(paso3, paso1);

    document.querySelectorAll('.formulario-paso').forEach(f => f.reset());
    document.getElementById("comuna").innerHTML = '<option value="">Seleccione una comuna</option>';
    document.getElementById("comuna").disabled = true;

    if (typeof cargarDirecciones === "function") cargarDirecciones();

    // 🟢 Seleccionar automáticamente la nueva dirección
    if (typeof seleccionarDireccion === "function") {
      // Esperamos un poco a que se cargue en la tabla
      setTimeout(() => {
        seleccionarDireccion(docRef.id);
      }, 500);
    }

  } catch (error) {
    mostrarMensaje("Error al guardar la dirección. Intenta nuevamente.", "error");
  }
};



// ---------- Exponer funciones ----------
window.mostrarPaso = mostrarPaso;
window.cambiarFormulario = cambiarFormulario;











  const btnAgregar = document.getElementById("btn-agregar-direccion");
  const btnTabla = document.getElementById("btn-tabla-direcciones");
  const modalDirecciones = document.getElementById("modal-direcciones");
  const cerrarModalBtn = document.getElementById("cerrar-modal-direcciones");

  btnTabla?.addEventListener("click", () => {
    modalDirecciones.style.display = "block";
    btnAgregar.classList.remove("active");
    btnTabla.classList.add("active");

    if (typeof window.cargarDirecciones === "function") {
      window.cargarDirecciones();
    }
  });

  cerrarModalBtn?.addEventListener("click", () => {
    modalDirecciones.style.display = "none";
    btnTabla.classList.remove("active");
    btnAgregar.classList.add("active");
  });

  window.addEventListener("click", (event) => {
    if (event.target === modalDirecciones) {
      modalDirecciones.style.display = "none";
      btnTabla.classList.remove("active");
      btnAgregar.classList.add("active");
    }
  });





window.guardarSeleccionDireccion = async function (direccionId) {
  const user = window.firebaseAuth?.currentUser;
  if (!user || !direccionId) return;

  // Asegurar funciones
  if (!window.doc || !window.setDoc) {
    const firestore = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    window.doc = firestore.doc;
    window.setDoc = firestore.setDoc;
  }

  try {
    const ref = window.doc(window.firebaseDB, "direccionesSeleccionadas", user.uid);
    await window.setDoc(ref, { direccionId: direccionId }, { merge: true });
    console.log("Dirección seleccionada guardada en Firestore.");
  } catch (error) {
    console.error("❌ Error al guardar la dirección seleccionada:", error);
  }
};





window.mostrarLoader = function () {
  const loader = document.getElementById("pantalla-carga");
  if (loader) {
    loader.style.display = "flex"; // Asegura que esté visible
    requestAnimationFrame(() => {
      loader.classList.remove("desaparecer");
      loader.style.opacity = "1";
      loader.style.visibility = "visible";
    });
  }
};

window.ocultarLoader = function () {
  const loader = document.getElementById("pantalla-carga");
  if (loader) {
    loader.classList.add("desaparecer");

    // Esperamos a que termine la transición antes de ocultarlo completamente
    setTimeout(() => {
      loader.style.display = "none";
    }, 400); // Debe coincidir con tu transition: 0.4s
  }
};







// =======================
// Selección y carga de direcciones optimizada
// =======================

async function asegurarFirestore() {
  if (!window.doc || !window.getDoc || !window.setDoc || !window.collection || !window.getDocs) {
    const firestore = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");
    window.doc = firestore.doc;
    window.getDoc = firestore.getDoc;
    window.setDoc = firestore.setDoc;
    window.collection = firestore.collection;
    window.getDocs = firestore.getDocs;
  }
}

window.guardarSeleccionDireccion = async function (direccionId) {
  const user = window.firebaseAuth?.currentUser;
  if (!user || !direccionId) return;
  await asegurarFirestore();
  try {
    const ref = window.doc(window.firebaseDB, "direccionesSeleccionadas", user.uid);
    await window.setDoc(ref, { direccionId: direccionId }, { merge: true });
    console.log("✅ Dirección seleccionada guardada en Firestore.");
  } catch (error) {
    console.error("❌ Error al guardar la dirección seleccionada:", error);
  }
};

window.seleccionarDireccion = async function (id, boton = null) {
  const user = window.firebaseAuth?.currentUser;
  if (!user || !id) return;

  await asegurarFirestore();

  try {
    // 🔄 Obtener datos de la dirección seleccionada
    const refDireccion = window.doc(window.firebaseDB, "direcciones", user.uid, "items", id);
    const snap = await window.getDoc(refDireccion);
    if (!snap.exists()) {
      console.warn("⚠️ La dirección seleccionada no existe.");
      return;
    }

    const direccion = snap.data();
    window.direccionSeleccionada = direccion;

    // ✅ Guardar selección en Firestore
    const refSeleccion = window.doc(window.firebaseDB, "direccionesSeleccionadas", user.uid);
    await window.setDoc(refSeleccion, { direccionId: id }, { merge: true });

    // ✅ Guardar también en localStorage
    localStorage.setItem("direccionSeleccionada", id);

    // ✅ Aplicar clase visual de inmediato
    document.querySelectorAll(".contenedor-pedido-grid-seleccionado").forEach(div => {
      div.classList.remove("contenedor-pedido-grid-seleccionado");
      div.classList.add("contenedor-pedido-grid");
    });

    const contenedor = boton?.closest(".contenedor-pedido-grid");
    if (contenedor) {
      contenedor.classList.remove("contenedor-pedido-grid");
      contenedor.classList.add("contenedor-pedido-grid-seleccionado");

      const contenedorFecha = contenedor.querySelector(".fila-inferior > div:first-child");
      if (contenedorFecha) {
        const fecha = formatearFecha(direccion.fechaGuardado);
        contenedorFecha.innerHTML = `<strong>Guardado:</strong> ${fecha}<br><strong>Dirección seleccionada</strong>`;
      }
    }

    // ✅ Recargar tabla completa desde Firestore
    if (typeof window.cargarDirecciones === "function") {
      await window.cargarDirecciones();
    } else {
      console.warn("⚠️ window.cargarDirecciones no está definida");
    }

  } catch (error) {
    console.error("❌ Error al seleccionar dirección:", error);
    mostrarMensaje("❌ Hubo un error al seleccionar la dirección.", "error");
  }
};







window.seleccionarDireccion = async function (id, boton = null) {
  const user = window.firebaseAuth?.currentUser;
  if (!user || !id) return;

  await asegurarFirestore();

  try {
    // 🔄 Obtener datos de la dirección seleccionada (opcional)
    const refDireccion = window.doc(window.firebaseDB, "direcciones", user.uid, "items", id);
    const snap = await window.getDoc(refDireccion);
    if (!snap.exists()) {
      console.warn("⚠️ La dirección seleccionada no existe.");
      return;
    }

    const direccion = snap.data();
    window.direccionSeleccionada = direccion;

    // ✅ Guardar la dirección seleccionada en Firestore
    const refSeleccion = window.doc(window.firebaseDB, "direccionesSeleccionadas", user.uid);
    await window.setDoc(refSeleccion, { direccionId: id }, { merge: true });

    // ✅ Guardar también en localStorage (opcional)
    localStorage.setItem("direccionSeleccionada", id);

    // ✅ Refrescar visualmente solo la tabla
    if (typeof window.cargarDirecciones === "function") {
      await window.cargarDirecciones();
    } else {
      console.warn("⚠️ La función cargarDirecciones no está definida.");
    }

  } catch (error) {
    console.error("❌ Error al seleccionar dirección:", error);
  }
};

async function cargarDireccionSeleccionada(uid) {
  await asegurarFirestore();

  const idGuardado = localStorage.getItem("direccionSeleccionada");
  if (idGuardado) {
    console.log("📦 Recuperando dirección seleccionada desde localStorage:", idGuardado);
    await window.seleccionarDireccion(idGuardado);
    return;
  }

  try {
    const colRef = window.collection(window.firebaseDB, "direcciones", uid, "items");
    const snap = await window.getDocs(colRef);

    if (snap.size === 1) {
      const unica = snap.docs[0];
      const id = unica.id;
      console.log("📦 Solo hay una dirección, se usará por defecto:", id);
      localStorage.setItem("direccionSeleccionada", id);
      await window.seleccionarDireccion(id);
    } else {
      console.log("ℹ️ Usuario tiene varias direcciones. No se seleccionó ninguna automáticamente.");
    }
  } catch (e) {
    console.error("❌ Error al cargar direcciones desde Firestore:", e);
  }
}

// ✅ Mostrar dirección seleccionada en el paso de checkout
window.mostrarDireccionSeleccionadaCliente = async function () {
  const contenedor = document.getElementById("lista-ultimas-direcciones");
  if (!contenedor) return;

  const div = document.createElement("div");
  div.classList.add("direccion-guardada");

  const info = document.createElement("div");
  info.classList.add("direccion-info");
  info.innerHTML = `<p class="texto">⏳ Cargando dirección...</p>`;

  div.appendChild(info);
  contenedor.innerHTML = "";
  contenedor.appendChild(div);

  const user = window.firebaseAuth?.currentUser;
  const direccionId = localStorage.getItem("direccionSeleccionada");

  if (!user) {
    info.innerHTML = "<p class='texto'>⚠️ Debes iniciar sesión para ver tus direcciones.</p>";
    return;
  }

  if (!direccionId) {
    info.innerHTML = "<p class='texto'>⚠️ No tienes una dirección seleccionada.</p>";
    return;
  }

  await asegurarFirestore();

  try {
    const ref = window.doc(window.firebaseDB, "direcciones", user.uid, "items", direccionId);
    const snapshot = await window.getDoc(ref);

    if (!snapshot.exists()) {
      info.innerHTML = "<p class='texto'>⚠️ No se encontró la dirección seleccionada.</p>";
      return;
    }

    const datos = snapshot.data();

    info.innerHTML = `
      <p class="nombre">👤 <strong>${datos.nombre}</strong></p>
      <p class="texto">📍 ${datos.calleNumero}${datos.departamento ? ', ' + datos.departamento : ''}</p>
      <p class="texto">🏙️ ${datos.comuna}, ${datos.region}</p>
      <p class="texto">📞 ${datos.telefono}</p>
      <p class="texto">📧 ${datos.correo}</p>
    `;

  } catch (error) {
    console.error("❌ Error al mostrar dirección seleccionada:", error);
    info.innerHTML = "<p class='texto'>⚠️ Error al cargar la dirección seleccionada.</p>";
  }
};




function iniciarSesionCliente() {
  if (
    typeof window.onFirebaseAuthStateChanged === "function" &&
    typeof window.firebaseAuth !== "undefined"
  ) {
    window.onFirebaseAuthStateChanged(async (user) => {
      if (!user) {
        console.log("⚠️ Usuario no autenticado");
        return;
      }
      await cargarDireccionSeleccionada(user.uid);
      await window.mostrarDireccionSeleccionadaCliente(); // ✅ Aquí la llamada adicional
    });
  } else {
    setTimeout(iniciarSesionCliente, 100);
  }
}

iniciarSesionCliente();










  const btnPendientes = document.getElementById("btn-crear");
  const btnHistorial = document.getElementById("btn-tabla");
  const modalPendientes = document.getElementById("modal-pendientes");
  const modalHistorial = document.getElementById("modal-historial");

  function cambiarDeModal(destino) {
    if (destino === "pendientes") {
      cambiarFormulario(modalHistorial, modalPendientes);
      btnPendientes.classList.add("active");
      btnHistorial.classList.remove("active");
    } else {
      cambiarFormulario(modalPendientes, modalHistorial);
      btnHistorial.classList.add("active");
      btnPendientes.classList.remove("active");
    }
  }

  if (btnPendientes && btnHistorial) {
    btnPendientes.addEventListener("click", () => cambiarDeModal("pendientes"));
    btnHistorial.addEventListener("click", () => cambiarDeModal("historial"));
  }



function cambiarDeModal(destino) {
  if (destino === "pendientes") {
    cambiarFormulario(modalHistorial, modalPendientes);
    btnPendientes.classList.add("active");
    btnHistorial.classList.remove("active");
  } else {
    cambiarFormulario(modalPendientes, modalHistorial);
    cargarHistorialTransferencias(); // ← Carga tabla al abrir historial
    btnHistorial.classList.add("active");
    btnPendientes.classList.remove("active");
  }
}


















});