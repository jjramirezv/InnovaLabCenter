import { useState } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaFacebook, FaGoogle } from "react-icons/fa";
import '../Auth.css';
import FacebookLogin from '@greatsumini/react-facebook-login';
function RegisterPage() {
    const [formData, setFormData] = useState({
        names: '', lastNames: '', email: '', password: '', phone: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    // 1. REGISTRO MANUAL
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await axios.post('/auth/register', formData);
            alert('Cuenta creada exitosamente. Por favor inicia sesión.');
            navigate('/login');
        } catch (err) {
            setError(err.response?.data?.message || 'Error al procesar el registro');
        }
    };

    // 2. REGISTRO CON GOOGLE (HOOK)
    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );
                
                const res = await axios.post('/auth/google', {
                    email: userInfo.data.email,
                    names: userInfo.data.given_name,
                    lastNames: userInfo.data.family_name,
                    googleId: userInfo.data.sub
                });

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                navigate('/home');
            } catch (err) {
                console.error(err);
                setError('Error al registrarse con Google');
            }
        },
        onError: () => setError('Falló el registro con Google')
    });
        const responseFacebook = async (response) => {
        if (response.accessToken) {
            try {
                // Enviar al Backend de InnovaLab
                // Facebook separa el nombre en response.name, 
                // pero para ser más precisos con nombres/apellidos:
                const names = response.name.split(' ')[0];
                const lastNames = response.name.split(' ').slice(1).join(' ');

                const res = await axios.post('/auth/facebook', {
                    email: response.email,
                    names: names,
                    lastNames: lastNames || ' ',
                    facebookId: response.id
                });

                // Guardamos datos localmente
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

                // Redirección inteligente
                redirectUser(res.data.user);

            } catch (err) {
                console.error(err);
                setError('Error al registrar la cuenta con Facebook');
            }
        } else {
            setError('No se pudo autenticar con Facebook');
        }
    };


    return (
        <div className="auth-container">
            <div className="auth-card" style={{ maxWidth: '500px' }}>
                <div className="auth-header">
                    <h1>Crear Cuenta</h1>
                    <p>Únete a la comunidad de InnovaLab Center</p>
                </div>

                {error && <div className="error-banner">{error}</div>}

                {/* BOTONES SOCIALES */}
                <div className="social-buttons-container">
                    <button type="button" className="social-btn google" onClick={() => googleLogin()}>
                        <FaGoogle className="icon" /> Registrarse con Google
                    </button>
                    
                    <FacebookLogin
                        appId="1547391983151344" 
                        autoLoad={false}
                        fields="name,email,picture"
                        callback={responseFacebook}
                        render={renderProps => (
                            <button type="button" className="social-btn facebook" onClick={renderProps.onClick}>
                                <FaFacebook className="icon" /> Continuar con Facebook
                            </button>
                        )}
                    />
                </div>

                <div className="divider">
                    <span>o completa tus datos manualmente</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Nombres</label>
                            <input type="text" name="names" className="form-input" required onChange={handleChange} />
                        </div>
                        <div className="form-group" style={{ flex: 1 }}>
                            <label>Apellidos</label>
                            <input type="text" name="lastNames" className="form-input" required onChange={handleChange} />
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input type="email" name="email" className="form-input" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Celular</label>
                        <input type="tel" name="phone" className="form-input" required onChange={handleChange} />
                    </div>

                    <div className="form-group">
                        <label>Contraseña</label>
                        <input type="password" name="password" className="form-input" placeholder="Mínimo 6 caracteres" required onChange={handleChange} />
                    </div>
                    
                    <button type="submit" className="btn-primary">Registrarse</button>
                </form>

                <div className="auth-footer">
                    ¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link>
                </div>
                <div style={{textAlign: 'center', marginTop: '15px'}}>
                    <Link to="/" style={{fontSize: '0.8rem', color: '#999', textDecoration: 'none'}}>← Volver al inicio</Link>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;