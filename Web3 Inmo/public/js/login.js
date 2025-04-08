document.addEventListener("DOMContentLoaded", function() {
    // Verificar si hay sesión activa al cargar la página
    fetch('http://localhost:3000/session', {
      method: 'GET',
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          // Si la sesión está activa, mostrar el botón de Cerrar Sesión
          document.getElementById('logoutButton').style.display = 'block';
        }
      })
      .catch(err => console.error('Error:', err));
  });
  
  // Función para cerrar sesión
  function logout() {
    fetch('http://localhost:3000/logout', {
      method: 'POST',
    })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          // Redirigir al login después de cerrar sesión
          window.location.href = 'login.html';
        }
      })
      .catch(err => console.error('Error al cerrar sesión:', err));
  }
  