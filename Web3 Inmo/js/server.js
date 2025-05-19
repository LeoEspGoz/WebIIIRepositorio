const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
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
      req.session.usuario = resultados[0];
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

// Logout
app.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).json({ ok: false, error: 'Error al cerrar sesión' });
    }
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// Obtener propiedades
app.get('/api/propiedades', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ ok: false, error: 'No autorizado' });

  const query = 'SELECT * FROM propiedad WHERE id_admin = ?';
  const id_admin = req.session.usuario.id_user;

  conexion.query(query, [id_admin], (err, resultados) => {
    if (err) return res.status(500).json({ ok: false, error: 'Error en consulta' });

    // Aseguramos que el id de propiedad sea "id" para el frontend
    const propiedades = resultados.map(row => ({
      id: row.id,
      titulo: row.titulo,
      descripcion: row.descripcion,
      precio: row.precio,
      ubicacion: row.ubicacion,
      tipo: row.tipo,
      operacion: row.operacion,
      imagen: row.imagen
    }));

    res.json(propiedades);
  });
});

// Registrar propiedad
app.post('/registrar-propiedad', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ ok: false, error: 'No autorizado' });

  const { titulo, descripcion, precio, ubicacion, tipo, operacion, imagen } = req.body;
  const id_admin = req.session.usuario.id_user;

  const query = `
    INSERT INTO propiedad (titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  conexion.query(query, [titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin], (err) => {
    if (err) {
      console.error('Error al registrar propiedad:', err);
      return res.status(500).json({ ok: false });
    }
    res.json({ ok: true });
  });
});

app.delete('/api/propiedades/:id', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ ok: false, error: 'No autorizado' });

  const id = req.params.id;
  const id_admin = req.session.usuario.id_user;

  const query = 'DELETE FROM propiedad WHERE id = ? AND id_admin = ?';

  conexion.query(query, [id, id_admin], (err, result) => {
    if (err) {
      console.error('Error al eliminar propiedad:', err);
      return res.status(500).json({ ok: false, error: 'Error al eliminar propiedad' });
    }

    if (result.affectedRows === 0) {
      return res.status(404).json({ ok: false, error: 'Propiedad no encontrada o sin permiso para eliminar' });
    }

    res.json({ ok: true });
  });
});



app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
