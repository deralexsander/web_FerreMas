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



});
