const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware para servir archivos estáticos
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para procesar solicitudes JSON
app.use(express.json());

// Configuración de sesiones
app.use(session({
  secret: 'root',
  resave: false,
  saveUninitialized: true,
}));

// Conexión a la base de datos MySQL
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

// Ruta para iniciar sesión
app.post('/login', (req, res) => {
  const { usuario, contrasena } = req.body;

  const query = 'SELECT * FROM usuario WHERE usuario = ? AND contrasena = ?';
  conexion.query(query, [usuario, contrasena], (err, resultados) => {
    if (err) {
      console.error('Error al hacer login:', err);
      return res.status(500).json({ ok: false, error: 'Error en el servidor' });
    }

    if (resultados.length > 0) {
      req.session.usuario = usuario;  // Guardar usuario en sesión
      res.json({ ok: true });
    } else {
      res.status(401).json({ ok: false, error: 'Credenciales incorrectas' });
    }
  });
});

// Ruta para registrar la propiedad
app.post('/registrar-propiedad', (req, res) => {
  const { titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin } = req.body;

  // Validación básica de datos
  if (!titulo || !precio || !tipo || !operacion || !id_admin) {
    return res.status(400).json({ ok: false, error: 'Faltan datos requeridos' });
  }

  const query = `
    INSERT INTO propiedad (titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;

  conexion.query(query, [titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin], (err, result) => {
    if (err) {
      console.error('Error al registrar la propiedad:', err);
      return res.status(500).json({ ok: false, error: 'Error al registrar la propiedad' });
    }
    res.json({ ok: true, message: 'Propiedad registrada exitosamente' });
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
