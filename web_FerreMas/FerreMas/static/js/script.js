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

  const categoriaInput = document.querySelector('select[name="categoria"]');

  const campos = {
    potencia: document.querySelector('input[name="potencia"]'),
    voltaje: document.querySelector('input[name="voltaje"]'),
    color: document.querySelector('input[name="color"]'),
    vencimiento: document.querySelector('input[name="vencimiento"]')
  };

  const desactivarTodos = () => {
    for (let campo in campos) {
      campos[campo].disabled = true;
      campos[campo].value = "";
    }
  };

  const manejarCategoria = () => {
    const cat = categoriaInput ? categoriaInput.value : null;
    if (!cat) return;
    desactivarTodos();

    if (cat === "herramientas_electricas") {
      campos.potencia.disabled = false;
      campos.voltaje.disabled = false;
    } else if (cat === "materiales_electricos") {
      campos.voltaje.disabled = false;
    } else if (cat === "pinturas") {
      campos.vencimiento.disabled = false;
    }
  };

  if (categoriaInput) {
    categoriaInput.addEventListener("change", manejarCategoria);
    manejarCategoria();
  }

  // Mostrar/ocultar formulario de transferencia y secciones de pago
  const btnTransferencia = document.getElementById("btn-mostrar-transferencia");
  const formTransferencia = document.getElementById("formulario-transferencia");
  const btnPagar = document.getElementById("btn-pagar");
  const seccionMetodosPago = btnPagar?.closest(".form");

  const volverMetodoPago = document.createElement("button");
  volverMetodoPago.textContent = "⬅ Volver a métodos de pago";
  volverMetodoPago.className = "btn";
  volverMetodoPago.type = "button";

  if (formTransferencia) {
    formTransferencia.appendChild(volverMetodoPago);
  }

  if (btnTransferencia && formTransferencia && seccionMetodosPago) {
    btnTransferencia.addEventListener("click", (e) => {
      e.preventDefault();
      seccionMetodosPago.classList.add("oculto");
      formTransferencia.classList.remove("oculto");
    });

    volverMetodoPago.addEventListener("click", () => {
      formTransferencia.classList.add("oculto");
      seccionMetodosPago.classList.remove("oculto");
    });
  }

  if (btnPagar && formTransferencia && seccionMetodosPago) {
    btnPagar.addEventListener("click", (e) => {
      e.preventDefault();
      formTransferencia.classList.add("oculto");
      seccionMetodosPago.classList.remove("oculto");
    });
  }

  const inputCantidad = document.getElementById("cantidad");
  const btnAumentar = document.querySelector(".btn-aumentar");
  const btnDisminuir = document.querySelector(".btn-disminuir");

  if (inputCantidad && btnAumentar && btnDisminuir) {
    btnAumentar.addEventListener("click", () => {
      inputCantidad.value = parseInt(inputCantidad.value) + 1;
    });

    btnDisminuir.addEventListener("click", () => {
      const actual = parseInt(inputCantidad.value);
      if (actual > 1) {
        inputCantidad.value = actual - 1;
      }
    });
  }
});
