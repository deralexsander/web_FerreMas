// --------------------------
// SCRIPT FIREBASE (AUTH + DB) - Versión consolidada
// --------------------------


window.addEventListener('DOMContentLoaded', async () => {
  // Importaciones de Firebase
  const { initializeApp } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js");
  const { getAnalytics } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js");
  const {
    getAuth,
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendPasswordResetEmail,
    updateProfile,
    EmailAuthProvider,
    reauthenticateWithCredential,
    updatePassword
  } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js");
  const {
    getFirestore,
    doc,
    setDoc,
    getDoc,
    collection,
    getDocs,
    query,
    where,
    Timestamp
  } = await import("https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js");

  // Configuración de Firebase
  const firebaseConfig = {
    apiKey: "AIzaSyCOsIJF-ywgaQPqT5ApyodIcRRBCiU-mtI",
    authDomain: "ferremas-1a2c4.firebaseapp.com",
    projectId: "ferremas-1a2c4",
    storageBucket: "ferremas-1a2c4.appspot.com",
    messagingSenderId: "427152375883",
    appId: "1:427152375883:web:f3dc467e589520bbf44dce"
  };

  // Inicialización de Firebase
  const app = initializeApp(firebaseConfig);
  const analytics = getAnalytics(app);
  const auth = getAuth();
  const db = getFirestore(app);

  // Función para mostrar mensajes
  function mostrarMensaje(mensaje, tipo = 'error') {
    console.log(tipo.toUpperCase() + ":", mensaje);
    alert(mensaje);
  }

  // Función para cambiar entre formularios
  function cambiarFormulario(ocultar, mostrar) {
    if (ocultar && mostrar) {
      ocultar.style.display = 'none';
      mostrar.style.display = 'block';
    }
  }

  // ========== FUNCIÓN PARA CREAR TRABAJADORES (GLOBAL) ==========
window.crearTrabajador = async function() {
  try {
    const correo = document.getElementById("correo-trabajador").value.trim().toLowerCase();
    const nombre = document.getElementById("nombre-trabajador").value.trim();
    const apellidoPaterno = document.getElementById("apellido-paterno-trabajador").value.trim();
    const apellidoMaterno = document.getElementById("apellido-materno-trabajador").value.trim();
    const rut = document.getElementById("rut-trabajador").value.trim();
    const rol = document.getElementById("rol-trabajador").value;
    const password = document.getElementById("password-trabajador").value.trim();

    // Validación de campos
    if (!correo || !nombre || !apellidoPaterno || !apellidoMaterno || !rut || !rol || !password) {
      mostrarMensaje("Todos los campos son obligatorios.");
      return;
    }

    // 1. Guardar credenciales del admin actual
    const adminActual = auth.currentUser;
    const adminEmail = adminActual.email;
    const adminPassword = prompt("Por seguridad, ingrese su contraseña de administrador:");

    if (!adminPassword) {
      mostrarMensaje("Se requiere la contraseña de administrador.");
      return;
    }

    // 2. Crear el nuevo usuario en Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, correo, password);
    const nuevoUsuario = userCredential.user;

    // 3. Crear documento en Firestore
    const nuevoTrabajador = {
      uid: nuevoUsuario.uid,
      correo,
      nombre,
      apellidoPaterno,
      apellidoMaterno,
      rut,
      rol,
      password, // Considera no almacenar la contraseña en Firestore
      cambiarContraseña: true,
      creadoEn: Timestamp.now(),
      creadoPor: adminActual.uid
    };

    await setDoc(doc(db, "trabajadores", nuevoUsuario.uid), nuevoTrabajador);

    // 4. Volver a autenticar al admin
    await signOut(auth);
    await signInWithEmailAndPassword(auth, adminEmail, adminPassword);

    mostrarMensaje("Trabajador creado correctamente", "success");
    document.querySelectorAll('input').forEach(input => input.value = '');

  } catch (error) {
    console.error("Error completo:", error);
    
    if (error.code === 'permission-denied') {
      mostrarMensaje("Error: No tienes permisos para realizar esta acción. Contacta al administrador.");
    } else if (error.code === 'auth/email-already-in-use') {
      mostrarMensaje("Error: Este correo ya está registrado.");
    } else {
      mostrarMensaje("Error: " + error.message);
    }
    
    // Intenta reautenticar al admin si hubo error
    if (adminActual && adminEmail && adminPassword) {
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
      } catch (reauthError) {
        console.error("Error al reautenticar:", reauthError);
      }
    }
  }
};

  // ========== MANEJO DE AUTENTICACIÓN ==========
  const pathActual = window.location.pathname;

  onAuthStateChanged(auth, async (user) => {
    // Limpiar datos antiguos si el usuario cambió
    const trabajadorStorage = JSON.parse(sessionStorage.getItem("trabajador"));
    if (!user || (trabajadorStorage && user.uid !== trabajadorStorage.id)) {
      sessionStorage.removeItem("trabajador");
    }

    // Actualizar enlaces de acceso/perfil
    const botonAccesoLink = document.querySelector('a[href="/acceso/"]');
    if (botonAccesoLink) botonAccesoLink.setAttribute('href', user ? '/perfil/' : '/acceso/');
    if (user && pathActual === '/acceso/') window.location.href = '/perfil/';
    if (!user && pathActual === '/perfil/') window.location.href = '/acceso/';

    // Elementos de la UI
    const nombreUsuario = document.getElementById('nombre-usuario');
    const correoUsuario = document.getElementById('correo-usuario');
    const fotoUsuario = document.getElementById('foto-usuario');
    const tipoUsuario = document.getElementById('rol-usuario');

    let rol = "";
    let datosTrabajador = null;

    try {
      // Siempre obtener datos frescos de Firestore
      if (user) {
        // Intentar obtener por UID primero (más eficiente)
        const docRef = doc(db, "trabajadores", user.uid);
        const docSnap = await getDoc(docRef);
    
        if (docSnap.exists()) {
          datosTrabajador = docSnap.data();
          rol = (datosTrabajador?.rol || "").toLowerCase().trim();
          sessionStorage.setItem("trabajador", JSON.stringify({ ...datosTrabajador, id: user.uid }));
    
          // Mostrar modal si cambiarContraseña está en true
          if (datosTrabajador?.cambiarContraseña === true) {
            const modal = document.getElementById("passwordChangeModal");
            if (modal) modal.style.display = "block";
          }
    
        } else {
          // Si no existe por UID, buscar por correo (para compatibilidad)
          const q = query(
            collection(db, "trabajadores"), 
            where("correo", "==", user.email.toLowerCase())
          );
          const resultado = await getDocs(q);
    
          if (!resultado.empty) {
            const data = resultado.docs[0].data();
            rol = (data?.rol || "").toLowerCase().trim();
            datosTrabajador = { ...data, id: resultado.docs[0].id };
            sessionStorage.setItem("trabajador", JSON.stringify(datosTrabajador));
    
            // Mostrar modal si cambiarContraseña está en true
            if (data?.cambiarContraseña === true) {
              const modal = document.getElementById("passwordChangeModal");
              if (modal) modal.style.display = "block";
            }
    
          } else {
            // Usuario normal (cliente)
            rol = "cliente";
            sessionStorage.setItem("trabajador", JSON.stringify({ rol: "cliente" }));
          }
        }
      }
    } catch (e) {
      console.error("Error obteniendo datos de trabajador:", e);
      rol = "";
    }
    

    // Actualizar UI según el rol
    if (tipoUsuario) {
      const rolesDisplay = {
        admin: "Tipo: Admin",
        vendedor: "Tipo: Vendedor",
        contador: "Tipo: Contador",
        bodeguero: "Tipo: Bodeguero",
        cliente: "Tipo: Cliente"
      };
      tipoUsuario.textContent = rolesDisplay[rol] || rolesDisplay.cliente;
    }

    // Actualizar clases CSS según rol
    const body = document.body;
    const roleClasses = [
      'usuario-admin',
      'usuario-vendedor',
      'usuario-contador',
      'usuario-bodeguero',
      'usuario-cliente'
    ];
    body.classList.remove(...roleClasses);
    
    if (rol) {
      body.classList.add(`usuario-${rol}`);
    } else {
      body.classList.add('usuario-cliente');
    }

    // Mostrar información del usuario
    if (nombreUsuario && correoUsuario && fotoUsuario && user) {
      const trabajadorCorreo = datosTrabajador?.correo || "";

      await user.reload();
      const userRefrescado = auth.currentUser;

      const sessionNombre = sessionStorage.getItem("nombreRegistroCliente") || "";
      const nombreBase = userRefrescado.displayName || sessionNombre || datosTrabajador?.nombre || "";
      const apellidoPaterno = datosTrabajador?.apellidoPaterno || "";
      const apellidoMaterno = datosTrabajador?.apellidoMaterno || "";

      let nombreCompleto = `${nombreBase} ${apellidoPaterno} ${apellidoMaterno}`.trim();
      if (!nombreCompleto || nombreCompleto === "") {
        nombreCompleto = user.email.split("@")[0];
      }

      nombreUsuario.textContent = nombreCompleto;
      correoUsuario.textContent = trabajadorCorreo || user.email;
      fotoUsuario.src = user.photoURL || "https://placehold.co/100x100";
    }

    // Si es admin, mostrar datos de trabajadores (para debug)
    if (rol === "admin") {
      try {
        const trabajadoresSnapshot = await getDocs(collection(db, "trabajadores"));
        console.log("Documentos de trabajadores:");
        trabajadoresSnapshot.forEach((doc) => {
          console.log(doc.id, doc.data());
        });
      } catch (e) {
        console.error("Error leyendo trabajadores como admin:", e);
      }
    }
  });

  // ========== MANEJO DE FORMULARIOS ==========

  // Formulario de registro de cliente
  const formularioRegistro = document.querySelector('.centrar-registro-cliente .form');
  if (formularioRegistro) {
    formularioRegistro.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = formularioRegistro.querySelector('input[type="email"]').value.trim();
      const username = document.getElementById("nombre-registro-cliente").value.trim();
      const password = formularioRegistro.querySelectorAll('input[type="password"]')[0].value;
      const confirmPassword = formularioRegistro.querySelectorAll('input[type="password"]')[1].value;      
      if (!email || !username || !password || !confirmPassword) return mostrarMensaje('Por favor, completa todos los campos.');
      if (password !== confirmPassword) return mostrarMensaje('Las contraseñas no coinciden');
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, { displayName: username });
        sessionStorage.setItem("nombreRegistroCliente", username);
        await userCredential.user.reload();
        window.location.href = "/";
      } catch (error) {
        console.error(error);
        mostrarMensaje(error.message);
      }
    });
  }

  // Formulario de login de cliente
  const formularioLogin = document.querySelector('.centrar-login-cliente .form');
  if (formularioLogin) {
    formularioLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const inputs = formularioLogin.querySelectorAll('.input');
      const email = inputs[0].value.trim();
      const password = inputs[1].value.trim();
      if (!email || !password) return mostrarMensaje('Por favor, completa ambos campos.');
      try {
        await signInWithEmailAndPassword(auth, email, password);
        sessionStorage.setItem("trabajador", JSON.stringify({ rol: null }));
        window.location.href = "/";
      } catch (error) {
        console.error(error);
        mostrarMensaje('Usuario o contraseña incorrectos.');
      }
    });
  }

  // Formulario de login de trabajador
  const formularioLoginTrabajador = document.querySelector('.centrar-login-trabajador .form');
  if (formularioLoginTrabajador) {
    formularioLoginTrabajador.addEventListener('submit', async (e) => {
      e.preventDefault();

      const inputs = formularioLoginTrabajador.querySelectorAll('.input');
      const correoIngresado = inputs[0].value.trim().toLowerCase();
      const passwordIngresado = inputs[1].value.trim();

      if (!correoIngresado || !passwordIngresado) {
        mostrarMensaje('Completa ambos campos');
        return;
      }

      try {
        const q = query(collection(db, "trabajadores"), where("correo", "==", correoIngresado));
        const resultado = await getDocs(q);

        if (resultado.empty) {
          mostrarMensaje("Correo no encontrado");
          return;
        }

        const doc = resultado.docs[0];
        const data = doc.data();

        if (data.password !== passwordIngresado) {
          mostrarMensaje("Contraseña incorrecta");
          return;
        }

        try {
          await signInWithEmailAndPassword(auth, correoIngresado, passwordIngresado);
        } catch (error) {
          if (error.code === 'auth/user-not-found') {
            await createUserWithEmailAndPassword(auth, correoIngresado, passwordIngresado);
            mostrarMensaje("Cuenta activada correctamente");
          } else {
            throw error;
          }
        }

        sessionStorage.setItem("trabajador", JSON.stringify({ ...data, id: doc.id }));
        mostrarMensaje("Bienvenido " + data.nombre);
        setTimeout(() => window.location.href = "/perfil/", 1000);

      } catch (error) {
        console.error("Error en login de trabajador:", error);
        mostrarMensaje("Ocurrió un error al ingresar");
      }
    });
  }

  // Formulario de recuperación de contraseña
  const formularioRecuperar = document.querySelector('.centrar-recuperar .form');
  const botonRecuperar = formularioRecuperar?.querySelector('.button-submit');
  if (formularioRecuperar && botonRecuperar) {
    botonRecuperar.addEventListener('click', async (e) => {
      e.preventDefault();
      const inputCorreo = formularioRecuperar.querySelector('.input');
      const email = inputCorreo.value.trim();
      if (!email) return mostrarMensaje('Por favor, ingresa tu correo.');
      try {
        await sendPasswordResetEmail(auth, email);
        mostrarMensaje('Te hemos enviado un correo para restablecer tu contraseña.');
        inputCorreo.value = '';
        cambiarFormulario(formularioRecuperar, document.querySelector('.centrar-login-cliente'));
      } catch (error) {
        console.error(error);
        mostrarMensaje('Correo no registrado o error al enviar el correo.');
      }
    });
  }

  // Botón de logout
  const botonLogout = document.getElementById('boton-logout');
  if (botonLogout) {
    botonLogout.addEventListener('click', async () => {
      try {
        await signOut(auth);
        sessionStorage.removeItem("trabajador");
        alert('Has cerrado sesión correctamente.');
        window.location.href = '/acceso/';
      } catch (error) {
        console.error('Error al cerrar sesión:', error);
        alert('Ocurrió un error al intentar cerrar sesión.');
      }
    });
  }







