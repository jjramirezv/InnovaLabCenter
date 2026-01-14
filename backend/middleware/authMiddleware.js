const jwt = require('jsonwebtoken');

exports.verifyToken = (req, res, next) => {
    const tokenHeader = req.headers['authorization'];
    
    // DEBUG: Ver si llega el token
    console.log("--- MIDDLEWARE AUTH ---");
    console.log("1. Token recibido:", tokenHeader ? "Sí" : "No");

    if (!tokenHeader) {
        return res.status(403).json({ message: 'No se proporcionó token' });
    }

    try {
        const cleanToken = tokenHeader.replace('Bearer ', '');
        const decoded = jwt.verify(cleanToken, process.env.JWT_SECRET);
        
        req.user = decoded;
        console.log("2. Usuario decodificado ID:", req.user.id);
        console.log("3. Rol detectado:", req.user.role); // <--- ESTO ES LO IMPORTANTE
        
        next();
    } catch (error) {
        console.log("Error de Token:", error.message);
        return res.status(401).json({ message: 'Token inválido' });
    }
};

exports.verifyAdmin = (req, res, next) => {
    console.log("--- VERIFICANDO ADMIN ---");
    console.log("Rol del usuario:", req.user?.role);

    if (req.user && req.user.role === 'admin') {
        console.log("ACCESO CONCEDIDO ✅");
        next();
    } else {
        console.log("ACCESO DENEGADO ❌");
        return res.status(403).json({ message: 'Requiere ser Admin. Tu rol actual es: ' + req.user?.role });
    }
};