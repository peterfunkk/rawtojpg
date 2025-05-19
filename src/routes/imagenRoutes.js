const express = require('express');
const router = express.Router();
const multer = require('multer');
const { subirYConvertir, listarImagenes, descargar } = require('../controllers/imagenController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.array('imagenes'), subirYConvertir);
router.get('/imagenes', listarImagenes);
router.get('/descargar/:id', descargar);

module.exports = router;
