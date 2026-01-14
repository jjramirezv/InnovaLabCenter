import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaRobot, FaWifi, FaCube, FaEye, FaArrowRight, FaStar, 
    FaUserGraduate, FaChalkboardTeacher, FaCertificate, FaWhatsapp // <--- AGREGADO WHATSAPP
} from 'react-icons/fa';
import '../Auth.css'; 
import './LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();
    const [featuredCourses, setFeaturedCourses] = useState([]);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/300?text=Curso+InnovaLab';
        if (url.startsWith('http')) return url;
        return `http://localhost:3000${url}`;
    };

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const res = await axios.get('/courses');
                setFeaturedCourses(res.data.slice(0, 3));
            } catch (error) {
                console.error("Error cargando cursos home:", error);
            }
        };
        fetchCourses();
    }, []);

    return (
        <div className="landing-wrapper">
            {/* NAVBAR */}
            <nav className="lp-navbar">
                <div className="lp-logo">
                    <FaRobot className="logo-icon" /> InnovaLab Center
                </div>
                <div className="lp-nav-links">
                    <Link to="/home" className="lp-link">Catálogo</Link>
                    <Link to="/login" className="lp-btn-ghost">Ingresar</Link>
                    <Link to="/register" className="lp-btn-solid">Regístrate Gratis</Link>
                </div>
            </nav>

            {/* HERO SECTION MEJORADO */}
            <header className="lp-hero">
                <div className="lp-hero-content">
                    <div className="badge-new">🚀 Nueva Plataforma Educativa</div>
                    <h1>El Futuro de la <span className="text-gradient">Mecatrónica</span> está en tus manos</h1>
                    <p>
                        Desde la programación de microcontroladores hasta la inteligencia artificial. 
                        Aprende creando proyectos reales con nuestra metodología práctica.
                    </p>
                    <div className="lp-hero-buttons">
                        <Link to="/register" className="btn-main">Empezar Ahora <FaArrowRight /></Link>
                        <a href="#cursos-destacados" className="btn-secondary">Ver Cursos</a>
                    </div>
                    
                    <div className="lp-stats">
                        <div className="stat-item"><FaUserGraduate /> +100 Estudiantes</div>
                        <div className="stat-item"><FaChalkboardTeacher /> Mentores Expertos</div>
                    </div>
                </div>
                
                {/* IMAGEN HERO CORREGIDA */}
                <div className="lp-hero-image-container">
                    <div className="floating-card c1"><FaWifi /> IoT Expert</div>
                    <div className="floating-card c2"><FaCube /> Impresión 3D</div>
                    {/* Usamos una imagen con fondo para que resalte más */}
                    <img 
                        src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
                        alt="Estudiante Mecatrónica" 
                        className="main-hero-img"
                    />
                    <div className="blob-bg"></div> {/* Fondo decorativo detrás de la imagen */}
                </div>
            </header>

            {/* CATEGORÍAS */}
            <section className="lp-categories">
                <h2>¿Qué quieres aprender hoy?</h2>
                <div className="categories-grid">
                    <div className="cat-card"><div className="icon-bg"><FaRobot /></div><h3>Robótica</h3><p>Arduino, ESP32 y brazos robóticos.</p></div>
                    <div className="cat-card"><div className="icon-bg"><FaWifi /></div><h3>IoT</h3><p>Domótica y control remoto.</p></div>
                    <div className="cat-card"><div className="icon-bg"><FaCube /></div><h3>Diseño 3D</h3><p>Fusion 360 y manufactura.</p></div>
                    <div className="cat-card"><div className="icon-bg"><FaEye /></div><h3>Visión IA</h3><p>Inteligencia Artificial aplicada.</p></div>
                </div>
            </section>

            {/* CURSOS DESTACADOS */}
            <section id="cursos-destacados" className="lp-featured">
                <div className="section-header">
                    <h2>Cursos Más Populares</h2>
                    <Link to="/login" className="see-all">Ver todos &rarr;</Link>
                </div>
                <div className="courses-showcase">
                    {featuredCourses.length > 0 ? (
                        featuredCourses.map(course => (
                            <div key={course.id} className="lp-course-card" onClick={() => navigate(`/course/${course.id}`)}>
                                <div className="card-image">
                                    <img src={getImageUrl(course.imagen_portada)} alt={course.titulo} />
                                    <span className="level-badge">{course.nivel_objetivo === 'ninos' ? 'Kids' : 'Pro'}</span>
                                </div>
                                <div className="card-info">
                                    <h4>{course.titulo}</h4>
                                    <p className="instructor">InnovaLab Team</p>
                                    <div className="rating"><span className="stars"><FaStar/><FaStar/><FaStar/><FaStar/><FaStar/></span> 4.9</div>
                                    <div className="price-row">
                                        <span className="price">S/ {course.precio}</span>
                                        <span className="old-price">S/ {Math.round(course.precio * 1.5)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="loading-placeholder">Cargando cursos increíbles...</div>
                    )}
                </div>
            </section>

            {/* FOOTER CON CONTACTO WHATSAPP */}
            <footer className="lp-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <div className="brand">InnovaLab Center</div>
                        <p className="footer-desc">Formando a la próxima generación de innovadores tecnológicos.</p>
                    </div>
                    
                    <div className="footer-contact">
                        <h3>¿Tienes dudas? ¡Hablemos!</h3>
                        <p>Escríbenos directamente a nuestro WhatsApp corporativo:</p>
                        
                        {/* BOTÓN WHATSAPP */}
                        <a 
                            href="https://wa.me/51987564941"  // cambiar número al de la empresa
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-whatsapp"
                        >
                            <FaWhatsapp size={24} /> Chatear con Asesoría
                        </a>
                    </div>
                </div>
                <div className="copy">© 2026 InnovaLab Center. Huancayo, Perú.</div>
            </footer>
        </div>
    );
}

export default LandingPage;