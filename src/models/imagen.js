const mongoose = require('mongoose');

const imagenSchema = new mongoose.Schema({
  original: String, // Nombre original del archivo
  filename: String, // Nombre del archivo generado
  estado: { type: String, default: 'convertido' }, // Estado de la imagen
  convertido: Buffer, // El archivo convertido se almacenará como un buffer
  contentType: String, // Tipo de contenido, por ejemplo, 'image/jpeg'
  fecha: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Imagen', imagenSchema);
