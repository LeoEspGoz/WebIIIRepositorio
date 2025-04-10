document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');

  loginForm.addEventListener('submit', function(e) {
      e.preventDefault(); // Prevenir el envío del formulario

      const usuario = document.getElementById('usuario').value;
      const contrasena = document.getElementById('contrasena').value;

      fetch('http://localhost:3000/login', {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify({
              usuario: usuario,
              contrasena: contrasena
          })
      })
      .then(res => res.json())
      .then(data => {
          if (data.ok) {
              // Si la respuesta es ok, redirigir al usuario
              window.location.href = 'index.html'; // O la página que desees
          } else {
              // Si las credenciales son incorrectas, mostrar error
              alert('Credenciales incorrectas');
          }
      })
      .catch(err => console.error('Error al enviar la solicitud:', err));
  });
});
