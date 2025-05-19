const fs = require('fs');
const path = require('path');
const axios = require('axios');
const unzipper = require('unzipper');
const archiver = require('archiver');

exports.subirYConvertir = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No se enviaron archivos' });
    }

    // Preparamos FormData para enviarlo a Flask
    const FormData = require('form-data');
    const form = new FormData();
    req.files.forEach(file => {
      form.append('files', fs.createReadStream(file.path), file.originalname);
    });

    // Hacemos POST a Flask para la conversión, recibimos stream ZIP
    const flaskRes = await axios.post('http://localhost:5000/convert', form, {
      headers: form.getHeaders(),
      responseType: 'stream',
    });

    // Configuramos respuesta para enviar ZIP
    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': 'attachment; filename=imagenes_convertidas.zip'
    });

    // Creamos un archivo zip en memoria para reenviar los JPG
    const archive = archiver('zip');
    archive.pipe(res);

    // Extraemos el ZIP que nos envía Flask para filtrar solo JPGs y agregar a nuestro ZIP
    flaskRes.data
      .pipe(unzipper.Parse())
      .on('entry', async (entry) => {
        const filename = entry.path;
        const ext = path.extname(filename).toLowerCase();

        if (ext === '.jpg') {
          // Añadimos directamente el contenido del entry al zip
          archive.append(entry, { name: filename });
        } else {
          entry.autodrain();
        }
      })
      .on('close', () => {
        // Al terminar la lectura del ZIP de Flask, finalizamos nuestro ZIP
        archive.finalize();

        // Limpiamos archivos temporales
        req.files.forEach(file => {
          try {
            fs.unlinkSync(file.path);
          } catch (e) {
            console.warn('No se pudo borrar archivo temporal:', file.path);
          }
        });
      })
      .on('error', (err) => {
        console.error('Error al procesar ZIP de Flask:', err);
        res.status(500).json({ error: 'Error al procesar el ZIP de conversión' });
      });

  } catch (err) {
    console.error('Error al comunicarse con Flask:', err.message);
    res.status(500).json({ error: 'Fallo la comunicación con el servidor de conversión' });
  }
};




exports.listarImagenes = async (req, res) => {
  try {
    const imagenes = await Imagen.find({ estado: 'convertido' }).sort({ fecha: -1 });
    res.json(imagenes);
  } catch (err) {
    console.error('Error al obtener imágenes:', err);
    res.status(500).json({ error: 'Error al obtener imágenes' });
  }
};

exports.descargar = async (req, res) => {
  try {
    const imagen = await Imagen.findById(req.params.id);
    if (!imagen || !imagen.convertido) {
      return res.status(404).send('Imagen no encontrada o no convertida');
    }

    res.set('Content-Type', imagen.contentType);
    res.set('Content-Disposition', `attachment; filename="${imagen.original}.jpg"`);
    res.send(imagen.convertido); // Enviar la imagen almacenada en MongoDB
  } catch (err) {
    res.status(500).send('Error al recuperar la imagen');
  }
};
