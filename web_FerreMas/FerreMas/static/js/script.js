// Espera a que todo el DOM esté cargado
window.addEventListener('DOMContentLoaded', async () => {
  lucide.createIcons();

  const iconos = document.querySelectorAll('.icono');
  let actual = 0;

  function mostrarSiguienteIcono() {
    iconos.forEach(i => i.classList.remove('mostrar'));
    iconos[actual].classList.add('mostrar');
    actual = (actual + 1) % iconos.length;
  }

  setTimeout(() => {
    mostrarSiguienteIcono();
    setInterval(mostrarSiguienteIcono, 1200);
  }, 3500);

  window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxBlur = 30;
    const blur = Math.min(scrollY / 10, maxBlur);

    const blurBox = document.querySelector('.cuadro-blur');
    if (blurBox) {
      blurBox.style.backdropFilter = `blur(${blur}px)`;
      blurBox.style.webkitBackdropFilter = `blur(${blur}px)`;
    }
  });

  const centrarLogin = document.querySelector('.centrar-login');
  const centrarRegistro = document.querySelector('.centrar-registro');
  const centrarRecuperar = document.querySelector('.centrar-recuperar');

  const linkRegistro = document.querySelector('.centrar-login .span:not(.ir-recuperar)');
  const linkRecuperar = document.querySelector('.ir-recuperar');
  const linkIrRegistroDesdeRecuperar = document.querySelector('.centrar-recuperar .ir-registro');
  const linkLoginTodos = document.querySelectorAll('.volver-login');

  if (linkRegistro) {
    linkRegistro.addEventListener('click', function () {
      cambiarFormulario(centrarLogin, centrarRegistro);
    });
  }

  if (linkRecuperar) {
    linkRecuperar.addEventListener('click', function () {
      cambiarFormulario(centrarLogin, centrarRecuperar);
    });
  }

  if (linkIrRegistroDesdeRecuperar) {
    linkIrRegistroDesdeRecuperar.addEventListener('click', function () {
      cambiarFormulario(centrarRecuperar, centrarRegistro);
    });
  }

  if (linkLoginTodos.length > 0) {
    linkLoginTodos.forEach(btn => {
      btn.addEventListener('click', function () {
        const actual = this.closest('.centrar-registro') || this.closest('.centrar-recuperar');
        cambiarFormulario(actual, centrarLogin);
      });
    });
  }

  function cambiarFormulario(formularioActual, formularioDestino) {
    formularioActual.classList.remove('visible');
    formularioActual.classList.add('animacion-salida');
    setTimeout(() => {
      formularioActual.classList.remove('animacion-salida');
      formularioActual.classList.add('oculto');
      formularioDestino.classList.remove('oculto');
      formularioDestino.classList.add('visible', 'animacion-entrada');
      setTimeout(() => {
        formularioDestino.classList.remove('animacion-entrada');
      }, 400);
    }, 400);
  }


  // ===================🔥 MENSAJES ===================

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


  // ===================🔥 FIREBASE CONFIGURACIÓN Y AUTENTICACIÓN ===================

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js");
  const { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, updateProfile } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");

  const firebaseConfig = {
    apiKey: "AIzaSyCOsIJF-ywgaQPqT5ApyodIcRRBCiU-mtI",
    authDomain: "ferremas-1a2c4.firebaseapp.com",
    projectId: "ferremas-1a2c4",
    storageBucket: "ferremas-1a2c4.firebasestorage.app",
    messagingSenderId: "427152375883",
    appId: "1:427152375883:web:f3dc467e589520bbf44dce"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth();

  const pathActual = window.location.pathname;

  // 🔥 Detectar usuario logueado en todas las páginas
  onAuthStateChanged(auth, (user) => {
    const botonAccesoLink = document.querySelector('a[href="/acceso/"]');

    if (botonAccesoLink) {
      if (user) {
        botonAccesoLink.setAttribute('href', '/perfil/');
      } else {
        botonAccesoLink.setAttribute('href', '/acceso/');
      }
    }

    if (user && pathActual === '/acceso/') {
      window.location.href = '/perfil/';
    }

    if (!user && pathActual === '/perfil/') {
      window.location.href = '/acceso/';
    }

    if (document.getElementById('nombre-usuario') && document.getElementById('correo-usuario') && document.getElementById('foto-usuario')) {
      if (user) {
        const nombre = user.displayName || "Sin nombre";
        const correo = user.email;
        const fotoURL = user.photoURL || "https://via.placeholder.com/100";

        document.getElementById('nombre-usuario').textContent = nombre;
        document.getElementById('correo-usuario').textContent = correo;
        document.getElementById('foto-usuario').src = fotoURL;
      } else {
        window.location.href = "/acceso/";
      }
    }
  });

  // 🔥 Botón de logout
  const botonLogout = document.getElementById('boton-logout');
  if (botonLogout) {
    botonLogout.addEventListener('click', async () => {
      try {
        await signOut(auth);
        alert('Has cerrado sesión correctamente.');
        window.location.href = '/acceso/';
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error al intentar cerrar sesión.');
      }
    });
  }

// ===================🔥 REGISTRO MANUAL (email, nombre de usuario y contraseña) ===================

const formularioRegistro = document.querySelector('.centrar-registro .form');

formularioRegistro.addEventListener('submit', async (e) => {
  e.preventDefault();

  const inputs = formularioRegistro.querySelectorAll('.input');
  const email = inputs[0].value.trim();
  const username = inputs[1].value.trim();
  const password = inputs[2].value;
  const confirmPassword = inputs[3].value;

  if (!email || !username || !password || !confirmPassword) {
    mostrarMensaje('Por favor, completa todos los campos.');
    return;
  }

  if (password !== confirmPassword) {
    mostrarMensaje('Las contraseñas no coinciden');
    return;
  }

  try {
    const { updateProfile } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Usuario registrado:', user);

    // Actualizar el nombre de usuario (displayName)
    await updateProfile(user, {
      displayName: username
    });

    console.log('Nombre de usuario actualizado:', username);

    window.location.href = "/";
  } catch (error) {
    console.error(error);
    mostrarMensaje('Correo ya registrado en nuestro sistema.');
  }
});

  // ===================🔥 LOGIN MANUAL ===================

const formularioLogin = document.querySelector('.centrar-login .form');

formularioLogin.addEventListener('submit', async (e) => {
  e.preventDefault();

  const inputs = formularioLogin.querySelectorAll('.input');
  const email = inputs[0].value.trim();
  const password = inputs[1].value.trim();

  if (!email || !password) {
    mostrarMensaje('Por favor, completa ambos campos.');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Usuario inició sesión:', user);

    window.location.href = "/";
  } catch (error) {
    console.error(error);
    mostrarMensaje('usuario o contraseña incorrectos.');
  }
});

// ===================🔥 RECUPERAR CONTRASEÑA ===================

const formularioRecuperar = document.querySelector('.centrar-recuperar .form');
const botonRecuperar = formularioRecuperar.querySelector('.button-submit');

botonRecuperar.addEventListener('click', async (e) => {
  e.preventDefault();

  const inputCorreo = formularioRecuperar.querySelector('.input');
  const email = inputCorreo.value.trim();

  if (!email) {
    mostrarMensaje('Por favor, ingresa tu correo.');
    return;
  }

  try {
    const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");

    await sendPasswordResetEmail(auth, email);
    mostrarMensaje('Te hemos enviado un correo para restablecer tu contraseña.');

    // Opcional: limpiar el campo
    inputCorreo.value = '';

    // Opcional: volver al formulario de login
    const centrarRecuperar = document.querySelector('.centrar-recuperar');
    const centrarLogin = document.querySelector('.centrar-login');
    cambiarFormulario(centrarRecuperar, centrarLogin);

  } catch (error) {
    console.error(error);
    mostrarMensaje('Correo no registrado o error al enviar el correo.');
  }
});



});


