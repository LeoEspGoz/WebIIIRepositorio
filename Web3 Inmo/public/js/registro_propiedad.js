document.addEventListener('DOMContentLoaded', function() {
    // Aquí va el código que debe ejecutarse después de que el DOM esté cargado.
    const form = document.getElementById('registroForm');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();

            // Obtener los datos del formulario
            const titulo = document.getElementById('titulo').value;
            const descripcion = document.getElementById('descripcion').value;
            const precio = document.getElementById('precio').value;
            const ubicacion = document.getElementById('ubicacion').value;
            const tipo = document.getElementById('tipo').value;
            const operacion = document.getElementById('operacion').value;
            const imagen = document.getElementById('imagen').value;
            const id_admin = 1; // Asumiendo que el id del admin está estático por ahora.

            // Enviar los datos al servidor
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
                    alert(data.message); // Mostrar mensaje de éxito
                    // Redirigir o limpiar formulario, etc.
                } else {
                    alert('Error al registrar la propiedad: ' + data.error); // Mostrar error
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
