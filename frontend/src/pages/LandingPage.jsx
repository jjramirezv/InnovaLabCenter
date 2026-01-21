import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaRobot, FaWifi, FaCube, FaEye, FaArrowRight, FaStar, 
    FaUserGraduate, FaChalkboardTeacher, FaWhatsapp, FaBolt
} from 'react-icons/fa';
// NO importamos App.css aquí para evitar conflictos si es posible, 
// pero como ya carga globalmente, lo venceremos con CSS específico.
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
        // CLASE ÚNICA PARA AISLAR ESTILOS
        <div className="innovalab-landing-page">
            
            {/* FONDO DECORATIVO */}
            <div className="lp-global-bg"></div>

            {/* NAVBAR */}
            <nav className="lp-navbar">
                <div className="lp-logo">
                    <div className="lp-logo-icon"><FaRobot /></div>
                    <span className="lp-logo-text">InnovaLab Center</span>
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
                    <div className="lp-badge"><FaBolt /> Nueva Plataforma 2026</div>
                    <h1 className="lp-title-main">
                        El Futuro de la <br />
                        <span className="lp-text-gradient">Ingeniería & Robótica</span>
                    </h1>
                    <p className="lp-hero-desc">
                        Domina la tecnología desde cero. Aprende programación, diseño 3D y electrónica creando proyectos reales con nuestra metodología práctica.
                    </p>
                    <div className="lp-hero-buttons">
                        <Link to="/register" className="lp-btn-primary">
                            Empezar Ahora <FaArrowRight />
                        </Link>
                        <a href="#cursos-destacados" className="lp-btn-secondary">Explorar Cursos</a>
                    </div>
                    
                    <div className="lp-stats">
                        <div className="lp-stat-item"><FaUserGraduate className="lp-stat-icon"/> +500 Estudiantes</div>
                        <div className="lp-stat-item"><FaChalkboardTeacher className="lp-stat-icon"/> Mentores Ingenieros</div>
                    </div>
                </div>
                
                <div className="lp-hero-image-box">
                    <div className="lp-glow"></div>
                    <div className="lp-float-card c1"><FaWifi /> IoT Expert</div>
                    <div className="lp-float-card c2"><FaCube /> Maker 3D</div>
                    <img 
                        src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=2070&auto=format&fit=crop" 
                        alt="Estudiante Mecatrónica" 
                        className="lp-main-img"
                    />
                </div>
            </header>

            {/* CATEGORÍAS */}
            <section className="lp-section lp-categories">
                <div className="lp-section-header-center">
                    <h2 className="lp-section-title">Rutas de Aprendizaje</h2>
                    <div className="lp-line"></div>
                </div>
                <div className="lp-grid-categories">
                    <div className="lp-cat-card">
                        <div className="lp-icon-box cyan"><FaRobot /></div>
                        <h3 className="lp-cat-title">Robótica</h3>
                        <p className="lp-cat-desc">Arduino, ESP32 y construcción de robots móviles.</p>
                    </div>
                    <div className="lp-cat-card">
                        <div className="lp-icon-box purple"><FaWifi /></div>
                        <h3 className="lp-cat-title">Internet of Things</h3>
                        <p className="lp-cat-desc">Domótica, servidores web y control remoto.</p>
                    </div>
                    <div className="lp-cat-card">
                        <div className="lp-icon-box orange"><FaCube /></div>
                        <h3 className="lp-cat-title">Diseño 3D</h3>
                        <p className="lp-cat-desc">Modelado en Fusion 360 e Impresión 3D.</p>
                    </div>
                    <div className="lp-cat-card">
                        <div className="lp-icon-box blue"><FaEye /></div>
                        <h3 className="lp-cat-title">Visión Artificial</h3>
                        <p className="lp-cat-desc">Python, OpenCV e Inteligencia Artificial.</p>
                    </div>
                </div>
            </section>

            {/* CURSOS DESTACADOS */}
            <section id="cursos-destacados" className="lp-section lp-featured">
                <div className="lp-section-header">
                    <div>
                        <h2 className="lp-section-title">Cursos Más Populares</h2>
                        <p className="lp-subtitle">Los favoritos de nuestra comunidad.</p>
                    </div>
                    <Link to="/home" className="lp-see-all">Ver catálogo completo &rarr;</Link>
                </div>
                
                <div className="lp-grid-courses">
                    {featuredCourses.length > 0 ? (
                        featuredCourses.map(course => (
                            <div key={course.id} className="lp-course-card" onClick={() => navigate(`/course/${course.id}`)}>
                                <div className="lp-card-image">
                                    <img src={getImageUrl(course.imagen_portada)} alt={course.titulo} />
                                    <div className="lp-overlay">Ver Curso</div>
                                    <span className={`lp-badge-level ${course.nivel_objetivo === 'ninos' ? 'kids' : 'pro'}`}>
                                        {course.nivel_objetivo === 'ninos' ? 'Kids' : 'Universitario'}
                                    </span>
                                </div>
                                <div className="lp-card-info">
                                    <h4 className="lp-course-title">{course.titulo}</h4>
                                    <p className="lp-instructor">Por InnovaLab Team</p>
                                    <div className="lp-meta-row">
                                        <div className="lp-rating">
                                            <FaStar/> 4.9
                                        </div>
                                        <div className="lp-price">
                                            S/ {course.precio}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="lp-loading">
                            <div className="lp-loader"></div>
                            <p>Cargando cursos increíbles...</p>
                        </div>
                    )}
                </div>
            </section>

            {/* FOOTER */}
            <footer className="lp-footer">
                <div className="lp-footer-content">
                    <div className="lp-footer-left">
                        <div className="lp-footer-logo">
                            <FaRobot /> InnovaLab Center
                        </div>
                        <p className="lp-footer-desc">
                            Centro de capacitación tecnológica especializado en Robótica, IoT y Desarrollo de Software en Huancayo.
                        </p>
                    </div>
                    
                    <div className="lp-footer-contact">
                        <h3 className="lp-footer-title">¿Necesitas Asesoría?</h3>
                        <p className="lp-footer-text">Habla directamente con un ingeniero de nuestro equipo.</p>
                        
                        <a 
                            href="https://wa.me/51987564941"  
                            target="_blank" 
                            rel="noreferrer" 
                            className="lp-btn-whatsapp"
                        >
                            <FaWhatsapp size={24} /> Chatear en WhatsApp
                        </a>
                    </div>
                </div>
                <div className="lp-copy">
                    © 2026 InnovaLab Center. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}

export default LandingPage;