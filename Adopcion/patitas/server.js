const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '0381',
  database: 'adopcion_patitas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const [rows] = await pool.execute(
      'SELECT * FROM Usuario_Administrador WHERE nombre_usuario = ?',
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
      'INSERT INTO Mascotas_Disponibles (nombre, especie, edad, sexo, descripcion, numero_contacto, cod_refugio, imagen_url) VALUES (?, ?, ?, ?, ?, ?, ?, NULLIF(?, ""))',
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
        Mascotas_Disponibles md
      LEFT JOIN 
        Refugios r ON md.cod_refugio = r.cod_refugio
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
      'UPDATE Mascotas_Disponibles SET nombre = ?, especie = ?, edad = ?, sexo = ?, descripcion = ?, numero_contacto = ?, cod_refugio = ?, imagen_url = ? WHERE id = ?',
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
    await pool.execute('DELETE FROM Mascotas_Disponibles WHERE id = ?', [id]);
    res.json({ message: 'Mascota eliminada con éxito' });
  } catch (error) {
    console.error('Error al eliminar mascota:', error);
    res.status(500).json({ message: 'Error al eliminar mascota', error: error.message });
  }
});
app.get('/api/refugios/codigos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT DISTINCT cod_refugio FROM Refugios ORDER BY cod_refugio');
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
    const [rows] = await pool.query('SELECT * FROM Mascotas_Disponibles WHERE id = ?', [id]);
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

/*const express = require('express');
const multer = require('multer');
const path = require('path');
const mysql = require('mysql2/promise');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/') // Asegúrate de crear esta carpeta
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname))
  }
});

const upload = multer({ storage: storage }).array('imagenes', 2);

// Configuración de la base de datos
const pool = mysql.createPool({
  host: '127.0.0.1',
  user: 'root',
  password: '0381',
  database: 'adopcion_mascotas',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});
app.use('/uploads', express.static('uploads'));
// nueva mascota
app.post('/api/mascotas', upload, async (req, res) => {
  try {
    const { Nombre, Especie, Edad, Sexo, Descripcion, CodRefugio } = req.body;
    const connection = await pool.getConnection();
    
    const [result] = await connection.execute(
      'INSERT INTO Mascotas (Nombre, Especie, Edad, Sexo, Descripcion, CodRefugio) VALUES (?, ?, ?, ?, ?, ?)',
      [Nombre, Especie, Edad, Sexo, Descripcion, CodRefugio]
    );

    if (req.files && req.files.length > 0) {
      for (let file of req.files) {
        await connection.execute(
          'INSERT INTO Fotos (CodMascota, RutaFoto) VALUES (?, ?)',
          [result.insertId, file.path]
        );
      }
    }

    connection.release();
    res.status(201).json({ message: 'Mascota lista para adopcion', id: result.insertId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al subir la mascota' });
  }
});
// Otras rutas (GET, PUT, DELETE) aquí...

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));



*/