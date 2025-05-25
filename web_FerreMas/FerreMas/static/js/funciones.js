//---------------------------------
//
// Variables globales
//
//---------------------------------
let centrarLogin;
let mostrarMensaje;

window.addEventListener('DOMContentLoaded', async () => {

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
  // Función de animación unificada
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
  // funcion de validación de formularios
  //
  //---------------------------------
  const formularioLogin = centrarLogin?.querySelector('form');

  if (formularioLogin) {
    formularioLogin.addEventListener('submit', (e) => {
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

      console.log("Formulario válido. Puedes continuar con la autenticación...");
    });
  }

  //---------------------------------
  //
  // Validación del formulario de registro
  //
  //---------------------------------
  const formularioRegistro = document.querySelector('.centrar-registro-cliente form');
  if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', (e) => {
      e.preventDefault();

      const inputs = formularioRegistro.querySelectorAll('.input');
      const email = inputs[0]?.value.trim();
      const usuario = inputs[1]?.value.trim();
      const password = inputs[2]?.value.trim();
      const confirmPassword = inputs[3]?.value.trim();

      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) return mostrarMensaje("Por favor ingresa tu correo.");
      if (!regexCorreo.test(email)) return mostrarMensaje("El correo ingresado no es válido.");
      if (!usuario) return mostrarMensaje("Por favor ingresa tu nombre de usuario.");
      if (!password) return mostrarMensaje("Por favor ingresa tu contraseña.");
      if (!confirmPassword) return mostrarMensaje("Confirma tu contraseña.");
      if (password !== confirmPassword) return mostrarMensaje("Las contraseñas no coinciden.");

      console.log("Registro válido. Aquí puedes continuar con tu lógica.");
    });
  }

  //---------------------------------
  //
  // Validación del formulario de recuperación de contraseña
  //
  //---------------------------------
  const formularioRecuperar = document.querySelector('.centrar-recuperar form');
  if (formularioRecuperar) {
    formularioRecuperar.addEventListener('submit', (e) => {
      e.preventDefault();

      const email = formularioRecuperar.querySelector('.input')?.value.trim();
      const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!email) return mostrarMensaje("Por favor ingresa tu correo.");
      if (!regexCorreo.test(email)) return mostrarMensaje("El correo ingresado no es válido.");

      console.log("Correo válido. Aquí puedes enviar la solicitud de recuperación.");
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

});
