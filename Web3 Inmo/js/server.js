const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ruta estática al nivel correcto
app.use(express.static(path.join(__dirname, '../public')));

// Configuración de sesión
app.use(session({
  secret: 'root',
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

// Rutas

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

// Login
app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;
  const query = 'SELECT * FROM usuario WHERE usuario = ? AND contrasena = ?';

  conexion.query(query, [usuario, contrasena], (err, resultados) => {
    if (err) return res.status(500).json({ ok: false, error: 'Error en servidor' });

    if (resultados.length > 0) {
      req.session.usuario = resultados[0]; // Guardamos toda la info del usuario
      res.json({ ok: true });
    } else {
      res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
    }
  });
});

// Verificar sesión
app.get('/session', (req, res) => {
  if (req.session.usuario) {
    res.json({ ok: true, usuario: req.session.usuario });
  } else {
    res.json({ ok: false });
  }
});

app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ ok: false, error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// Registro de propiedad
app.post('/registrar-propiedad', (req, res) => {
  const { titulo, descripcion, precio, ubicacion, tipo, operacion, imagen } = req.body;

  if (!req.session.usuario) {
    return res.status(401).json({ ok: false, error: 'No autorizado' });
  }

  const id_admin = req.session.usuario.id_user;

  const query = `
    INSERT INTO propiedad (titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  conexion.query(query, [titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin], (err, result) => {
    if (err) {
      console.error('Error al registrar propiedad:', err);
      return res.status(500).json({ ok: false });
    }
    res.json({ ok: true });
  });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
