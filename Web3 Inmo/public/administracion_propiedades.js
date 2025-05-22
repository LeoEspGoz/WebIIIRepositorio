document.addEventListener('DOMContentLoaded', function () {
  verificarSesion();
  configurarMenu();
  configurarModalEliminar();
});

function configurarMenu() {
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu').querySelector('ul');

  menuToggle.addEventListener('click', () => {
    navMenu.classList.toggle('show');
  });
}

let propiedadAEliminar = null;

function verificarSesion() {
  fetch('http://localhost:3000/session', {
    method: 'GET',
    credentials: 'include',
  })
  .then(res => {
    console.log('Status sesión:', res.status);
    return res.json();
  })
  .then(data => {
    if (data.ok) {
      // Sesión iniciada, mostrar botones
      document.getElementById('registroPropiedadButton').style.display = 'block';
      document.getElementById('logoutButton').style.display = 'block';
      document.getElementById('loginButton').style.display = 'none';

      cargarPropiedades();
    } else {
      // No hay sesión, mostrar solo login y redirigir
      document.getElementById('registroPropiedadButton').style.display = 'none';
      document.getElementById('logoutButton').style.display = 'none';
      document.getElementById('loginButton').style.display = 'block';

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
    credentials: 'include',
  })
  .then(res => {
    console.log('Status propiedades:', res.status);
    return res.json();
  })
  .then(data => {
    console.log('Propiedades recibidas:', data);

    const contenedor = document.getElementById('contenedorPropiedades');
    if (!contenedor) {
      console.error('No existe contenedorPropiedades');
      return;
    }

    contenedor.innerHTML = '';

    if (!data.ok) {
      contenedor.innerHTML = '<p>Error al cargar propiedades.</p>';
      return;
    }

    const propiedades = data.propiedades;

    if (!Array.isArray(propiedades)) {
      console.error('Propiedades no es un arreglo:', propiedades);
      contenedor.innerHTML = '<p>Error al cargar propiedades.</p>';
      return;
    }

    if (propiedades.length === 0) {
      contenedor.innerHTML = '<p>No hay propiedades para mostrar.</p>';
      return;
    }

    propiedades.forEach(prop => {
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
    const contenedor = document.getElementById('contenedorPropiedades');
    if (contenedor) {
      contenedor.innerHTML = '<p>Error al cargar propiedades.</p>';
    }
  });
}

function editarPropiedad(id) {
  alert('Editar propiedad ' + id);
  // Aquí puedes implementar la redirección o abrir modal para editar
}

// Modal eliminar
function configurarModalEliminar() {
  document.getElementById('btnCancelar').addEventListener('click', ocultarModalConfirmacion);
  document.getElementById('btnConfirmar').addEventListener('click', () => {
    if (propiedadAEliminar !== null) {
      eliminarPropiedad(propiedadAEliminar);
      // ocultarModalConfirmacion se llama después de eliminar exitosamente
    }
  });
}

function mostrarModalConfirmacion(id) {
  propiedadAEliminar = id;
  document.getElementById('modalConfirmacion').style.display = 'block';
  document.getElementById('modalFondo').style.display = 'block';
}

function ocultarModalConfirmacion() {
  propiedadAEliminar = null;
  document.getElementById('modalConfirmacion').style.display = 'none';
  document.getElementById('modalFondo').style.display = 'none';
}

function eliminarPropiedad(id) {
  fetch(`http://localhost:3000/api/propiedad/${id}`, {
    method: 'DELETE',
    credentials: 'include'
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      //alert('Propiedad eliminada');
      ocultarModalConfirmacion();
      cargarPropiedades(); // refrescar lista
    } else {
      alert(data.error);
    }
  })
  .catch(err => {
    alert('Error al eliminar propiedad');
    console.error(err);
  });
}

function logout() {
  fetch('http://localhost:3000/logout', {
    method: 'POST',
    credentials: 'include',
  })
  .then(res => res.json())
  .then(data => {
    if (data.ok) {
      window.location.href = 'login.html';
    } else {
      alert('Error al cerrar sesión');
    }
  })
  .catch(err => {
    console.error('Error al cerrar sesión:', err);
  });
}
