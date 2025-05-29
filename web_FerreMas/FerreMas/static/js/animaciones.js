window.addEventListener('DOMContentLoaded', async () => {

  lucide.createIcons();

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




    // animacion de blur al hacer scroll
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

  // hacer que el navbar aparesca solo una vez

  const boton = document.querySelector('.button-container'); // o navbar animado

  if (!boton) return;

  if (localStorage.getItem("activarAnimacionNavbar") === "true") {
    boton.classList.add("button-animada");
    localStorage.removeItem("activarAnimacionNavbar"); // evitar que se repita
  } else {
    boton.style.opacity = 1; // mostrar sin animación
  }


  //---------------------------------
  //
  // animacion de animación unificada
  //
  //---------------------------------
  function cambiarFormulario(formularioActual, formularioDestino) {
    if (!formularioActual || !formularioDestino) return;
    formularioActual.classList.remove('oculto', 'animacion-salida', 'animacion-entrada');
    void formularioActual.offsetWidth; // Forzar reflow
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

  // Hacer la función global para poder usarla en otros archivos JS
  window.cambiarFormulario = cambiarFormulario;









const modal = document.getElementById("modal-producto");
if (modal) {
  modal.classList.remove("activo");
  modal.classList.add("saliendo");

  setTimeout(() => {
    modal.classList.remove("saliendo");
    modal.style.display = "none";
  }, 1900); // 1.6s + 0.3s
}








});