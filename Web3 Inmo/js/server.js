const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const path = require('path');
const session = require('express-session'); // Importa express-session

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de sesiones
app.use(session({
  secret: 'mi_clave_secreta',  // Cambia esto por una clave secreta y robusta
  resave: false,
  saveUninitialized: true,
}));

// Conexión MySQL
const conexion = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'inmobiliaria'
});

conexion.connect(err => {
  if (err) throw err;
  console.log('Conexión a MySQL exitosa');
});

// Ruta de login
app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  const query = 'SELECT * FROM usuario WHERE usuario = ? AND contrasena = ?';
  conexion.query(query, [usuario, contrasena], (err, resultados) => {
    if (err) {
      return res.status(500).json({ ok: false, error: 'Error en el servidor' });
    }

    if (resultados.length > 0) {
      // Login exitoso, guardar la sesión
      req.session.usuario = usuario;  // Guardar usuario en sesión
      res.json({ ok: true });
    } else {
      // Credenciales incorrectas
      res.json({ ok: false });
    }
  });
});

// Ruta para verificar sesión
app.get('/session', (req, res) => {
  if (req.session.usuario) {
    res.json({ ok: true });
  } else {
    res.json({ ok: false });
  }
});

// Ruta de logout
app.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ ok: false, error: 'Error al cerrar sesión' });
    }
    res.json({ ok: true });
  });
});

// Ruta principal
app.get('/', (req, res) => {
  if (req.session.usuario) {
    // Si hay sesión iniciada, redirigir a index
    res.sendFile(path.join(__dirname, '../public/index.html'));
  } else {
    // Si no hay sesión, redirigir al login
    res.sendFile(path.join(__dirname, '../public/login.html'));
  }
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
