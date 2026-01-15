const User = require('../models/User'); // Asegúrate de que User.js tenga los métodos create y findByEmail
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Necesitamos acceso directo a la DB para actualizaciones manuales

// --- 1. REGISTRO LOCAL (Correo y Contraseña) ---
exports.register = async (req, res) => {
    console.log("Cuerpo recibido:", req.body);
    try {
        const { names, lastNames, email, password, phone } = req.body;

        // A. Verificar si ya existe
        const existingUser = await User.findByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'El correo ya está registrado' });
        }

        // B. Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // C. Guardar en BD (Asegurando auth_provider = 'local')
        // Nota: Si tu modelo User.create no soporta auth_provider, deberás agregarlo en la query INSERT del modelo.
        // Aquí asumimos que User.create maneja los campos que le pasas o que la DB tiene 'local' como default.
        await User.create({
            names,
            lastNames,
            email,
            password: hashedPassword,
            phone,
            auth_provider: 'local' 
        });

        res.status(201).json({ message: 'Usuario registrado exitosamente' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor al registrar' });
    }
};

// --- 2. LOGIN LOCAL ---
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // A. Buscar usuario
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        // B. Verificar si es usuario de Google (sin contraseña)
        if (!user.password) {
            return res.status(400).json({ 
                message: 'Esta cuenta se creó con Google. Por favor inicia sesión con el botón de Google.' 
            });
        }

        // C. Comparar contraseña
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Contraseña incorrecta' });
        }

        // D. Generar Token
        const token = jwt.sign(
            { id: user.id, role: user.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Login exitoso',
            token,
            user: {
                id: user.id,
                names: user.nombres,
                role: user.rol,
                auth_provider: user.auth_provider || 'local' // Enviamos esto para el frontend
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en el servidor' });
    }
};

// --- 3. LOGIN CON GOOGLE (CORREGIDO Y MEJORADO) ---
// --- 3. LOGIN CON GOOGLE (CORREGIDO SIN IMAGEN DE PERFIL) ---
exports.googleLogin = async (req, res) => {
    try {
        // Quitamos "imagen" de la recepción de datos
        const { email, names, lastNames } = req.body; 

        // A. Buscamos si el usuario ya existe
        let user = await User.findByEmail(email);

        if (user) {
            // CASO 1: USUARIO EXISTE
            if (user.auth_provider !== 'google') {
                try {
                    await db.query('UPDATE users SET auth_provider = ? WHERE id = ?', ['google', user.id]);
                    user.auth_provider = 'google';
                } catch (updateError) {
                    console.error("No se pudo actualizar auth_provider:", updateError);
                }
            }
        } else {
            // CASO 2: USUARIO NUEVO
            // Eliminamos "imagen_perfil" de la lista de columnas y de los VALUES
            const [result] = await db.query(
                `INSERT INTO users 
                (nombres, apellidos, email, password, rol, auth_provider, created_at, is_verified) 
                VALUES (?, ?, ?, NULL, 'estudiante', 'google', NOW(), 1)`,
                [names, lastNames, email]
            );

            user = {
                id: result.insertId,
                nombres: names,
                apellidos: lastNames,
                email: email,
                rol: 'estudiante',
                auth_provider: 'google'
            };
        }

        // B. Generamos el Token
        const token = jwt.sign(
            { id: user.id, role: user.rol || 'estudiante' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '1d' }
        );

        // C. Respondemos al Frontend (Sin enviar imagen_perfil)
        res.json({
            message: 'Login con Google exitoso',
            token,
            user: {
                id: user.id,
                names: `${user.nombres} ${user.apellidos}`,
                role: user.rol || 'estudiante',
                auth_provider: 'google'
            }
        });

    } catch (error) {
        console.error("Error en googleLogin:", error);
        res.status(500).json({ message: 'Error en el servidor con Google' });
    }
};