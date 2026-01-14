const http = require('http');

// 1. Datos que vamos a enviar (Simulando el formulario)
const data = JSON.stringify({
  names: "Prueba",
  lastNames: "Usuario",
  email: "prueba@test.com", // Cambia esto si ya existe
  password: "password123",
  phone: "999888777"
});

// 2. Configuración del envío (Aquí forzamos el Header correcto)
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/auth/register',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json', // <--- ¡ESTA ES LA CLAVE QUE FALTABA!
    'Content-Length': data.length
  }
};

// 3. Enviar la petición
const req = http.request(options, (res) => {
  console.log(`Estado: ${res.statusCode}`);
  
  res.on('data', (d) => {
    console.log('Respuesta del Servidor:');
    process.stdout.write(d);
    console.log('\n');
  });
});

req.on('error', (error) => {
  console.error('Error:', error);
});

req.write(data);
req.end();