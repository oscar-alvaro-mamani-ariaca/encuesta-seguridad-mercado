const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos del frontend (para producción)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../build')));
  app.use(express.static(path.join(__dirname, '../../public')));
}

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Conectado a MongoDB Atlas'))
.catch(err => console.error('❌ Error de conexión:', err));

// Definir el esquema de la encuesta
const surveySchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  puesto: { type: String, required: true },
  telefono: String,
  fecha: String,
  hora: String,
  seguridadGeneral: { type: String, required: true },
  presenciaSerenazgo: { type: String, required: true },
  frecuenciaSerenazgo: String,
  iluminacionGeneral: { type: String, required: true },
  zonasOscuras: [String],
  camarasFuncionando: { type: String, required: true },
  ubicacionCamaras: String,
  problemasEspecificos: [String],
  incidentesReportados: String,
  tiempoRespuesta: { type: String, required: true },
  capacitacionSeguridad: { type: String, required: true },
  sugerenciaMejora: String,
  calificacionGeneral: { type: String, required: true },
  confianzaAdministracion: { type: String, required: true },
  participacionComerciantes: { type: String, required: true },
  comentariosAdicionales: String
}, {
  timestamps: true // Genera automáticamente createdAt y updatedAt
});

const Respuesta = mongoose.model('Respuesta', surveySchema);

// Esquema y modelo de usuario (administrador)
const userSchema = new mongoose.Schema({
  usuario: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }, // En producción debería estar hasheado
  fechaRegistro: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Middleware para logging en producción
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
  });
}

