const db = require('../config/db');
const bcrypt = require('bcrypt');

exports.getProfile = async (req, res) => {
    try {
        // Quitamos imagen_perfil del SELECT por limpieza
        const [user] = await db.query(
            'SELECT id, nombres, apellidos, email, auth_provider FROM users WHERE id = ?', 
            [req.user.id]
        );
        res.json(user[0]);
    } catch (error) {
        res.status(500).json({ message: 'Error al cargar perfil' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const userId = req.user.id;
        const { nombres, apellidos, newPassword } = req.body;

        const [userData] = await db.query('SELECT cambios_clave_count, ultimo_cambio_clave FROM users WHERE id = ?', [userId]);
        let { cambios_clave_count, ultimo_cambio_clave } = userData[0];

        let sqlParts = ['nombres = ?', 'apellidos = ?'];
        let params = [nombres, apellidos];

        if (newPassword && newPassword.trim().length > 0) {
            if (newPassword.length < 6) {
                return res.status(400).json({ message: 'La contraseña debe tener al menos 6 caracteres.' });
            }

            const ahora = new Date();
            const unDiaatras = new Date(ahora.getTime() - (24 * 60 * 60 * 1000));
            
            if (ultimo_cambio_clave && new Date(ultimo_cambio_clave) > unDiaatras) {
                if (cambios_clave_count >= 3) {
                    return res.status(429).json({ message: 'Límite de seguridad alcanzado.' });
                }
                cambios_clave_count += 1;
            } else {
                cambios_clave_count = 1;
            }

            const hashedPass = await bcrypt.hash(newPassword, 10);
            sqlParts.push('password = ?', 'cambios_clave_count = ?', 'ultimo_cambio_clave = NOW()');
            params.push(hashedPass, cambios_clave_count);
        }

        // ELIMINADA la lógica de req.file

        params.push(userId);
        const finalSql = `UPDATE users SET ${sqlParts.join(', ')} WHERE id = ?`;
        
        await db.execute(finalSql, params);
        res.json({ message: 'Perfil actualizado correctamente' });

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: 'Error interno' });
    }
};