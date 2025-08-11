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

// Servir archivos estáticos del frontend (solo si existe la carpeta build)
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '../../build');
  const publicPath = path.join(__dirname, '../../public');
  
  // Verificar si existe la carpeta build
  try {
    if (require('fs').existsSync(buildPath)) {
      console.log('📁 Sirviendo archivos desde build/');
      app.use(express.static(buildPath));
    } else if (require('fs').existsSync(publicPath)) {
      console.log('📁 Sirviendo archivos desde public/');
      app.use(express.static(publicPath));
    } else {
      console.log('⚠️ No se encontraron carpetas build/ ni public/, solo API mode');
    }
  } catch (err) {
    console.log('⚠️ Error al verificar carpetas estáticas:', err.message);
  }
}

// Verificar que MONGODB_URI esté configurada
if (!process.env.MONGODB_URI) {
  console.error('❌ ERROR CRÍTICO: MONGODB_URI no está configurada');
  console.log('Variables de entorno disponibles:', Object.keys(process.env));
  process.exit(1);
}

console.log('🔍 MONGODB_URI detectada:', process.env.MONGODB_URI ? 'SÍ (oculta por seguridad)' : 'NO');

// Conexión a MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('✅ Conectado a MongoDB Atlas exitosamente');
  console.log('📊 Base de datos:', mongoose.connection.db.databaseName);
})
.catch(err => {
  console.error('❌ Error de conexión a MongoDB:', err.message);
  console.error('🔍 MONGODB_URI value:', process.env.MONGODB_URI);
  process.exit(1);
});

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

// Ruta de salud del servidor (con más detalles)
app.get('/api/health', (req, res) => {
  const healthCheck = {
    message: '🟢 Servidor funcionando correctamente',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    mongodb: mongoose.connection.readyState === 1 ? 'Conectado' : 'Desconectado',
    mongoState: mongoose.connection.readyState,
    port: process.env.PORT,
    nodeVersion: process.version
  };
  
  console.log('🏥 Health check solicitado:', healthCheck);
  res.status(200).json(healthCheck);
});

