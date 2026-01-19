const db = require('../config/db');

// 1. OBTENER RECURSOS DE UN CURSO 
exports.getResourcesByCourse = async (req, res) => {
    try {
        const { courseId } = req.params;
        const cleanId = courseId.replace(':', '');

        const [rows] = await db.query(
            'SELECT * FROM resources WHERE course_id = ? ORDER BY created_at DESC', 
            [cleanId]
        );
        res.json(rows);
    } catch (error) {
        console.error("Error al obtener recursos:", error);
        res.status(500).json({ message: 'Error al obtener recursos' });
    }
};

// 2. AGREGAR RECURSO (Archivo Cloudinary o Link Externo)
exports.addResource = async (req, res) => {
    try {
        const { courseId } = req.params;
        const cleanId = courseId.replace(':', '');
        const { titulo, tipo, url_externa, descripcion } = req.body; 

        let urlFinal = '';

        // Lógica para Cloudinary:
        if (tipo === 'archivo') {
            if (!req.file) {
                return res.status(400).json({ message: 'Debes seleccionar un archivo para subir.' });
            }
            urlFinal = req.file.path; 
        } else {
            if (!url_externa) {
                return res.status(400).json({ message: 'Debes ingresar una URL válida.' });
            }
            urlFinal = url_externa;
        }

        await db.execute(
            'INSERT INTO resources (course_id, titulo, tipo, url_recurso, descripcion) VALUES (?, ?, ?, ?, ?)',
            [cleanId, titulo, tipo, urlFinal, descripcion]
        );

        res.status(201).json({ message: 'Recurso guardado permanentemente en la nube' });

    } catch (error) {
        console.error("Error en addResource:", error);
        res.status(500).json({ message: 'Error interno al guardar el recurso' });
    }
};

// 3. ELIMINAR RECURSO 
exports.deleteResource = async (req, res) => {
    try {
        const { id } = req.params;
        const [result] = await db.execute('DELETE FROM resources WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Recurso no encontrado' });
        }

        res.json({ message: 'Recurso eliminado correctamente de la base de datos' });

    } catch (error) {
        console.error("Error al eliminar recurso:", error);
        res.status(500).json({ message: 'Error al eliminar el recurso' });
    }
};