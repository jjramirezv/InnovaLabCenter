const multer = require('multer');
const path = require('path');

// 1. Configuración de dónde se guardan los archivos
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Los archivos se guardarán en la carpeta 'uploads' en la raíz del backend
        cb(null, 'uploads/'); 
    },
    filename: function (req, file, cb) {
        // Le damos un nombre único: fecha actual + extensión original (ej: 17823123.pdf)
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// 2. Configuración de límites y filtro
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50 }, // Límite de 50MB (ajustable)
    fileFilter: function (req, file, cb) {
        // Aceptamos cualquier archivo por ahora para evitar errores con PDFs, PPTs, etc.
        cb(null, true);
    }
});

module.exports = upload;