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

    // 👉 Recolectamos las imágenes
    const imagenes = formData.getAll("imagenes");

    // 👉 Eliminar las imágenes del FormData para reconstruirlas correctamente
    formData.delete("imagenes");

    // 👉 Añadir las originales
    imagenes.forEach((img) => {
      formData.append("imagenes", img);
    });

    // 👉 Agregar imagen de reemplazo si faltan
    const cantidadFaltante = 3 - imagenes.length;
    for (let i = 0; i < cantidadFaltante; i++) {
      const imagenPorDefecto = await fetch("/static/media/imagen-no-disponible.jpg")
        .then(res => res.blob())
        .then(blob => new File([blob], "imagen-no-disponible.jpg", { type: "image/jpeg" }));

      formData.append("imagenes", imagenPorDefecto);
    }

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

      form.reset();

      document.querySelectorAll('.contenedor_informacion').forEach(div => {
        div.classList.add("oculto");
        div.classList.remove("visible");
      });
      const paso1 = document.getElementById("paso-1-producto");
      paso1.classList.remove("oculto");
      paso1.classList.add("visible");

      const btnCrear = document.getElementById("btn-crear-producto");
      const btnTabla = document.getElementById("btn-tabla-productos");
      if (btnCrear && btnTabla) {
        btnCrear.classList.add("active");
        btnTabla.classList.remove("active");
      }

      alert("✅ Producto guardado con imágenes");
    } catch (error) {
      console.error("❌ Error al guardar el producto o la imagen:", error);
      alert("❌ No se pudo guardar el producto o la imagen. Revisa la consola.");
    }
  });
}







window.formTransferencias = async function () {
  try {
    const carrito = JSON.parse(localStorage.getItem("carrito")) || [];
    if (carrito.length === 0) return;

    const tipoEntrega = document.querySelector('input[name="tipo_entrega"]:checked')?.value || "tienda";

    // Datos del formulario
    const nombreTitular = document.querySelector('input[name="nombre"]')?.value.trim();
    const rutTitular = document.querySelector('input[name="rut"]')?.value.trim();
    const banco = document.getElementById("banco")?.value;

    if (!nombreTitular || !rutTitular || !banco) return;

    const user = firebaseAuth?.currentUser;
    if (!user) return;

    // Calcular total base
    const totalBase = carrito.reduce((acc, item) => acc + item.precio * item.cantidad, 0);
    let totalFinal = totalBase;
    let region = null;
    let comuna = null;
    let direccionSeleccionada = null;

    if (tipoEntrega === "tienda") {
      region = document.getElementById("region-sucursal")?.value;
      comuna = document.getElementById("comuna-sucursal")?.value;
      if (!region || !comuna) return;
    } else if (tipoEntrega === "domicilio") {
      // ✅ Obtener dirección seleccionada desde Firestore
      const refSeleccion = doc(firebaseDB, "direccionesSeleccionadas", user.uid);
      const snapSeleccion = await getDoc(refSeleccion);
      if (!snapSeleccion.exists()) return;

      const direccionIdSeleccionada = snapSeleccion.data().direccionId;
      const direccionRef = doc(firebaseDB, "direcciones", user.uid, "items", direccionIdSeleccionada);
      const direccionSnap = await getDoc(direccionRef);
      if (!direccionSnap.exists()) return;

      direccionSeleccionada = direccionSnap.data();
      totalFinal += 5000;
    }

    // Crear pedido
    const ref = collection(firebaseDB, "pedidos");
    const nuevoDoc = await addDoc(ref, {
      uidCliente: user.uid,
      email: user.email,
      nombreTitular,
      rutTitular,
      banco,
      carrito,
      total: totalFinal,
      tipoEntrega,
      tipoDePago: "Transferencia",
      regionSucursal: tipoEntrega === "tienda" ? region : null,
      comunaSucursal: tipoEntrega === "tienda" ? comuna : null,
      direccionDespacho: tipoEntrega === "domicilio" ? direccionSeleccionada : null,
      estadoTransferencia: "pendiente",
      timestamp: Timestamp.now()
    });

    // Guardar uid del documento dentro del documento
    await setDoc(nuevoDoc, { uid: nuevoDoc.id }, { merge: true });

    // Limpiar carrito y recargar interfaz
    localStorage.removeItem("carrito");

    if (typeof window.renderizarCarrito === "function") {
      window.renderizarCarrito();
    }

    setTimeout(() => {
      location.reload();
    }, 2000);

  } catch (error) {
    console.warn("Error al guardar transferencia:", error);
    return;
  }
};







document.getElementById("changePasswordForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPassword = document.getElementById("currentPassword").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();

  if (!currentPassword || !newPassword || !confirmPassword) {
    mostrarMensaje("Por favor completa todos los campos.", "error");
    return;
  }

  if (newPassword.length < 6) {
    mostrarMensaje("La nueva contraseña debe tener al menos 6 caracteres.", "error");
    return;
  }

  if (newPassword !== confirmPassword) {
    mostrarMensaje("❌ Las contraseñas nuevas no coinciden.", "error");
    return;
  }

  if (newPassword === currentPassword) {
    mostrarMensaje("❌ La nueva contraseña no puede ser igual a la actual.", "error");
    return;
  }

  const user = window.firebaseAuth.currentUser;
  if (!user || !user.email) {
    mostrarMensaje("No se pudo validar tu sesión.", "error");
    return;
  }

  try {
    const { EmailAuthProvider, reauthenticateWithCredential, updatePassword } = await import(
      "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js"
    );

    const credenciales = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credenciales);
    await updatePassword(user, newPassword);

    const docRef = window.doc(window.firebaseDB, "trabajadores", user.uid);
    await window.updateDoc(docRef, { cambiarContraseña: false });

    mostrarMensaje("✅ Contraseña actualizada correctamente. Serás redirigido al inicio.", "success");

    // Ocultar el modal y redirigir
    document.getElementById("bloqueoTotal").style.display = "none";

    setTimeout(() => {
      window.location.href = "/acceso/";
    }, 2000);
  } catch (err) {
    console.error("❌ Error al cambiar contraseña:", err);
    mostrarMensaje("Error al actualizar la contraseña. Asegúrate de que la contraseña actual sea correcta.", "error");
  }
});










});
