
const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

// Alternar entre inicio de sesión y registro
registerBtn.addEventListener('click', () => {
    container.classList.add('active');
});

loginBtn.addEventListener('click', () => {
    container.classList.remove('active');
});

// =====================================
// REGISTRO DE CLIENTES: JAVA SPRING BOOT
// =====================================

const formularioRegistro = document.getElementById('registerForm');

formularioRegistro.addEventListener('submit', async (event) => {
    event.preventDefault();

    const username = document.getElementById('nombreRegistro').value.trim();
    const email = document.getElementById('emailRegistro').value.trim();
    const password = document.getElementById('passwordRegistro').value;

    const boton = formularioRegistro.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        const respuesta = await fetch('http://127.0.0.1:8080/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        let datos = {};
        try {
            datos = await respuesta.json();
        } catch (parseError) {
            datos = { mensaje: 'Respuesta inválida del servidor.' };
        }

        if (respuesta.ok && datos.ok) {
            alert('¡Cuenta creada correctamente! Ya puedes iniciar sesión.');
            formularioRegistro.reset();

            // Cambiar al formulario de inicio de sesión
            container.classList.remove('active');

            // Preparar el login con el correo registrado
            document.getElementById('emailLogin').value = email;
            document.getElementById('rolLogin').value = 'CLIENTE';
        } else {
            alert(datos.mensaje || `Error al registrar: Código HTTP ${respuesta.status}`);
        }

    } catch (error) {
        console.error('Error al registrar:', error);

        alert(
            'No se pudo conectar con el microservicio de registro (Spring Boot en puerto 8080). ' +
            'Asegúrate de que el servicio esté corriendo.'
        );
    } finally {
        boton.disabled = false;
    }
});

// =====================================
// INICIO DE SESIÓN: PYTHON FLASK
// =====================================

const formularioLogin = document.getElementById('loginForm');

formularioLogin.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('emailLogin').value.trim();
    const password = document.getElementById('passwordLogin').value;
    const rol = document.getElementById('rolLogin').value;

    const boton = formularioLogin.querySelector('button[type="submit"]');
    boton.disabled = true;

    try {
        const respuesta = await fetch('http://127.0.0.1:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                rol: rol
            })
        });

        let datos = {};
        try {
            datos = await respuesta.json();
        } catch (parseError) {
            datos = { mensaje: 'Respuesta inválida del servidor.' };
        }

        // VALIDACIÓN ESTRICTA: Solo acceder si el servidor respondió HTTP 200 y datos.ok === true
        if (respuesta.status === 200 && respuesta.ok && datos.ok) {
            localStorage.setItem('patitasAlegreToken', datos.token);
            const userRol = (datos.usuario && datos.usuario.rol) ? datos.usuario.rol : rol;
            localStorage.setItem('vetcare_rol', userRol);
            localStorage.setItem('vetcare_usuario', JSON.stringify(datos.usuario || {}));

            alert(`¡Bienvenido a VetCare, ${datos.usuario ? datos.usuario.nombre : 'Usuario'}!`);
            window.location.href = "dashboard.html";
        } else {
            // Rechazo: Credenciales inválidas (401), rol no correspondiente (403), etc.
            const mensajeError = datos.mensaje || 
                (respuesta.status === 401 ? 'Credenciales incorrectas. Verifica tu correo y contraseña.' : 
                 respuesta.status === 403 ? 'La cuenta no tiene permisos para este rol o está inactiva.' :
                 'Error al iniciar sesión.');

            alert(mensajeError);
            document.getElementById('passwordLogin').value = '';
            // IMPORTANTE: NO se realiza redirección a dashboard.html
        }

    } catch (error) {
        console.error('Error al conectar con Flask:', error);

        alert(
            'No se pudo conectar con el microservicio de autenticación (Python en puerto 5000). ' +
            'Asegúrate de que Flask esté en ejecución.'
        );
    } finally {
        boton.disabled = false;
    }
});
