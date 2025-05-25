// --------------------------
// SCRIPT GENERAL DE LA PÁGINA
// --------------------------

window.addEventListener('DOMContentLoaded', async () => {







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



  
  // === Modal de producto: un solo input con id "cantidad" ===
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

  // === Carrito: múltiples controles por producto ===
  document.querySelectorAll(".btn-cantidad-mayor").forEach(btn => {
    btn.addEventListener("click", () => {
      const span = btn.parentElement.querySelector(".cantidad");
      let cantidad = parseInt(span.textContent);
      cantidad++;
      span.textContent = cantidad;
      // aquí puedes actualizar el localStorage o Firebase si quieres
    });
  });

  document.querySelectorAll(".btn-cantidad-menor").forEach(btn => {
    btn.addEventListener("click", () => {
      const span = btn.parentElement.querySelector(".cantidad");
      let cantidad = parseInt(span.textContent);
      if (cantidad > 1) {
        cantidad--;
        span.textContent = cantidad;
        // actualizar también si es necesario
      }
    });
  });


});
