const express = require('express');
require('dotenv').config();
const multer = require('multer');
const path = require('path');
const mongoose = require('mongoose');
const imagenRoutes = require('./routes/imagenRoutes');  // Importar las rutas

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const { exec } = require('child_process');


// Conexión a la base de datos
mongoose.connect('mongodb://localhost:27017/rawtojpg', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Conectado a MongoDB');
}).catch(err => {
  console.error('Error de conexión a MongoDB:', err);
});

// Configuración de multer
app.use(imagenRoutes); 
// Rutas
app.use(express.static(path.join(__dirname, 'views')));  // Carpeta pública para archivos estáticos
 // Usar las rutas del controlador
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
