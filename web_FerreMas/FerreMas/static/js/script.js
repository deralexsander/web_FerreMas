// --------------------------
// SCRIPT GENERAL DE LA PÁGINA
// --------------------------

window.addEventListener('DOMContentLoaded', async () => {
  // Inicializa íconos Lucide
  lucide.createIcons();

  // Animación de íconos rotatorios
  const iconos = document.querySelectorAll('.icono');
  let actual = 0;
  function mostrarSiguienteIcono() {
    if (!iconos.length) return;
    iconos.forEach(i => i.classList.remove('mostrar'));
    iconos[actual].classList.add('mostrar');
    actual = (actual + 1) % iconos.length;
  }
  setTimeout(() => {
    mostrarSiguienteIcono();
    setInterval(mostrarSiguienteIcono, 1200);
  }, 3500);

  // Efecto de blur al hacer scroll
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

  // Cambio entre formularios (login / registro / recuperar / trabajador)
  const centrarLogin = document.querySelector('.centrar-login-cliente');
  const centrarRegistro = document.querySelector('.centrar-registro-cliente');
  const centrarRecuperar = document.querySelector('.centrar-recuperar');
  const centrarTrabajador = document.querySelector('.centrar-login-trabajador');

  const linkRegistro = document.querySelector('.centrar-login-cliente .span:not(.ir-recuperar):not(.ir-trabajador)');
  const linkRecuperar = document.querySelector('.ir-recuperar');
  const linkIrRegistroDesdeRecuperar = document.querySelector('.centrar-recuperar .ir-registro');
  const linkLoginTodos = document.querySelectorAll('.volver-login');
  const linkIrTrabajador = document.querySelector('.ir-trabajador');

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

  function cambiarFormulario(formularioActual, formularioDestino) {
    formularioActual.classList.remove('visible');
    formularioActual.classList.add('animacion-salida');
    setTimeout(() => {
      formularioActual.classList.remove('animacion-salida');
      formularioActual.classList.add('oculto');
      formularioDestino.classList.remove('oculto');
      formularioDestino.classList.add('visible', 'animacion-entrada');
      setTimeout(() => formularioDestino.classList.remove('animacion-entrada'), 400);
    }, 400);
  }
























  

});