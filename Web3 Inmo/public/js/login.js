document.getElementById('formLogin').addEventListener('submit', async (e) => {
    e.preventDefault();
  
    const usuario = e.target.usuario.value;
    const contrasena = e.target.contrasena.value;
  
    const res = await fetch('/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ usuario, contrasena })
    });
  
    const data = await res.json();
  
    if (data.ok) {
      window.location.href = 'index.html';
    } else {
      alert('Credenciales incorrectas');
    }
  });
  