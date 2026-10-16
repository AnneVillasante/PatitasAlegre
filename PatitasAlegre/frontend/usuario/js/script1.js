
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
        const respuesta = await fetch('http://localhost:8080/api/registro', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                email: email,
                password: password
            })
        });

        const datos = await respuesta.json();

        if (!respuesta.ok || !datos.ok) {
            alert(datos.mensaje || 'No se pudo registrar la cuenta.');
            return;
        }

        alert('¡Cuenta creada correctamente! Ya puedes iniciar sesión.');

        formularioRegistro.reset();

        // Cambiar al formulario de inicio de sesión
        container.classList.remove('active');

        // Preparar el login con el correo registrado
        document.getElementById('emailLogin').value = email;
        document.getElementById('rolLogin').value = 'CLIENTE';

    } catch (error) {
        console.error('Error al registrar:', error);

        alert(
            'No se pudo conectar con el servidor Java. ' +
            'Comprueba que Spring Boot esté ejecutándose.'
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
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email: email,
                password: password,
                rol: rol
            })
        });

        const datos = await respuesta.json();

        if (respuesta.ok && datos.ok) {
            localStorage.setItem('patitasAlegreToken', datos.token);
            alert(`¡Bienvenido a VetCare, ${datos.usuario.nombre}!`);
            console.log('Usuario autenticado:', datos.usuario);
        } else {
            alert(datos.mensaje || 'No se pudo iniciar sesión.');
        }

    } catch (error) {
        console.error('Error al conectar con Flask:', error);

        alert(
            'No se pudo conectar con el servidor Python. ' +
            'Comprueba que Flask esté ejecutándose.'
        );
    } finally {
        boton.disabled = false;
    }
});
