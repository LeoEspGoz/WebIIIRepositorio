document.addEventListener('DOMContentLoaded', () => {
  // Verificar si la URL contiene el parámetro ?propiedad
  const params = new URLSearchParams(window.location.search);
  const mostrarPropiedad = params.has('propiedad');

  const datosJSON = localStorage.getItem('datosPropiedad');
  const infoSeccion = document.getElementById('info-propiedad');

  if (mostrarPropiedad && datosJSON && infoSeccion) {
    const datos = JSON.parse(datosJSON);
    document.getElementById('prop-titulo').textContent = datos.titulo || 'No disponible';
    document.getElementById('prop-precio').textContent = datos.precio || 'No disponible';
    document.getElementById('prop-descripcion').textContent = datos.descripcion || 'No disponible';
    infoSeccion.style.display = 'block';
  } else if (!mostrarPropiedad) {
    // Si no se pidió mostrar propiedad, se eliminan los datos viejos
    localStorage.removeItem('datosPropiedad');
    if (infoSeccion) infoSeccion.style.display = 'none';
  }

  // Menú hamburguesa
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.querySelector('nav ul');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }

  // Validación y modal
  const form = document.getElementById('contactForm');
  const modal = document.getElementById('modal');
  const closeBtn = document.querySelector('.close');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const nombre = document.getElementById('nombre').value.trim();
      const email = document.getElementById('email').value.trim();
      const mensaje = document.getElementById('mensaje').value.trim();

      if (nombre === '' || email === '' || mensaje === '') {
        alert('Por favor, completa todos los campos.');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert('Por favor, ingresa un correo válido.');
        return;
      }

      modal.style.display = 'block';
      form.reset();
    });
  }

  // Cerrar modal con la "X"
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.style.display = 'none';
    });
  }

  // Cerrar modal haciendo clic fuera del contenido
  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      modal.style.display = 'none';
    }
  });
});
