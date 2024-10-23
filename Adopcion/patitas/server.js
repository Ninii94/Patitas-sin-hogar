const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
const path = require('path');
require('dotenv').config();


const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL || 'https://patitas-sin-hogar.onrender.com',
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'adopcion/build')));
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  ssl: {
    rejectUnauthorized: false
  }
});


const testDatabaseConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexión exitosa a AWS RDS');
    connection.release();
  } catch (error) {
    console.error('❌ Error conectando a AWS RDS:', error);
  }
 
};



// Verificar conexión al iniciar
testDatabaseConnection();


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM usuario_administrador WHERE nombre_usuario = ?',
      [username]
    );

    if (rows.length > 0) {
      const user = rows[0];
      const match = await bcrypt.compare(password, user.contrasena);

      if (match) {
        res.json({ success: true, role: 'admin' });
      } else {
        res.status(401).json({ success: false, message: 'Credenciales inválidas' });
      }
    } else {
      res.status(401).json({ success: false, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    console.error('Error en el inicio de sesión:', error);
    res.status(500).json({ success: false, message: 'Error en el servidor' });
  }
});

app.post('/api/mascotas', async (req, res) => {
  console.log('Datos recibidos:', req.body);
  const { nombre, especie, edad, sexo, descripcion, numero_contacto, cod_refugio, imagen_url } = req.body;

  // Verifica que imagen_url no sea undefined o null
  console.log('URL de la imagen recibida:', imagen_url);

  if (!nombre || !especie || !edad || !sexo || !numero_contacto || !cod_refugio) {
    return res.status(400).json({ message: 'Faltan campos requeridos' });
  }

  try {
    const [result] = await pool.execute(
      'INSERT INTO mascotas_disponibles (nombre, especie, edad, sexo, descripcion, numero_contacto, cod_refugio, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, NULLIF(?, ""))',
      [nombre, especie, edad, sexo, descripcion, numero_contacto, cod_refugio, imagen_url]
    );
    console.log('Resultado de la inserción:', result);
    res.status(201).json({ message: 'Mascota lista para adopción', id: result.insertId });
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    res.status(500).json({ message: 'Error al procesar la solicitud', error: error.message });
  }
});
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path);
    console.log('Resultado de Cloudinary:', result);
    res.json({ url: result.secure_url });
  } catch (error) {
    console.error('Error al subir la imagen:', error);
    res.status(500).json({ error: 'Error al subir la imagen' });
  }
});
app.get('/api/mascotas', async (req, res) => {
  try {
    const query = `
      SELECT 
        md.id, 
        md.nombre, 
        md.especie, 
        md.edad, 
        md.sexo, 
        md.descripcion, 
        md.numero_contacto, 
        md.cod_refugio,
        md.imagen_url,
        r.nombre AS nombre_refugio
      FROM 
        mascotas_disponibles md
      LEFT JOIN 
        refugios r ON md.cod_refugio = r.cod_refugio
    `;

    const [rows] = await pool.query(query);
    console.log('Query SQL ejecutada:', query);
    console.log('Número de filas recuperadas:', rows.length);
    console.log('Primera fila de datos:', rows[0]);
    console.log('Todas las mascotas recuperadas:', JSON.stringify(rows, null, 2));
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas:', error);
    res.status(500).json({ message: 'Error al obtener mascotas', error: error.message });
  }
});
app.get('/api/mascotas/recientes', async (req, res) => {
  console.log('Recibida solicitud para /api/mascotas/recientes');
  try {
    const query = `
      SELECT 
        id, 
        nombre, 
        imagen_url
      FROM 
        mascotas_disponibles
      ORDER BY 
        id DESC
      LIMIT 10
    `;
    console.log('Ejecutando query:', query);

    const [rows] = await pool.query(query);
    console.log('Mascotas recientes recuperadas:', JSON.stringify(rows, null, 2));
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener mascotas recientes:', error);
    res.status(500).json({ message: 'Error al obtener mascotas recientes', error: error.message });
  }
});
app.put('/api/mascotas/:id', async (req, res) => {
  const { id } = req.params;
  const { nombre, especie, edad, sexo, descripcion, numero_contacto, cod_refugio, imagen_url } = req.body;

  try {
    await pool.execute(
      'UPDATE mascotas_disponibles SET nombre = ?, especie = ?, edad = ?, sexo = ?, descripcion = ?, numero_contacto = ?, cod_refugio = ?, imagen_url = ? WHERE id = ?',
      [nombre, especie, edad, sexo, descripcion, numero_contacto, cod_refugio, imagen_url, id]
    );

    res.json({ message: 'Mascota actualizada con éxito' });
  } catch (error) {
    console.error('Error al actualizar mascota:', error);
    res.status(500).json({ message: 'Error al actualizar mascota', error: error.message });
  }
});

app.delete('/api/mascotas/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.execute('DELETE FROM mascotas_disponibles WHERE id = ?', [id]);
    res.json({ message: 'Mascota eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({ message: 'Error al eliminar mascota', error: error.message });
  }
});
app.get('/api/refugios/codigos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT cod_refugio FROM refugios ORDER BY cod_refugio');
    const codigos = rows.map(row => row.cod_refugio);
    res.json(codigos);
  } catch (error) {
    console.error('Error al obtener códigos de refugio:', error);
    res.status(500).json({ message: 'Error al obtener códigos de refugio', error: error.message });
  }
});

app.get('/api/mascotas/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await pool.query('SELECT * FROM mascotas_disponibles WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.json(rows[0]);
    } else {
      res.status(404).json({ message: 'Mascota no encontrada' });
    }
  } catch (error) {
    console.error('Error al obtener mascota por ID:', error);
    res.status(500).json({ message: 'Error al obtener mascota', error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
// Sirve los archivos estáticos desde el directorio 'build'
app.use(express.static(path.join(__dirname, 'build')));

// Maneja cualquier solicitud que no sea para archivos estáticos
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});
