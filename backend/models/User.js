const db = require('../config/db');

class User {
    static async create(userData) {
        const { names, lastNames, email, password, phone } = userData;
        // Por defecto rol 'estudiante' y auth_provider 'local'
        const sql = `
            INSERT INTO users (nombres, apellidos, email, password, celular, rol, auth_provider) 
            VALUES (?, ?, ?, ?, ?, 'estudiante', 'local')
        `;
        const [result] = await db.execute(sql, [names, lastNames, email, password, phone]);
        return result;
    }

    static async findByEmail(email) {
        const sql = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await db.execute(sql, [email]);
        return rows[0];
    }
}

module.exports = User;