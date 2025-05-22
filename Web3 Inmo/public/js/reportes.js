document.addEventListener('DOMContentLoaded', function() {
  // Cargar datos iniciales
  cargarPropiedades();
  cargarEstadisticas();
  cargarActividadAdmin();

  // Evento para filtrar propiedades
  document.getElementById('filtroPropiedades').addEventListener('submit', function(e) {
    e.preventDefault();
    cargarPropiedades();
  });
});

// 1. Reporte de Propiedades
async function cargarPropiedades() {
  const form = document.getElementById('filtroPropiedades');
  const formData = new FormData(form);
  const params = new URLSearchParams(formData);

  try {
    const response = await fetch(`/reportes/propiedades?${params}`);
    const propiedades = await response.json();
    const tbody = document.getElementById('tablaPropiedades');
    
    tbody.innerHTML = propiedades.map(prop => `
      <tr>
        <td>${prop.titulo}</td>
        <td>$${prop.precio.toLocaleString('es-MX')}</td>
        <td>${prop.ubicacion}</td>
        <td>${prop.tipo}</td>
        <td>${prop.operacion}</td>
        <td>${prop.fecha}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
  }
}

// 2. Reporte Estadístico
async function cargarEstadisticas() {
  try {
    const response = await fetch('/reportes/estadisticas');
    const { general, porTipo } = await response.json();
    
    // Métricas generales
    document.getElementById('metricasGenerales').innerHTML = `
      <li class="list-group-item">Total propiedades: <strong>${general.total_propiedades}</strong></li>
      <li class="list-group-item">Precio promedio: <strong>$${general.precio_promedio.toLocaleString('es-MX', {maximumFractionDigits: 2})}</strong></li>
      <li class="list-group-item">Ventas: <strong>${general.ventas}</strong></li>
      <li class="list-group-item">Rentas: <strong>${general.rentas}</strong></li>
    `;

    // Gráfico de distribución por tipo
    const ctx = document.getElementById('chartTipo').getContext('2d');
    new Chart(ctx, {
      type: 'pie',
      data: {
        labels: porTipo.map(item => item.tipo),
        datasets: [{
          data: porTipo.map(item => item.cantidad),
          backgroundColor: [
            '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0'
          ]
        }]
      },
      options: { responsive: true }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

// 3. Actividad del Administrador
async function cargarActividadAdmin() {
  try {
    const response = await fetch('/reportes/admin-actividad');
    const actividades = await response.json();
    const tbody = document.getElementById('tablaAdmin');
    
    tbody.innerHTML = actividades.map(act => `
      <tr>
        <td>${act.id}</td>
        <td>${act.titulo}</td>
        <td>$${act.precio.toLocaleString('es-MX')}</td>
        <td>${act.tipo}</td>
        <td>${act.operacion}</td>
        <td>${act.fecha}</td>
      </tr>
    `).join('');
  } catch (error) {
    console.error('Error:', error);
  }
}