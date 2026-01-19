import { useState } from 'react';
import axios from '../api/axios';
import { Link, useNavigate } from 'react-router-dom';
import { useGoogleLogin } from '@react-oauth/google';
import { FaFacebook, FaGoogle } from "react-icons/fa";
import '../Auth.css';
import FacebookLogin from '@greatsumini/react-facebook-login';
function LoginPage() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const redirectUser = (user) => {
        if (user.role === 'admin') {
            navigate('/admin'); 
        } else {
            navigate('/home');  
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const response = await axios.post('/auth/login', formData);
            
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
            
            redirectUser(response.data.user);

        } catch (err) {
            setError(err.response?.data?.message || 'Credenciales incorrectas');
        }
    };

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

                redirectUser(res.data.user);

            } catch (err) {
                console.error(err);
                setError('Error al conectar con los servidores de Google');
            }
        },
        onError: () => setError('Falló el inicio de sesión con Google')
    });
    const responseFacebook = async (response) => {
        if (response.accessToken) {
            try {
                const names = response.name.split(' ')[0];
                const lastNames = response.name.split(' ').slice(1).join(' ');

                const res = await axios.post('/auth/facebook', {
                    email: response.email,
                    names: names,
                    lastNames: lastNames || ' ',
                    facebookId: response.id
                });

                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));

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
            <div className="auth-card">
                <div className="auth-header">
                    <h1>InnovaLab Center</h1>
                    <p>Portal de Acceso Educativo</p>
                </div>

                {error && <div className="error-banner">{error}</div>}

                <div className="social-buttons-container">
                    <button type="button" className="social-btn google" onClick={() => googleLogin()}>
                        <FaGoogle className="icon" /> Continuar con Google
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
                    <span>o ingresa con tu correo</span>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Correo Electrónico</label>
                        <input 
                            type="email" 
                            name="email" 
                            className="form-input" 
                            placeholder="ejemplo@correo.com"
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <div className="form-group">
                        <label>Contraseña</label>
                        <input 
                            type="password" 
                            name="password" 
                            className="form-input" 
                            placeholder="••••••••"
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    <button type="submit" className="btn-primary">Iniciar Sesión</button>
                </form>

                <div className="auth-footer">
                    ¿No tienes cuenta? <Link to="/register">Regístrate gratis</Link>
                </div>
                
                <div style={{textAlign: 'center', marginTop: '15px'}}>
                    <Link to="/" style={{fontSize: '0.8rem', color: '#999', textDecoration: 'none'}}>← Volver al inicio</Link>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;