document.addEventListener('DOMContentLoaded', function () {
    // Verificar sesión
    fetch('http://localhost:3000/session', {
        method: 'GET',
        credentials: 'include'
    })
        .then(res => res.json())
        .then(data => {
            if (data.ok) {
                // Hay sesión activa
                document.getElementById('logoutButton').style.display = 'block';
                document.getElementById('loginButton').style.display = 'none';
                document.getElementById('registroPropiedadButton').style.display = 'block';
            } else {
                // No hay sesión
                document.getElementById('logoutButton').style.display = 'none';
                document.getElementById('loginButton').style.display = 'block';
                document.getElementById('registroPropiedadButton').style.display = 'none';
            }
        })
        .catch(err => console.error('Error al verificar sesión:', err));

    // Función para cerrar sesión
    window.logout = function () {
        fetch('http://localhost:3000/logout', {
            method: 'POST',
            credentials: 'include'
        })
            .then(res => res.json())
            .then(data => {
                if (data.ok) {
                    window.location.href = 'index.html';
                }
            })
            .catch(err => console.error('Error al cerrar sesión:', err));
    };

    // Lógica del formulario
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const titulo = document.getElementById('titulo').value;
            const descripcion = document.getElementById('descripcion').value;
            const precio = document.getElementById('precio').value;
            const ubicacion = document.getElementById('ubicacion').value;
            const tipo = document.getElementById('tipo').value;
            const operacion = document.getElementById('operacion').value;
            const imagen = document.getElementById('imagen').value;
            const id_admin = 1; // Cambiar esto cuando uses sesión real

            fetch('http://localhost:3000/registrar-propiedad', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    titulo,
                    descripcion,
                    precio,
                    ubicacion,
                    tipo,
                    operacion,
                    imagen,
                    id_admin
                })
            })
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        alert(data.message);
                        // Limpiar formulario o redirigir
                    } else {
                        alert('Error al registrar la propiedad: ' + data.error);
                    }
                })
                .catch(error => {
                    console.error('Error al enviar la solicitud:', error);
                    alert('Hubo un error al registrar la propiedad.');
                });
        });
    } else {
        console.error('Formulario no encontrado');
    }
});
