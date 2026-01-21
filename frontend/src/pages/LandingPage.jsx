import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaRobot, FaWifi, FaCube, FaEye, FaArrowRight, FaStar, 
    FaUserGraduate, FaChalkboardTeacher, FaWhatsapp, FaBolt
} from 'react-icons/fa';
import '../Auth.css'; 
import './LandingPage.css';

function LandingPage() {
    const navigate = useNavigate();
    const [featuredCourses, setFeaturedCourses] = useState([]);

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/300?text=Sin+Imagen';
        if (url.startsWith('http')) return url;
        const backendUrl = 'https://innovalabcenter-production.up.railway.app';
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${backendUrl}${path}`;
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
            
            {/* FONDO DECORATIVO GLOBAL */}
            <div className="global-bg-decoration"></div>

            {/* NAVBAR */}
            <nav className="lp-navbar">
                <div className="lp-logo">
                    <div className="logo-icon-box"><FaRobot /></div>
                    <span>InnovaLab Center</span>
                </div>
                <div className="lp-nav-links">
                    <Link to="/home" className="lp-link">Catálogo</Link>
                    <Link to="/login" className="lp-btn-ghost">Ingresar</Link>
                    <Link to="/register" className="lp-btn-solid">Regístrate Gratis</Link>
                </div>
            </nav>

            {/* HERO SECTION */}
            <header className="lp-hero">
                <div className="lp-hero-content">
                    <div className="badge-new"><FaBolt /> Nueva Plataforma 2026</div>
                    <h1>
                        El Futuro de la <br />
                        <span className="text-gradient">Ingeniería & Robótica</span>
                    </h1>
                    <p>
                        Domina la tecnología desde cero. Aprende programación, diseño 3D y electrónica creando proyectos reales con nuestra metodología práctica.
                    </p>
                    <div className="lp-hero-buttons">
                        <Link to="/register" className="btn-main">
                            Empezar Ahora <FaArrowRight />
                        </Link>
                        <a href="#cursos-destacados" className="btn-secondary">Explorar Cursos</a>
                    </div>
                    
                    <div className="lp-stats">
                        <div className="stat-item"><FaUserGraduate className="stat-icon"/> +500 Estudiantes</div>
                        <div className="stat-item"><FaChalkboardTeacher className="stat-icon"/> Mentores Ingenieros</div>
                    </div>
                </div>
                
                <div className="lp-hero-image-container">
                    <div className="glow-effect"></div>
                    <div className="floating-card c1"><FaWifi /> IoT Expert</div>
                    <div className="floating-card c2"><FaCube /> Maker 3D</div>
                    <img 
                        src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
                        alt="Estudiante Mecatrónica" 
                        className="main-hero-img"
                    />
                </div>
            </header>

            {/* CATEGORÍAS */}
            <section className="lp-categories">
                <div className="section-header-center">
                    <h2>Rutas de Aprendizaje</h2>
                    <div className="h-line"></div>
                </div>
                <div className="categories-grid">
                    <div className="cat-card">
                        <div className="icon-bg cyan"><FaRobot /></div>
                        <h3>Robótica</h3>
                        <p>Arduino, ESP32 y construcción de robots móviles.</p>
                    </div>
                    <div className="cat-card">
                        <div className="icon-bg purple"><FaWifi /></div>
                        <h3>Internet of Things</h3>
                        <p>Domótica, servidores web y control remoto.</p>
                    </div>
                    <div className="cat-card">
                        <div className="icon-bg orange"><FaCube /></div>
                        <h3>Diseño 3D</h3>
                        <p>Modelado en Fusion 360 e Impresión 3D.</p>
                    </div>
                    <div className="cat-card">
                        <div className="icon-bg blue"><FaEye /></div>
                        <h3>Visión Artificial</h3>
                        <p>Python, OpenCV e Inteligencia Artificial.</p>
                    </div>
                </div>
            </section>

            {/* CURSOS DESTACADOS */}
            <section id="cursos-destacados" className="lp-featured">
                <div className="section-header">
                    <div>
                        <h2>Cursos Más Populares</h2>
                        <p className="subtitle">Los favoritos de nuestra comunidad.</p>
                    </div>
                    <Link to="/home" className="see-all">Ver catálogo completo &rarr;</Link>
                </div>
                
                <div className="courses-showcase">
                    {featuredCourses.length > 0 ? (
                        featuredCourses.map(course => (
                            <div key={course.id} className="lp-course-card" onClick={() => navigate(`/course/${course.id}`)}>
                                <div className="card-image">
                                    <img src={getImageUrl(course.imagen_portada)} alt={course.titulo} />
                                    <div className="overlay">Ver Curso</div>
                                    <span className={`level-badge ${course.nivel_objetivo === 'ninos' ? 'kids' : 'pro'}`}>
                                        {course.nivel_objetivo === 'ninos' ? 'Kids' : 'Universitario'}
                                    </span>
                                </div>
                                <div className="card-info">
                                    <h4>{course.titulo}</h4>
                                    <p className="instructor">Por InnovaLab Team</p>
                                    <div className="meta-row">
                                        <div className="rating">
                                            <FaStar/> 4.9
                                        </div>
                                        <div className="price-container">
                                            <span className="price">S/ {course.precio}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="loading-placeholder">
                            <div className="loader"></div>
                            <p>Cargando cursos increíbles...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="lp-footer">
                <div className="footer-content">
                    <div className="footer-left">
                        <div className="footer-logo">
                            <FaRobot /> InnovaLab Center
                        </div>
                        <p className="footer-desc">
                            Centro de capacitación tecnológica especializado en Robótica, IoT y Desarrollo de Software en Huancayo.
                        </p>
                    </div>
                    
                    <div className="footer-contact">
                        <h3>¿Necesitas Asesoría?</h3>
                        <p>Habla directamente con un ingeniero de nuestro equipo.</p>
                        
                        <a 
                            href="https://wa.me/51987564941"  
                            target="_blank" 
                            rel="noreferrer" 
                            className="btn-whatsapp"
                        >
                            <FaWhatsapp size={24} /> Chatear en WhatsApp
                        </a>
                    </div>
                </div>
                <div className="copy">
                    © 2026 InnovaLab Center. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;