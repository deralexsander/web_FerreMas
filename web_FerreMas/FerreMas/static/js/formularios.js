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







});
