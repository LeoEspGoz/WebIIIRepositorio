document.addEventListener('DOMContentLoaded', function () {
  // Verificar sesión
  fetch('http://localhost:3000/session', {
    method: 'GET',
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        // Mostrar botones y contenido solo si hay sesión
        document.getElementById('registroPropiedadButton').style.display = 'block';
        document.getElementById('logoutButton').style.display = 'block';
        document.getElementById('loginButton').style.display = 'none';
        
        // Aquí puedes llamar a una función que cargue propiedades si es necesario
        // cargarPropiedades();
      } else {
        // Redirigir si no hay sesión activa
        window.location.href = 'login.html';
      }
    })
    .catch(err => {
      console.error('Error al verificar sesión:', err);
      window.location.href = 'login.html';
    });
});

// Función para cerrar sesión
function logout() {
  fetch('http://localhost:3000/logout', {
    method: 'POST',
    credentials: 'include'
  })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        window.location.href = 'login.html';
      }
    })
    .catch(err => console.error('Error al cerrar sesión:', err));
}