// Ruta de salud del servidor
app.get('/api/health', (req, res) => {
  res.status(200).json({ 
    message: '🟢 Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Ruta para recibir las respuestas
app.post('/api/respuestas', async (req, res) => {
  try {
    console.log('📝 Nueva encuesta recibida:', req.body.nombre);
    
    // Validación básica
    if (!req.body.nombre || !req.body.puesto) {
      return res.status(400).json({ 
        error: 'Nombre y puesto son campos obligatorios' 
      });
    }

    const nuevaRespuesta = new Respuesta(req.body);
    await nuevaRespuesta.save();
    
    console.log('✅ Encuesta guardada exitosamente');
    res.status(201).json({ 
      mensaje: 'Respuesta guardada correctamente',
      id: nuevaRespuesta._id
    });
  } catch (err) {
    console.error('❌ Error al guardar la respuesta:', err);
    res.status(500).json({ 
      error: 'Error al guardar la respuesta', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }
});

// Ruta para obtener todas las respuestas
app.get('/api/respuestas', async (req, res) => {
  try {
    console.log('📊 Solicitando todas las respuestas');
    const respuestas = await Respuesta.find({}).sort({ createdAt: -1 });
    
    console.log(`📋 Enviando ${respuestas.length} respuestas`);
    res.status(200).json(respuestas);
  } catch (err) {
    console.error('❌ Error al obtener respuestas:', err);
    res.status(500).json({ 
      error: 'Error al obtener respuestas', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }
});

// Ruta para obtener estadísticas básicas
app.get('/api/estadisticas', async (req, res) => {
  try {
    const totalEncuestas = await Respuesta.countDocuments();
    const ultimaSemana = await Respuesta.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    });
    
    res.status(200).json({
      total: totalEncuestas,
      ultimaSemana: ultimaSemana,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('❌ Error al obtener estadísticas:', err);
    res.status(500).json({ 
      error: 'Error al obtener estadísticas', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }
});

// Ruta para login de administrador
app.post('/api/login', async (req, res) => {
  const { usuario, password } = req.body;
  
  try {
    console.log('🔐 Intento de login para usuario:', usuario);
    
    if (!usuario || !password) {
      return res.status(400).json({ mensaje: 'Usuario y contraseña son obligatorios' });
    }
    
    const user = await User.findOne({ usuario });
    if (!user || user.password !== password) { // En producción usar bcrypt
      console.log('❌ Credenciales incorrectas para:', usuario);
      return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
    }
    
    console.log('✅ Login exitoso para:', usuario);
    res.status(200).json({ 
      mensaje: 'Login exitoso', 
      user: { 
        usuario: user.usuario, 
        email: user.email,
        fechaRegistro: user.fechaRegistro
      } 
    });
  } catch (err) {
    console.error('❌ Error en login:', err);
    res.status(500).json({ 
      error: 'Error en el servidor',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
    });
  }
});

// Ruta para registrar nuevo administrador
app.post('/api/register', async (req, res) => {
  const { token, usuario, email, password } = req.body;

  try {
    console.log('📝 Intento de registro para usuario:', usuario);
    
    // Validar token de autorización
    if (token !== process.env.ADMIN_REGISTER_TOKEN) {
      console.log('❌ Token de autorización inválido');
      return res.status(403).json({ mensaje: 'Token de autorización inválido' });
    }
    
    // Validaciones básicas
    if (!usuario || !email || !password) {
      return res.status(400).json({ mensaje: 'Todos los campos son obligatorios' });
    }
    
    if (password.length < 8) {
      return res.status(400).json({ mensaje: 'La contraseña debe tener al menos 8 caracteres' });
    }
    
    if (usuario.length < 4) {
      return res.status(400).json({ mensaje: 'El usuario debe tener al menos 4 caracteres' });
    }

    const newUser = new User({ usuario, email, password }); // En producción hashear password
    await newUser.save();
    
    console.log('✅ Administrador registrado exitosamente:', usuario);
    res.status(201).json({ mensaje: 'Administrador registrado exitosamente' });
  } catch (err) {
    console.error('❌ Error al registrar administrador:', err);
    if (err.code === 11000) { // Error de duplicado
      const field = Object.keys(err.keyPattern)[0];
      return res.status(409).json({ 
        mensaje: `${field === 'usuario' ? 'Usuario' : 'Email'} ya existe` 
      });
    }
    res.status(500).json({ 
      error: 'Error al registrar administrador', 
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }
});

// Ruta para eliminar una respuesta específica (opcional)
app.delete('/api/respuestas/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const respuesta = await Respuesta.findByIdAndDelete(id);
    
    if (!respuesta) {
      return res.status(404).json({ mensaje: 'Respuesta no encontrada' });
    }
    
    console.log('🗑️ Respuesta eliminada:', id);
    res.status(200).json({ mensaje: 'Respuesta eliminada correctamente' });
  } catch (err) {
    console.error('❌ Error al eliminar respuesta:', err);
    res.status(500).json({ 
      error: 'Error al eliminar respuesta',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }
});

// Ruta para eliminar todas las respuestas (usar con cuidado)
app.delete('/api/respuestas', async (req, res) => {
  try {
    const result = await Respuesta.deleteMany({});
    console.log('🗑️ Todas las respuestas eliminadas:', result.deletedCount);
    res.status(200).json({ 
      mensaje: `${result.deletedCount} respuestas eliminadas correctamente` 
    });
  } catch (err) {
    console.error('❌ Error al eliminar todas las respuestas:', err);
    res.status(500).json({ 
      error: 'Error al eliminar respuestas',
      details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno del servidor'
    });
  }
});

// Ruta para servir la aplicación React en producción
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../../build', 'index.html'));
  });
}

// Manejo de errores 404 para rutas API
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('💥 Error no manejado:', err);
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: process.env.NODE_ENV === 'development' ? err.message : 'Error interno'
  });
});

// Puerto dinámico para producción
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Servidor corriendo en ${HOST}:${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Base de datos: ${process.env.MONGODB_URI ? 'MongoDB Atlas conectada' : 'Sin configurar'}`);
});

// Manejo de cierre graceful
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recibido. Cerrando servidor gracefully...');
  mongoose.connection.close(() => {
    console.log('📴 Conexión a MongoDB cerrada.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT recibido. Cerrando servidor gracefully...');
  mongoose.connection.close(() => {
    console.log('📴 Conexión a MongoDB cerrada.');
    process.exit(0);
  });
});