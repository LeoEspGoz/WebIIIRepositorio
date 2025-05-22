const express = require('express');
const mysql = require('mysql');
const path = require('path');
const session = require('express-session');
const cors = require('cors');
const multer = require('multer');
const fs = require('fs');

const app = express();
const PORT = 3000;

// CORS
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public')));

// Sesión
app.use(session({
  secret: 'root',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 } // 1 día
}));

// Configurar multer para guardar imágenes en /public/uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Para evitar nombres repetidos, ponemos timestamp + originalname
    const uniqueName = Date.now() + '_' + file.originalname;
    cb(null, uniqueName);
  }
});
const upload = multer({ storage });

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
    if (err) return res.status(500).json({ ok: false, error: 'Error al cerrar sesión' });
    res.clearCookie('connect.sid');
    res.json({ ok: true });
  });
});

// Registrar propiedad con imagen
app.post('/api/registrar-propiedad', upload.single('imagen'), (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ ok: false, error: 'No autorizado' });

  const { titulo, descripcion, precio, ubicacion, tipo, operacion } = req.body;
  const id_admin = req.session.usuario.id_user;
  let imagenPath = null;

  if (req.file) {
    imagenPath = '/uploads/' + req.file.filename; // Ruta accesible desde el front
  }

  const query = `
    INSERT INTO propiedad (titulo, descripcion, precio, ubicacion, tipo, operacion, imagen, id_admin)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

  conexion.query(query, [titulo, descripcion, precio, ubicacion, tipo, operacion, imagenPath, id_admin], (err) => {
    if (err) {
      console.error('Error al registrar propiedad:', err);
      return res.status(500).json({ ok: false, error: 'Error al registrar propiedad' });
    }
    res.json({ ok: true });
  });
});

// Obtener propiedades del usuario
app.get('/api/propiedades', (req, res) => {
  const query = 'SELECT * FROM propiedad';

  conexion.query(query, (err, resultados) => {
    if (err) return res.status(500).json({ ok: false, error: 'Error en la consulta' });
    res.json({ ok: true, propiedades: resultados });
  });
});


// Eliminar propiedad (solo la del usuario)
app.delete('/api/propiedad/:id', (req, res) => {
  if (!req.session.usuario) return res.status(401).json({ ok: false, error: 'No autorizado' });

  const id_admin = req.session.usuario.id_user;
  const id_propiedad = req.params.id;

  const queryCheck = 'SELECT * FROM propiedad WHERE id = ? AND id_admin = ?';
  conexion.query(queryCheck, [id_propiedad, id_admin], (err, resultados) => {
    if (err) return res.status(500).json({ ok: false, error: 'Error en servidor' });
    if (resultados.length === 0) return res.status(403).json({ ok: false, error: 'No autorizado para eliminar esta propiedad' });

    // Opcional: eliminar archivo de imagen físico si existe
    if (resultados[0].imagen) {
      const filePath = path.join(__dirname, '../public', resultados[0].imagen);
      fs.unlink(filePath, (err) => {
        if (err) console.warn('No se pudo eliminar imagen:', err);
      });
    }

    const queryDelete = 'DELETE FROM propiedad WHERE id = ?';
    conexion.query(queryDelete, [id_propiedad], (err2) => {
      if (err2) return res.status(500).json({ ok: false, error: 'Error al eliminar' });
      res.json({ ok: true });
    });
  });
});
// Ruta para obtener propiedades filtradas
app.get('/api/propiedades-filtradas', (req, res) => {
  const { operacion, tipo } = req.query; // <-- cambio aquí
  const condiciones = [];
  const valores = [];

  if (operacion) {
    const operaciones = operacion.split(',');
    condiciones.push(`operacion IN (${operaciones.map(() => '?').join(',')})`);
    valores.push(...operaciones);
  }

  if (tipo) {
    const tipos = tipo.split(',');
    condiciones.push(`tipo IN (${tipos.map(() => '?').join(',')})`);
    valores.push(...tipos);
  }

  const whereClause = condiciones.length ? 'WHERE ' + condiciones.join(' AND ') : '';
  const query = `SELECT * FROM propiedad ${whereClause}`;

  conexion.query(query, valores, (err, resultados) => {
    if (err) {
      console.error('Error al filtrar propiedades:', err);
      return res.status(500).json({ ok: false, error: 'Error en la consulta' });
    }
    res.json({ ok: true, propiedades: resultados });
  });
}); 

// Middleware para parsear JSON
app.use(express.json());

// --- Endpoints para Reportes --- //

// 1. Reporte de Propiedades (Filtrado)
app.get('/reportes/propiedades', async (req, res) => {
  try {
    const { tipo, operacion } = req.query;
    let query = `
      SELECT 
        id, titulo, precio, ubicacion, tipo, operacion, 
        DATE(fecha_publicacion) as fecha
      FROM propiedad
      WHERE 1=1
    `;

    if (tipo) query += ` AND tipo = '${tipo}'`;
    if (operacion) query += ` AND operacion = '${operacion}'`;

    query += ' ORDER BY fecha_publicacion DESC;';
    const [rows] = await pool.query(query);
    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener propiedades' });
  }
});

// 2. Resumen Estadístico
app.get('/reportes/estadisticas', async (req, res) => {
  try {
    const [general] = await pool.query(`
      SELECT 
        COUNT(*) as total_propiedades,
        AVG(precio) as precio_promedio,
        SUM(operacion = 'Venta') as ventas,
        SUM(operacion = 'Renta') as rentas
      FROM propiedad
    `);

    const [porTipo] = await pool.query(`
      SELECT 
        tipo,
        COUNT(*) as cantidad,
        AVG(precio) as precio_promedio
      FROM propiedad
      GROUP BY tipo
    `);

    res.json({ general: general[0], porTipo });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al generar estadísticas' });
  }
});

// 3. Actividad del Administrador
app.get('/reportes/admin-actividad', async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        p.id, p.titulo, p.precio, p.tipo, p.operacion,
        DATE(p.fecha_publicacion) as fecha,
        u.nombre as admin
      FROM propiedad p
      JOIN usuario u ON p.id_admin = u.id_user
      WHERE u.id_user = 1  /* Asume que el admin tiene ID=1 */
      ORDER BY p.fecha_publicacion DESC
    `);
    res.json(rows);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener actividad del admin' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
