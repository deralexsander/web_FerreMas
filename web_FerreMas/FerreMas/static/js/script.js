// Espera a que todo el DOM esté cargado
window.addEventListener('DOMContentLoaded', () => {
  // Activar los íconos Lucide después de cargar el DOM
  lucide.createIcons();

  // Animación cíclica de íconos
  const iconos = document.querySelectorAll('.icono');
  let actual = 0;

  function mostrarSiguienteIcono() {
    iconos.forEach(i => i.classList.remove('mostrar'));
    iconos[actual].classList.add('mostrar');
    actual = (actual + 1) % iconos.length;
  }

  // Espera 3.5 segundos (sincronizado con animaciones previas), luego inicia
  setTimeout(() => {
    mostrarSiguienteIcono(); // Muestra el primero
    setInterval(mostrarSiguienteIcono, 1200); // Cambia cada 1.2s
  }, 3500);
});

// Desenfoque dinámico al hacer scroll (efecto blur en .cuadro-blur)
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

// Lógica de cambio de formularios (login, registro, recuperar)
document.addEventListener("DOMContentLoaded", function () {
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
    // Paso 1: salir del formulario actual con animación
    formularioActual.classList.remove('visible');
    formularioActual.classList.add('animacion-salida');
  
    // Paso 2: esperar a que termine la animación de salida
    setTimeout(() => {
      formularioActual.classList.remove('animacion-salida');
      formularioActual.classList.add('oculto');
  
      // Paso 3: mostrar formulario destino
      formularioDestino.classList.remove('oculto');
      formularioDestino.classList.add('visible', 'animacion-entrada');
  
      // Paso 4: limpiar animación entrada tras su duración
      setTimeout(() => {
        formularioDestino.classList.remove('animacion-entrada');
      }, 400);
    }, 400);
  }  
});
