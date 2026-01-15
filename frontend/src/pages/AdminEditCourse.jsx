import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { FaArrowLeft, FaSave, FaUpload, FaCheckCircle } from 'react-icons/fa'; 
import './AdminEditCourse.css';
// 1. IMPORTAR EL COMPONENTE NUEVO
import ResourcesManager from './ResourcesManager';

function AdminEditCourse() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    
    // ESTADO PARA LA VENTANA DE ÉXITO
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const [course, setCourse] = useState({
        titulo: '',
        descripcion: '',
        precio: '',
        nivel_objetivo: 'superior',
        imagen_portada: '',
        modalidad: 'Virtual Asíncrono',
        duracion: '',
        certificado: 'Certificado de Finalización',
        requisitos: ''
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const res = await axios.get(`/courses/${id}`);
                setCourse(res.data);
            } catch (error) {
                console.error(error);
                navigate('/admin');
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id, navigate]);

    const handleChange = (e) => {
        setCourse({ ...course, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files[0]) setSelectedFile(e.target.files[0]);
    };

    // --- GUARDAR CAMBIOS ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        Object.keys(course).forEach(key => {
            formData.append(key, course[key] || '');
        });

        if (selectedFile) {
            formData.append('imagen', selectedFile);
        } else {
            formData.append('imagen_actual', course.imagen_portada);
        }

        try {
            const token = localStorage.getItem('token');
            await axios.put(`/courses/${id}`, formData, {
                headers: { 
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}` 
                }
            });
            
            setShowSuccessModal(true);

        } catch (error) {
            console.error(error);
        }
    };

    const getImageUrl = (url) => {
        if (!url) return 'https://via.placeholder.com/300?text=Sin+Imagen';

        // 1. Si ya es un link de Cloudinary (empieza con http), úsalo directo
        if (url.startsWith('http')) return url;

        // 2. Si es una ruta vieja (/uploads/...), apunta a tu BACKEND DE RAILWAY
        // NUNCA USES LOCALHOST AQUÍ PARA PRODUCCIÓN
        const backendUrl = 'https://innovalabcenter-production.up.railway.app';
        
        const path = url.startsWith('/') ? url : `/${url}`;
        return `${backendUrl}${path}`;
    };

    // Función para cerrar el modal y volver al admin
    const handleCloseSuccess = () => {
        setShowSuccessModal(false);
        navigate('/admin');
    };

    if (loading) return <div style={{padding:'40px'}}>Cargando editor...</div>;

    return (
        <div className="edit-page-container">
            <header className="edit-header">
                <button onClick={() => navigate('/admin')} className="btn-back-admin">
                    <FaArrowLeft /> Volver al Panel
                </button>
                <h1>Editando: {course.titulo}</h1>
                <button onClick={handleSubmit} className="btn-save-top">
                    <FaSave /> Guardar Cambios
                </button>
            </header>

            <div className="edit-content">
                <form className="edit-form" onSubmit={handleSubmit}>
                    
                    <section className="form-section">
                        <h3>Información General</h3>
                        <div className="form-group">
                            <label>Título del Curso</label>
                            <input type="text" name="titulo" value={course.titulo} onChange={handleChange} required />
                        </div>
                        <div className="form-group">
                            <label>Descripción Completa</label>
                            <textarea name="descripcion" rows="6" value={course.descripcion} onChange={handleChange} />
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Detalles de Venta</h3>
                        <div className="row-2">
                            <div className="form-group">
                                <label>Precio (S/)</label>
                                <input type="number" name="precio" value={course.precio} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Nivel Objetivo</label>
                                <select name="nivel_objetivo" value={course.nivel_objetivo} onChange={handleChange}>
                                    <option value="superior">Superior</option>
                                    <option value="jovenes">Jóvenes</option>
                                    <option value="ninos">Niños</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Ficha Técnica</h3>
                        <div className="row-2">
                            <div className="form-group">
                                <label>Modalidad</label>
                                <input type="text" name="modalidad" value={course.modalidad} onChange={handleChange} />
                            </div>
                            <div className="form-group">
                                <label>Duración Estimada</label>
                                <input type="text" name="duracion" value={course.duracion} onChange={handleChange} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Tipo de Certificado</label>
                            <input type="text" name="certificado" value={course.certificado} onChange={handleChange} />
                        </div>
                        <div className="form-group">
                            <label>Requisitos Previos</label>
                            <textarea name="requisitos" rows="3" value={course.requisitos} onChange={handleChange} />
                        </div>
                    </section>

                    <section className="form-section">
                        <h3>Imagen de Portada</h3>
                        <div className="image-preview-box">
                            <div 
                                className="current-img" 
                                style={{backgroundImage: `url(${selectedFile ? URL.createObjectURL(selectedFile) : getImageUrl(course.imagen_portada)})`}}
                            ></div>
                            <div className="upload-controls">
                                <input type="file" id="edit-upload" accept="image/*" onChange={handleFileChange} hidden />
                                <label htmlFor="edit-upload" className="btn-change-img">
                                    <FaUpload /> {selectedFile ? "Imagen Seleccionada" : "Cambiar Imagen"}
                                </label>
                            </div>
                        </div>
                    </section>
                </form>


            </div>

            {/* --- MODAL DE ÉXITO PERSONALIZADO --- */}
            {showSuccessModal && (
                <div className="success-overlay">
                    <div className="success-modal">
                        <div className="icon-container">
                            <FaCheckCircle />
                        </div>
                        <h2>¡Actualización Exitosa!</h2>
                        <p>Los cambios en <strong>{course.titulo}</strong> se han guardado correctamente en la base de datos.</p>
                        
                        <button className="btn-success-close" onClick={handleCloseSuccess}>
                            Entendido, Volver al Panel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEditCourse;