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

  // ===================🔥 FIREBASE CONFIGURACIÓN Y AUTENTICACIÓN ===================

  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js");
  const { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");


  const firebaseConfig = {
    apiKey: "AIzaSyCAM_dosGr_VfJtMePggSQ0RZ2iDerHwWQ",
    authDomain: "ferremas-9ab69.firebaseapp.com",
    projectId: "ferremas-9ab69",
    storageBucket: "ferremas-9ab69.appspot.com",
    messagingSenderId: "647782254608",
    appId: "1:647782254608:web:8572f96398f846ccd6e295",
    measurementId: "G-LZLNBPKZC8"
  };

  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth();

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
    alert('Por favor, completa todos los campos.');
    return;
  }

  if (password !== confirmPassword) {
    alert('Las contraseñas no coinciden');
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
    alert('Error al registrarse: ' + error.message);
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
    alert('Por favor, completa ambos campos.');
    return;
  }

  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    console.log('Usuario inició sesión:', user);

    window.location.href = "/";
  } catch (error) {
    console.error(error);
    alert('Error al iniciar sesión: ' + error.message);
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
    alert('Por favor, ingresa tu correo.');
    return;
  }

  try {
    const { sendPasswordResetEmail } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");

    await sendPasswordResetEmail(auth, email);
    alert('Te hemos enviado un correo para restablecer tu contraseña.');

    // Opcional: limpiar el campo
    inputCorreo.value = '';

    // Opcional: volver al formulario de login
    const centrarRecuperar = document.querySelector('.centrar-recuperar');
    const centrarLogin = document.querySelector('.centrar-login');
    cambiarFormulario(centrarRecuperar, centrarLogin);

  } catch (error) {
    console.error(error);
    alert('Error al enviar correo de recuperación: ' + error.message);
  }
});


// ===================🔥 LOGIN Y REGISTRO CON GOOGLE ===================

// Importamos Firebase Auth dinámicamente cuando se necesite
const { GoogleAuthProvider, signInWithPopup } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");

// --- Botón de Registrar con Google ---
const botonesGoogleRegistro = document.querySelectorAll('.centrar-registro .btn.google');

botonesGoogleRegistro.forEach(boton => {
  boton.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Usuario registrado con Google:', user);

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert('Error al registrarse con Google: ' + error.message);
    }
  });
});

// --- Botón de Iniciar sesión con Google ---
const botonesGoogleLogin = document.querySelectorAll('.centrar-login .btn.google');

botonesGoogleLogin.forEach(boton => {
  boton.addEventListener('click', async (e) => {
    e.preventDefault();

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log('Usuario inició sesión con Google:', user);

      window.location.href = "/";
    } catch (error) {
      console.error(error);
      alert('Error al iniciar sesión con Google: ' + error.message);
    }
  });
});




});


