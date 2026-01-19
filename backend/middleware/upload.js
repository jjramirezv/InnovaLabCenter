const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// 1. Configuración de Cloudinary (ambientado para railway)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET
});

// 2. Configuración del almacenamiento en la nube
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'innovalab_cursos', // Esta carpeta se creará sola en tu Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'avif'], // Formatos permitidos
    public_id: (req, file) => Date.now() + '-' + file.originalname.split('.')[0], 
  },
});

// 3. Configuración final de Multer
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 50 }, // Se mantiene los 50MB
    fileFilter: function (req, file, cb) {
        cb(null, true);
    }
});

module.exports = upload;