// Ruta para recibir las respuestas
app.post('/api/respuestas', async (req, res) => {
  try {
    console.log('📝 Nueva encuesta recibida - Iniciando proceso...');
    console.log('📋 Datos recibidos:', JSON.stringify(req.body, null, 2));
    
    // Validación básica
    if (!req.body.nombre || !req.body.puesto) {
      console.log('❌ Validación fallida: falta nombre o puesto');
      return res.status(400).json({ 
        error: 'Nombre y puesto son campos obligatorios' 
      });
    }

    console.log('✅ Validación básica pasada, creando nueva respuesta...');
    const nuevaRespuesta = new Respuesta(req.body);
    console.log('✅ Objeto Respuesta creado, guardando en BD...');
    
    await nuevaRespuesta.save();
    
    console.log('✅ Encuesta guardada exitosamente con ID:', nuevaRespuesta._id);
    res.status(201).json({ 
      mensaje: 'Respuesta guardada correctamente',
      id: nuevaRespuesta._id
    });
  } catch (err) {
    console.error('❌ Error detallado al guardar la respuesta:');
    console.error('❌ Error message:', err.message);
    console.error('❌ Error name:', err.name);
    console.error('❌ Error stack:', err.stack);
    
    if (err.name === 'ValidationError') {
      console.error('❌ Errores de validación:', err.errors);
      return res.status(400).json({
        error: 'Error de validación',
        details: Object.keys(err.errors).map(key => ({
          field: key,
          message: err.errors[key].message
        }))
      });
    }
    
    res.status(500).json({ 
      error: 'Error al guardar la respuesta', 
      details: err.message,
      errorName: err.name
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

// Ruta para servir la aplicación React en producción (solo si existe)
if (process.env.NODE_ENV === 'production') {
  app.get('*', (req, res) => {
    const buildPath = path.join(__dirname, '../../build', 'index.html');
    const publicPath = path.join(__dirname, '../../public', 'index.html');
    
    // Verificar si existe el archivo HTML
    try {
      if (require('fs').existsSync(buildPath)) {
        res.sendFile(buildPath);
      } else if (require('fs').existsSync(publicPath)) {
        res.sendFile(publicPath);
      } else {
        // Si no existe frontend, devolver mensaje de API
        res.status(200).json({
          message: '🚀 API funcionando correctamente',
          note: 'Esta es una API backend. Frontend no configurado.',
          availableEndpoints: [
            'GET /api/health',
            'GET /api/respuestas', 
            'POST /api/respuestas',
            'POST /api/login',
            'POST /api/register'
          ]
        });
      }
    } catch (err) {
      console.error('Error al servir archivo HTML:', err);
      res.status(500).json({ error: 'Error al servir la aplicación' });
    }
  });
} else {
  // En desarrollo, solo mostrar info de API
  app.get('*', (req, res) => {
    res.status(200).json({
      message: '🚀 API en modo desarrollo',
      availableEndpoints: [
        'GET /api/health',
        'GET /api/respuestas', 
        'POST /api/respuestas',
        'POST /api/login',
        'POST /api/register'
      ]
    });
  });
}

// Manejo de errores 404 para rutas API
app.use('/api/*', (req, res) => {
  res.status(404).json({ 
    error: 'Ruta no encontrada',
    path: req.originalUrl 
  });
});

// Manejo global de errores (con logging detallado para debugging)
app.use((err, req, res, next) => {
  console.error('💥 Error no manejado:', err);
  console.error('💥 Stack trace:', err.stack);
  console.error('💥 Request URL:', req.originalUrl);
  console.error('💥 Request Method:', req.method);
  console.error('💥 Request Body:', req.body);
  
  res.status(500).json({ 
    error: 'Error interno del servidor',
    details: err.message, // Temporalmente mostrar siempre el error para debugging
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
});

// ⚠️ CRÍTICO: Configuración de puerto para Render
const PORT = process.env.PORT || 3001;

// ⚠️ CRÍTICO: Render requiere que escuches en 0.0.0.0 y usar callback que retorne el servidor
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
  console.log(`🌍 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📊 Base de datos: ${process.env.MONGODB_URI ? 'MongoDB Atlas conectada' : 'Sin configurar'}`);
  console.log(`🔗 Escuchando en todas las interfaces (0.0.0.0:${PORT})`);
  console.log(`🌐 Servidor listo para recibir conexiones en puerto ${PORT}`);
});

// ⚠️ CRÍTICO: Manejo correcto de cierre graceful para Mongoose 7.x+
process.on('SIGTERM', async () => {
  console.log('👋 SIGTERM recibido. Cerrando servidor gracefully...');
  
  try {
    // Cerrar el servidor HTTP primero
    server.close(() => {
      console.log('🔌 Servidor HTTP cerrado.');
    });
    
    // Cerrar conexión MongoDB sin callback (Mongoose 7.x+)
    await mongoose.connection.close();
    console.log('📴 Conexión a MongoDB cerrada.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre:', error);
    process.exit(1);
  }
});

process.on('SIGINT', async () => {
  console.log('👋 SIGINT recibido. Cerrando servidor gracefully...');
  
  try {
    // Cerrar el servidor HTTP primero
    server.close(() => {
      console.log('🔌 Servidor HTTP cerrado.');
    });
    
    // Cerrar conexión MongoDB sin callback (Mongoose 7.x+)
    await mongoose.connection.close();
    console.log('📴 Conexión a MongoDB cerrada.');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error durante el cierre:', error);
    process.exit(1);
  }
});

// ⚠️ Manejo de errores no capturados
process.on('unhandledRejection', (err) => {
  console.error('💥 Unhandled Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('💥 Uncaught Exception:', err);
  process.exit(1);
});