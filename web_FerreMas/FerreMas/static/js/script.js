window.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();

  const iconos = document.querySelectorAll('.icono');
  let actual = 0;

  function mostrarSiguienteIcono() {
    iconos.forEach(i => i.classList.remove('mostrar'));
    iconos[actual].classList.add('mostrar');
    actual = (actual + 1) % iconos.length;
  }

  // Espera 3.7s antes de comenzar (sincronizado con animaciones previas)
  setTimeout(() => {
    mostrarSiguienteIcono(); // muestra el primero
    setInterval(mostrarSiguienteIcono, 1200); // cambia cada 1.2s
  }, 3500);
});


window.addEventListener('scroll', () => {
  const scrollY = window.scrollY;
  const maxBlur = 30;
  const blur = Math.min(scrollY / 10, maxBlur);

  const blurBox = document.querySelector('.cuadro-blur');
  blurBox.style.backdropFilter = `blur(${blur}px)`;
  blurBox.style.webkitBackdropFilter = `blur(${blur}px)`;
});



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
    formularioActual.classList.add('animacion-salida');

    setTimeout(() => {
      formularioActual.classList.add('oculto');
      formularioActual.classList.remove('animacion-salida');

      formularioDestino.classList.remove('oculto');
      formularioDestino.classList.add('visible', 'animacion-entrada');

      setTimeout(() => {
        formularioDestino.classList.remove('animacion-entrada');
      }, 400);
    }, 400);
  }
});