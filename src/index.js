const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

const app = express();
const PORT = 3000;

// Definir rutas absolutas para 'uploads' y 'converted'
const uploadsPath = path.join(__dirname, '../uploads');
const convertedPath = path.join(__dirname, '../converted');

// Asegurarse de que las carpetas existan
['uploads', 'converted'].forEach(dir => {
  const dirPath = dir === 'uploads' ? uploadsPath : convertedPath;
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath);
  }
});

// Configuración de multer con un límite de 200 archivos por solicitud
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsPath),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname),
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/x-canon-cr2', 'image/x-nikon-nef'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Archivo no permitido'), false);
  }
};

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedExtensions = ['.cr2', '.nef', '.dng', '.raw'];
    const ext = path.extname(file.originalname).toLowerCase();

    if (!allowedExtensions.includes(ext)) {
      console.warn(`Archivo ignorado por extensión: ${file.originalname}`);
      return cb(null, false); // ← NO lanza error, solo lo ignora
    }

    cb(null, true);
  }
});

app.use(express.static(path.join(__dirname, 'public')));

// Ruta para subir y convertir RAW a JPG
app.post('/upload', upload.array('imagenes', 200), (req, res) => {
  try {
    const convertedPaths = [];
    const failedFiles = [];

    for (const file of req.files) {
      const inputPath = file.path;
      const outputFilename = path.basename(file.filename, path.extname(file.filename)) + '.jpg';
      const outputPath = path.join(convertedPath, outputFilename);

      // Usar ImageMagick para convertir el archivo
      exec(`magick convert "${inputPath}" "${outputPath}"`, (err, stdout, stderr) => {
        if (err) {
          console.error(`Error al convertir ${file.originalname}: ${stderr}`);
          failedFiles.push(file.originalname);
        } else {
          convertedPaths.push(outputFilename);
        }

        // Al final, si todos los archivos han sido procesados, enviamos la respuesta
        if (convertedPaths.length + failedFiles.length === req.files.length) {
          let response = '';
          if (convertedPaths.length > 0) {
            response += `Imágenes convertidas correctamente: <br>${convertedPaths.join('<br>')}`;
          }
          if (failedFiles.length > 0) {
            response += `<br><br>Los siguientes archivos no pudieron ser convertidos: <br>${failedFiles.join('<br>')}`;
          }
          res.send(response);
        }
      });
    }
  } catch (error) {
    console.error('Error al procesar las imágenes:', error);
    res.status(500).send('Hubo un error al procesar las imágenes.');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
