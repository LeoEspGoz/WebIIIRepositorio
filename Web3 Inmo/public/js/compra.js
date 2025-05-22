document.addEventListener('DOMContentLoaded', () => {
  const btnFiltros = document.querySelector('.btn-filtros');
  const contenedor = document.querySelector('.tarjetas-container');
  const btnMenu = document.querySelector('.menu-toggle');
  const menu = document.querySelector('nav ul');

  btnMenu.addEventListener('click', () => {
    menu.classList.toggle('active');
  });

  function obtenerFiltros() {
    const tareas = [...document.querySelectorAll('input[name="tarea"]:checked')].map(cb => cb.value);
    const tipos = [...document.querySelectorAll('input[name="tipo"]:checked')].map(cb => cb.value);
    const params = new URLSearchParams();

    if (tareas.length > 0) params.append('operacion', tareas.join(','));
    if (tipos.length > 0) params.append('tipo', tipos.join(','));

    return params;
  }

  function mostrarPropiedades(propiedades) {
    contenedor.innerHTML = ''; // limpiar contenedor

    if (propiedades.length === 0) {
      contenedor.innerHTML = '<p>No se encontraron propiedades.</p>';
      return;
    }

    propiedades.forEach(prop => {
      const tarjeta = document.createElement('div');
      tarjeta.classList.add('tarjeta-propiedad');
      tarjeta.innerHTML = `
        <img src="${prop.imagen}" alt="Imagen propiedad">
        <div class="info">
          <h3>${prop.titulo}</h3>
          <p>${prop.descripcion}</p>
          <p class="precio">$${prop.precio}</p>
          <p><strong>Ubicación:</strong> ${prop.ubicacion}</p>
          <p><strong>Tipo:</strong> ${prop.tipo} | <strong>Operación:</strong> ${prop.operacion}</p>
          <button class="btn-informes" data-id="${prop.id}">Pedir informes</button>
        </div>
      `;
      contenedor.appendChild(tarjeta);
    });

    // Agregar evento a botones "Pedir informes"
    document.querySelectorAll('.btn-informes').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tarjeta = e.target.closest('.tarjeta-propiedad');
        if (!tarjeta) return;

        // Obtener datos de la propiedad desde la tarjeta
        const titulo = tarjeta.querySelector('h3')?.textContent || '';
        const precio = tarjeta.querySelector('.precio')?.textContent || '';
        const descripcion = tarjeta.querySelector('p')?.textContent || '';

        // Guardar en localStorage
        const datos = { titulo, precio, descripcion };
        localStorage.setItem('datosPropiedad', JSON.stringify(datos));

        // Redirigir a contacto.html
window.location.href = 'contacto.html?propiedad';
      });
    });
  }

  function aplicarFiltros() {
    const queryParams = obtenerFiltros();

    fetch(`/api/propiedades-filtradas?${queryParams.toString()}`)
      .then(res => res.json())
      .then(data => {
        if (!data.ok) throw new Error('Error en respuesta');
        mostrarPropiedades(data.propiedades);
      })
      .catch(err => {
        console.error('Error al obtener propiedades:', err);
        contenedor.innerHTML = '<p>Error al cargar propiedades.</p>';
      });
  }

  // Cargar propiedades al inicio
  aplicarFiltros();

  // Aplicar filtros al hacer clic
  btnFiltros.addEventListener('click', aplicarFiltros);
});
