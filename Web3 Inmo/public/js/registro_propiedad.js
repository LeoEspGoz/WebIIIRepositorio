document.addEventListener('DOMContentLoaded', () => {
  // Verificar sesión al cargar
  fetch('/session', {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if (!data.ok) {
      window.location.href = 'login.html';
      return;
    }

    const loginBtn = document.getElementById('loginButton');
    const logoutBtn = document.getElementById('logoutButton');

    if (loginBtn) loginBtn.style.display = 'none';
    if (logoutBtn) logoutBtn.style.display = 'block';
  })
  .catch(() => {
    window.location.href = 'login.html';
  });

  // Manejo del formulario con archivo
  const form = document.getElementById('formRegistroPropiedad');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();

      const formData = new FormData(form);

      fetch('/api/registrar-propiedad', {
        method: 'POST',
        credentials: 'include',
        body: formData
      })
      .then(res => res.json())
      .then(data => {
        if (data.ok) {
          const modal = document.getElementById('modalExito');
          modal.style.display = 'block';
          setTimeout(() => modal.style.display = 'none', 3000);
          form.reset();
        } else {
          alert('Error al registrar propiedad: ' + (data.error || 'Error desconocido'));
        }
      })
      .catch(() => alert('Error al registrar propiedad'));
    });
  }
  const logout = () => {
    fetch('/logout', {
      method: 'POST',
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      if (data.ok) {
        window.location.href = 'login.html';
      } else {
        alert('No se pudo cerrar sesión.');
      }
    })
    .catch(() => alert('Error al cerrar sesión'));
  };

  // Asociar evento al botón logout si existe
  const logoutBtn = document.getElementById('logoutButton');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  }
});
