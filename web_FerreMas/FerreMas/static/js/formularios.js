window.addEventListener('DOMContentLoaded', async () => {
    const formularioLogin = centrarLogin?.querySelector('form');

    if (formularioLogin) {
        formularioLogin.addEventListener('submit', async (e) => {
            e.preventDefault();

            const inputs = formularioLogin.querySelectorAll('.input');
            const email = inputs[0]?.value.trim();
            const password = inputs[1]?.value.trim();

            const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            try {
                const userCredential = await window.firebaseSignIn(window.firebaseAuth, email, password);
                // const user = userCredential.user;
                // No mostrar mensajes
                window.location.href = "/perfil/"; // Cambia esta URL según tu ruta real
            } catch (error) {
                // No mostrar mensajes
            }
        });
    }



    const formularioRegistro = document.querySelector('.centrar-registro-cliente form');

    if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (e) => {
        e.preventDefault();

        const datos = validarFormularioRegistro(formularioRegistro);
        if (!datos) return;

        const { email, usuario, password } = datos;

        try {
        const userCredential = await createUserWithEmailAndPassword(firebaseAuth, email, password);
        const user = userCredential.user;

        await updateProfile(user, { displayName: usuario });

        console.log("Registro exitoso:", user);
        window.location.href = "/perfil/";
        } catch (error) {
        console.error("Error al registrar:", error);
        // No se muestra mensaje visual al usuario
        }
    });
    }


    const formularioRecuperar = document.querySelector('.centrar-recuperar form');

    if (formularioRecuperar) {
    formularioRecuperar.addEventListener('submit', async (e) => {
        e.preventDefault();

        const input = formularioRecuperar.querySelector('.input');
        const email = input?.value.trim();
        const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!email) return;
        if (!regexCorreo.test(email)) return;

        try {
        await sendPasswordResetEmail(firebaseAuth, email);
        input.value = "";
        } catch (error) {
        console.error("Error al enviar correo de recuperación:", error);
        }
    });
    }



window.crearTrabajador = async function () {
  let adminActual, adminEmail, adminPassword;

  try {
    const correo = document.getElementById("correo-trabajador").value.trim().toLowerCase();
    const nombre = document.getElementById("nombre-trabajador").value.trim();
    const apellidoPaterno = document.getElementById("apellido-paterno-trabajador").value.trim();
    const apellidoMaterno = document.getElementById("apellido-materno-trabajador").value.trim();
    const rut = document.getElementById("rut-trabajador").value.trim();
    const rol = document.getElementById("rol-trabajador").value;
    const password = document.getElementById("password-trabajador").value.trim();
    const regionSucursal = document.getElementById("region-sucursal").value;
    const comunaSucursal = document.getElementById("comuna-sucursal").value;

    if (!correo || !nombre || !apellidoPaterno || !apellidoMaterno || !rut || !rol || !password || !regionSucursal || !comunaSucursal) {
      if (!regionSucursal || !comunaSucursal) {
        mostrarMensaje("Debe seleccionar una región y comuna para continuar.");
      } else {
        mostrarMensaje("Debe completar todos los campos obligatorios.");
      }
      return;
    }

    adminActual = window.firebaseAuth.currentUser;
    adminEmail = adminActual?.email;
    adminPassword = prompt("Por seguridad, ingrese su contraseña de administrador:");
    if (!adminPassword) return;

    // Crear instancia secundaria
    const secondaryApp = window.firebase.initializeApp(window.firebaseAppConfig, "Secondary");
    const secondaryAuth = window.authModule.getAuth(secondaryApp);

    try {
      const userCredential = await window.authModule.createUserWithEmailAndPassword(secondaryAuth, correo, password);
      const nuevoUsuario = userCredential.user;

      const nuevoTrabajador = {
        uid: nuevoUsuario.uid,
        correo,
        nombre,
        apellidoPaterno,
        apellidoMaterno,
        rut,
        rol,
        password,
        cambiarContraseña: true,
        creadoEn: window.Timestamp.now(),
        creadoPor: adminActual.uid,
        regionSucursal,
        comunaSucursal
      };

      await window.setDoc(window.doc(window.firebaseDB, "trabajadores", nuevoUsuario.uid), nuevoTrabajador);

      await window.authModule.signOut(secondaryAuth);

      // FIX: eliminar la instancia secundaria correctamente
      const { deleteApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
      await deleteApp(secondaryApp);

      window.mostrarPaso(3);
      document.getElementById("correo-trabajador-final").value = correo;
      document.getElementById("password-trabajador").value = password;

    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        mostrarMensaje("El correo ya está registrado. Por favor, use otro correo.");
        return;
      }
      console.error("Error al crear trabajador:", error);
      mostrarMensaje("❌ Ocurrió un error al crear el trabajador.");
    }

  } catch (error) {
    console.error("Error completo:", error);
    if (adminEmail && adminPassword) {
      try {
        await window.firebaseSignIn(window.firebaseAuth, adminEmail, adminPassword);
      } catch (reauthError) {
        console.error("Error al reautenticar:", reauthError);
      }
    }
  }
};











function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

const form = document.getElementById("crearProductoForm");

if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const getValue = (key) => formData.get(key)?.trim() || null;

    const uid = uuidv4(); // Código único para imagen y producto
    formData.append("codigo_imagen", uid);

    try {
      // 1. Subir la imagen a Django
      const imagenResponse = await fetch("/api/subir-imagen/", {
        method: "POST",
        body: formData
      });

      if (!imagenResponse.ok) {
        throw new Error("Error al subir la imagen a Django");
      }

      // 2. Crear el producto en Firebase
      const producto = {
        nombre: getValue("nombre"),
        categoria: getValue("categoria"),
        descripcion: getValue("descripcion"),
        marca: getValue("marca"),
        precio: parseInt(getValue("precio")) || 0,
        stock: parseInt(getValue("stock")) || 0,
        codigo: getValue("codigo"),
        potencia: getValue("potencia") ? parseInt(getValue("potencia")) : null,
        voltaje: getValue("voltaje"),
        color: getValue("color"),
        tamano: getValue("tamano"),
        material: getValue("material"),
        presentacion: getValue("presentacion"),
        garantia: getValue("garantia"),
        uso: getValue("uso"),
        peso: getValue("peso") ? parseFloat(getValue("peso")) : null,
        dimensiones: getValue("dimensiones"),
        vencimiento: getValue("vencimiento") || null,
        creadoEn: Timestamp.now(),
        codigoImagen: uid
      };

      const ref = doc(db, "productos", uid);
      await setDoc(ref, producto);

      // ✅ Limpiar formulario
      form.reset();

      // ✅ Volver al paso 1
      document.querySelectorAll('.contenedor_informacion').forEach(div => {
        div.classList.add("oculto");
        div.classList.remove("visible");
      });
      const paso1 = document.getElementById("paso-1-producto");
      paso1.classList.remove("oculto");
      paso1.classList.add("visible");

      // ✅ Marcar botón de paso 1 si tienes uno (opcional)
      const btnCrear = document.getElementById("btn-crear-producto");
      const btnTabla = document.getElementById("btn-tabla-productos");
      if (btnCrear && btnTabla) {
        btnCrear.classList.add("active");
        btnTabla.classList.remove("active");
      }

      alert("✅ Producto guardado con imagen vinculada");
    } catch (error) {
      console.error("❌ Error al guardar el producto o la imagen:", error);
      alert("❌ No se pudo guardar el producto o la imagen. Revisa la consola.");
    }
  });
}

















});