// Cambiar contraseña desde el modal
const formCambio = document.getElementById("changePasswordForm");
if (formCambio) {
  formCambio.addEventListener("submit", async (e) => {
    e.preventDefault();

    const currentPassword = document.getElementById("currentPassword").value.trim();
    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Completa todos los campos.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("La nueva contraseña no coincide con la confirmación.");
      return;
    }

    if (newPassword.length < 6) {
      alert("La nueva contraseña debe tener al menos 6 caracteres.");
      return;
    }

    try {
      const user = auth.currentUser;
      const credential = EmailAuthProvider.credential(user.email, currentPassword);

      // Reautenticar al usuario
      await reauthenticateWithCredential(user, credential);

      // Cambiar contraseña
      await updatePassword(user, newPassword);

      // Actualizar cambiarContraseña a false en Firestore
      const trabajador = JSON.parse(sessionStorage.getItem("trabajador"));
      if (trabajador?.id) {
        await setDoc(
          doc(db, "trabajadores", trabajador.id),
          { cambiarContraseña: false },
          { merge: true }
        );
        trabajador.cambiarContraseña = false;
        sessionStorage.setItem("trabajador", JSON.stringify(trabajador));
      }

      alert("Contraseña cambiada con éxito.");
      document.getElementById("passwordChangeModal").style.display = "none";
    } catch (error) {
      console.error("Error al cambiar la contraseña:", error);
      alert("Error al cambiar la contraseña. Verifica la contraseña actual o inténtalo nuevamente.");
    }
  });
}









  
});