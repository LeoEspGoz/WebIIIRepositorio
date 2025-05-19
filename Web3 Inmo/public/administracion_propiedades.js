document.addEventListener('DOMContentLoaded', function () {
  verificarSesion();
});

document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu').querySelector('ul');

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });
});

let propiedadAEliminar = null;

function verificarSesion() {
  fetch('http://localhost:3000/session', {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      // Mostrar botones de sesión iniciada
      document.getElementById('registroPropiedadButton').style.display = 'block';
      document.getElementById('logoutButton').style.display = 'block';
      document.getElementById('loginButton').style.display = 'none';

      cargarPropiedades();
    } else {
      // Mostrar solo botón de login
      document.getElementById('registroPropiedadButton').style.display = 'none';
      document.getElementById('logoutButton').style.display = 'none';
      document.getElementById('loginButton').style.display = 'block';

      // Redirigir a login si no hay sesión
      window.location.href = 'login.html';
    }
  })
  .catch(err => {
    console.error('Error al verificar sesión:', err);
    window.location.href = 'login.html';
  });
}

function cargarPropiedades() {
  fetch('http://localhost:3000/api/propiedades', {
    method: 'GET',
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    console.log('Propiedades recibidas:', data);
    const contenedor = document.getElementById('contenedorPropiedades');
    if (!contenedor) return;

    contenedor.innerHTML = '';

    data.forEach(prop => {
      const div = document.createElement('div');
      div.className = 'propiedad-item';

      div.innerHTML = `
        <h3>${prop.titulo}</h3>
        <p>${prop.descripcion}</p>
        <p>Precio: $${prop.precio}</p>
        <p>Ubicación: ${prop.ubicacion}</p>
        <p>Tipo: ${prop.tipo}</p>
        <p>Operación: ${prop.operacion}</p>
        <img src="${prop.imagen}" alt="${prop.titulo}" style="max-width: 100%; height: auto;">
      `;

      const btnEditar = document.createElement('button');
      btnEditar.textContent = 'Editar';
      btnEditar.className = 'btn-editar';
      btnEditar.addEventListener('click', () => editarPropiedad(prop.id));

      const btnEliminar = document.createElement('button');
      btnEliminar.textContent = 'Eliminar';
      btnEliminar.className = 'btn-eliminar';
      btnEliminar.addEventListener('click', () => mostrarModalConfirmacion(prop.id));

      div.appendChild(btnEditar);
      div.appendChild(btnEliminar);

      contenedor.appendChild(div);
    });
  })
  .catch(err => {
    console.error('Error al cargar propiedades:', err);
  });
}

function editarPropiedad(id) {
  alert('Editar propiedad ' + id);
  // Aquí puedes implementar la redirección o abrir modal para editar
}

// Funciones para modal confirmación eliminar
function mostrarModalConfirmacion(id) {
  propiedadAEliminar = id;
  const modal = document.getElementById('modalConfirmarEliminar');
  modal.style.display = 'flex';
}

function ocultarModalConfirmacion() {
  propiedadAEliminar = null;
  const modal = document.getElementById('modalConfirmarEliminar');
  modal.style.display = 'none';
}

document.getElementById('btnCancelar').addEventListener('click', () => {
  ocultarModalConfirmacion();
});

document.getElementById('btnConfirmar').addEventListener('click', () => {
  if (propiedadAEliminar !== null) {
    eliminarPropiedad(propiedadAEliminar);
    ocultarModalConfirmacion();
  }
});

function eliminarPropiedad(id) {
  fetch(`http://localhost:3000/api/propiedades/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      alert('Propiedad eliminada');
      cargarPropiedades();
    } else {
      alert('Error al eliminar propiedad: ' + (data.error || ''));
    }
  })
  .catch(err => {
    console.error('Error al eliminar propiedad:', err);
  });
}
