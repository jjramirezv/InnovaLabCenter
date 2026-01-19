const express = require('express');
const router = express.Router();
const resourceController = require('../controllers/resourceController');
const upload = require('../middleware/upload');

// Rutas
router.get('/course/:courseId', resourceController.getResourcesByCourse);

// Nota: 'archivo' es el nombre del campo que se enviará desde el formulario frontend
router.post('/course/:courseId', upload.single('archivo'), resourceController.addResource);

router.delete('/:id', resourceController.deleteResource);

module.exports = router;