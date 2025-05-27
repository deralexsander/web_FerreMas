//---------------------------------
//
// Variables globales
//
//---------------------------------
let centrarLogin;
let mostrarMensaje;
let correoTrabajadorActual = "";
let passwordTrabajadorActual = "";

window.addEventListener('DOMContentLoaded', async () => {
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

  //---------------------------------
  //
  // Botón pagar vacío, listo para futura implementación
  //
  //---------------------------------
if (btnPagar) {
  btnPagar.addEventListener("click", (e) => {
    e.preventDefault();

    // Validar que hay productos
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) {
      mostrarMensaje("Tu carrito está vacío. Debes agregar productos antes de pagar.");
      return;
    }

    // Validar tipo de entrega
    const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value;
    const region = document.getElementById("region-sucursal")?.value;
    const comuna = document.getElementById("comuna-sucursal")?.value;

    if (tipoEntrega === "tienda") {
      if (!region) {
        mostrarMensaje("Debes seleccionar una región para el retiro en tienda.");
        return;
      }
      if (!comuna) {
        mostrarMensaje("Debes seleccionar una comuna para el retiro en tienda.");
        return;
      }
    }

    console.log("Todo válido. Aquí puedes continuar con el flujo de pago con tarjeta.");
    mostrarMensaje("Todo OK, simulando redirección a WebPay..."); // opcional
  });
}


  //---------------------------------
  //
  // Mensajes
  //
  //---------------------------------
  mostrarMensaje = function(texto, tipo = 'error') {
    const contenedor = document.getElementById('contenedor-mensaje');
    const mensajeTexto = document.getElementById('mensaje-texto');

    if (contenedor && mensajeTexto) {
      mensajeTexto.textContent = texto;

      // Asegura visibilidad y aplica animación de entrada
      contenedor.style.display = 'block';
      contenedor.classList.remove('animacion-salida', 'oculto');
      contenedor.classList.add('animacion-entrada');

      // Después de 4s inicia la salida
      setTimeout(() => {
        contenedor.classList.remove('animacion-entrada');
        contenedor.classList.add('animacion-salida');

        // Luego de 0.4s oculta completamente
        setTimeout(() => {
          contenedor.classList.remove('animacion-salida');
          contenedor.classList.add('oculto');
          contenedor.style.display = 'none';
        }, 400); // duración de popOut
      }, 4000);
    } else {
      alert(texto);
    }
  };

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
        mostrarMensaje("Por favor ingresa tu correo.");
        return;
      }

      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!regexCorreo.test(email)) {
        mostrarMensaje("El correo ingresado no es válido.");
        return;
      }

      if (!password) {
        mostrarMensaje("Por favor ingresa tu contraseña.");
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
          mostrarMensaje("Demasiados intentos fallidos, Intenta más tarde.");
        } else {
          mostrarMensaje("Correo o contraseña son incorrectos.");
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
        mostrarMensaje("Por favor ingresa tu correo.");
        return;
      }

      if (!regexCorreo.test(email)) {
        mostrarMensaje("El correo ingresado no es válido.");
        return;
      }

      if (!usuario) {
        mostrarMensaje("Por favor ingresa tu nombre de usuario.");
        return;
      }

      if (!password) {
        mostrarMensaje("Por favor ingresa tu contraseña.");
        return;
      }

      if (!confirmPassword) {
        mostrarMensaje("Confirma tu contraseña.");
        return;
      }

      if (password !== confirmPassword) {
        mostrarMensaje("Las contraseñas no coinciden.");
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
          mostrarMensaje("Este correo ya está registrado.");
        } else if (error.code === "auth/weak-password") {
          mostrarMensaje("La contraseña debe tener al menos 6 caracteres.");
        } else {
          mostrarMensaje("Ocurrió un error al registrarte. Intenta nuevamente.");
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
        mostrarMensaje("Por favor ingresa tu correo.");
        return;
      }

      if (!regexCorreo.test(email)) {
        mostrarMensaje("El correo ingresado no es válido.");
        return;
      }

      try {
        // Verificar si existe una cuenta con este correo
        const { fetchSignInMethodsForEmail } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
        const methods = await fetchSignInMethodsForEmail(firebaseAuth, email);

        // Enviar correo de recuperación
        await sendPasswordResetEmail(firebaseAuth, email);
        mostrarMensaje("📬 Te hemos enviado un correo para restablecer tu contraseña.");
        formularioRecuperar.reset();
      } catch (error) {
        console.error("Error al procesar la recuperación:", error);

        if (error.code === "auth/too-many-requests") {
          mostrarMensaje("Demasiados intentos. Intenta más tarde.");
        } else {
          mostrarMensaje("Ocurrió un error. Intenta nuevamente.");
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
    formTransferencia.addEventListener("submit", (e) => {
      e.preventDefault();

      // 1. Validar productos en el carrito
      const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
      if (carrito.length === 0) {
        mostrarMensaje("Tu carrito está vacío. Debes agregar productos antes de pagar.");
        return;
      }

      // 2. Validar tipo de entrega
      const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value;
      const region = document.getElementById("region-sucursal")?.value;
      const comuna = document.getElementById("comuna-sucursal")?.value;

      if (tipoEntrega === "tienda") {
        if (!region) {
          mostrarMensaje("Debes seleccionar una región para el retiro en tienda.");
          return;
        }
        if (!comuna) {
          mostrarMensaje("Debes seleccionar una comuna para el retiro en tienda.");
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
        mostrarMensaje("Por favor ingresa el nombre del titular.");
        return;
      }
      if (!rut || !regexRut.test(rut)) {
        mostrarMensaje("El RUT ingresado no es válido. Ej: 12345678-9");
        return;
      }
      if (!banco) {
        mostrarMensaje("Debes seleccionar un banco.");
        return;
      }
      if (!acepta) {
        mostrarMensaje("Debes aceptar que el pago será validado manualmente.");
        return;
      }

      console.log("Todo válido, puedes enviar el formulario o guardar los datos.");
      // Aquí puedes continuar con la lógica de guardado en Firestore, envío, etc.
    });
  }

  //---------------------------------
  //
  // Funcion para desloguear con el botón de logout
  //
  //---------------------------------

    const botonLogout = document.getElementById('boton-logout');
  if (botonLogout) {
    botonLogout.addEventListener('click', async () => {
      try {
        await window.firebaseAuth.signOut();
        // Redirige al usuario a la página de inicio o login
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
        mostrarMensaje('Correo y contraseña copiados al portapapeles');
      });
    } else {
      // Fallback para navegadores antiguos
      const tempInput = document.createElement("input");
      tempInput.value = texto;
      document.body.appendChild(tempInput);
      tempInput.select();
      document.execCommand("copy");
      document.body.removeChild(tempInput);
      mostrarMensaje('Correo y contraseña copiados al portapapeles');
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

    async function validarFormulario(form, index) {
      let valido = true;

      if (index === 0) {
        const nombre = form.querySelector('#nombre-trabajador');
        const apellidoP = form.querySelector('#apellido-paterno-trabajador');
        const apellidoM = form.querySelector('#apellido-materno-trabajador');
        if (!nombre.value.trim()) {
          mostrarMensaje("Por favor ingresa el nombre del trabajador.");
          valido = false;
        } else if (!apellidoP.value.trim()) {
          mostrarMensaje("Por favor ingresa el apellido paterno.");
          valido = false;
        } else if (!apellidoM.value.trim()) {
          mostrarMensaje("Por favor ingresa el apellido materno.");
          valido = false;
        }
      } else if (index === 1) {
        const correo = form.querySelector('#correo-trabajador');
        const rut = form.querySelector('#rut-trabajador');
        const rol = form.querySelector('#rol-trabajador');
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const regexRut = /^\d{7,8}-[\dkK]$/;
        if (!correo.value.trim()) {
          mostrarMensaje("Por favor ingresa el correo del trabajador.");
          valido = false;
        } else if (!regexCorreo.test(correo.value.trim())) {
          mostrarMensaje("El correo ingresado no es válido.");
          valido = false;
        } else if (!rut.value.trim()) {
          mostrarMensaje("Por favor ingresa el RUT del trabajador.");
          valido = false;
        } else if (!regexRut.test(rut.value.trim())) {
          mostrarMensaje("El RUT ingresado no es válido. Ej: 12345678-9");
          valido = false;
        } else if (!rol.value) {
          mostrarMensaje("Debes seleccionar un rol para el trabajador.");
          valido = false;
        }
      }

      return valido;
    }


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

  // Si estamos en la página de registro
  if (path === "/registro_personal/") {
    contenedor.classList.add("pop-out");

    // Marcamos que debe ejecutarse pop-in en la siguiente vista
    localStorage.setItem("animar_popin", "true");

  } else {
    // Verificamos si se debe ejecutar pop-in
    const debeAnimarPopIn = localStorage.getItem("animar_popin") === "true";

    if (debeAnimarPopIn) {
      contenedor.style.opacity = 0;
      contenedor.classList.add("pop-in");

      // Evita que se repita
      localStorage.removeItem("animar_popin");

      setTimeout(() => {
        contenedor.style.opacity = "";
      }, 3500); // Duración de la animación
    }
  }
}






});
