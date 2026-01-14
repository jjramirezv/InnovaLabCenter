// backend/controllers/resourceController.js
const db = require('../config/db');
const fs = require('fs');
const path = require('path');

// --- OBTENER RECURSOS DE UN CURSO ---
exports.getResourcesByCourse = async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM resources WHERE course_id = ? ORDER BY created_at DESC', [req.params.courseId]);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener recursos' });
    }
};

// --- AGREGAR RECURSO (Archivo o Link) ---
exports.addResource = async (req, res) => {
    try {
        const { courseId } = req.params;
        const { titulo, tipo, url_externa, descripcion } = req.body; // 'tipo' puede ser 'archivo' o 'link'

        let urlFinal = '';

        // Lógica: Si es archivo, usamos la ruta del upload. Si es link, usamos lo que mandó el usuario.
        if (tipo === 'archivo') {
            if (!req.file) return res.status(400).json({ message: 'Debes subir un archivo.' });
            urlFinal = `/uploads/${req.file.filename}`;
        } else {
            if (!url_externa) return res.status(400).json({ message: 'Debes ingresar una URL válida.' });
            urlFinal = url_externa;
        }

        await db.execute(
            'INSERT INTO resources (course_id, titulo, tipo, url_recurso, descripcion) VALUES (?, ?, ?, ?, ?)',
            [courseId, titulo, tipo, urlFinal, descripcion]
        );

        res.status(201).json({ message: 'Recurso agregado correctamente' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al guardar el recurso' });
    }
};

// --- ELIMINAR RECURSO ---
exports.deleteResource = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Obtener info para borrar archivo físico si existe
        const [rows] = await db.query('SELECT tipo, url_recurso FROM resources WHERE id = ?', [id]);
        
        if (rows.length > 0) {
            const resource = rows[0];
            
            // Si es un archivo local, intentamos borrarlo de la carpeta uploads
            if (resource.tipo === 'archivo') {
                const filePath = path.join(__dirname, '..', resource.url_recurso);
                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath); // Borrado físico
                }
            }
        }

        // 2. Borrar de base de datos
        await db.execute('DELETE FROM resources WHERE id = ?', [id]);
        res.json({ message: 'Recurso eliminado' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al eliminar recurso' });
    }
};