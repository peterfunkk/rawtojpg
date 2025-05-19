// const multer = require('multer');

// // Almacenamiento en memoria para acceder a file.buffer
// const storage = multer.memoryStorage();

// const upload = multer({
//     storage: storage,
//     limits: { fileSize: 50 * 1024 * 1024 },  // Limite de 50MB
//   }).array('imagenes', 200); // Nombre del campo en el form

// module.exports = upload;