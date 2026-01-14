import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { FaArrowLeft, FaSave, FaCheckCircle } from 'react-icons/fa';
import './AdminEditCourse.css';

function AdminEditLesson() {
    const { id, lessonId } = useParams();
    const navigate = useNavigate();
    
    const [loading, setLoading] = useState(true);
    const [showSuccess, setShowSuccess] = useState(false);

    const [lesson, setLesson] = useState({
        titulo: '',
        video_url: '',
        duracion: '',
        orden: 0,
        descripcion: '' // Nuevo campo
    });

    useEffect(() => {
        const fetchLesson = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    navigate('/login');
                    return;
                }
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const res = await axios.get(`/courses/lessons/${lessonId}`, config);
                // Aseguramos que descripción no sea null para evitar warning de React
                setLesson({ ...res.data, descripcion: res.data.descripcion || '' });
            } catch (error) {
                console.error("Error cargando lección:", error);
                alert("Error al cargar datos");
                navigate(`/admin/course/${id}/manage`);
            } finally {
                setLoading(false);
            }
        };
        fetchLesson();
    }, [lessonId, id, navigate]);

    const handleChange = (e) => {
        setLesson({ ...lesson, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            
            await axios.put(`/courses/lessons/${lessonId}`, lesson, config);
            setShowSuccess(true);
        } catch (error) {
            console.error(error);
            alert("Error al actualizar");
        }
    };

    const goBack = () => {
        navigate(`/admin/course/${id}/manage`);
    };

    if (loading) return <div style={{padding:'40px'}}>Cargando editor...</div>;

    return (
        <div className="edit-page-container">
            <header className="edit-header">
                <button onClick={goBack} className="btn-back-admin">
                    <FaArrowLeft /> Volver al Contenido
                </button>
                <div style={{textAlign:'center'}}>
                    <small style={{color:'#888', textTransform:'uppercase', fontSize:'0.7rem', fontWeight:'bold'}}>EDITANDO LECCIÓN #{lesson.orden}</small>
                    <h1 style={{margin:0, fontSize:'1.2rem'}}>{lesson.titulo}</h1>
                </div>
                <button onClick={handleUpdate} className="btn-save-top">
                    <FaSave /> Guardar Cambios
                </button>
            </header>

            <div className="edit-content">
                <form className="edit-form" onSubmit={handleUpdate}>
                    <section className="form-section">
                        <h3>Detalles de la Clase</h3>
                        
                        <div className="form-group">
                            <label>Título de la Lección</label>
                            <input type="text" name="titulo" value={lesson.titulo} onChange={handleChange} required />
                        </div>

                        {/* --- NUEVO CAMPO DE DESCRIPCIÓN --- */}
                        <div className="form-group">
                            <label>Descripción / Notas de la Clase</label>
                            <textarea 
                                name="descripcion" 
                                rows="5"
                                value={lesson.descripcion} 
                                onChange={handleChange} 
                                placeholder="Escribe instrucciones, resúmenes o notas importantes para el alumno..."
                                style={{
                                    width:'100%', padding:'12px', borderRadius:'6px', 
                                    border:'1px solid #ddd', fontFamily:'inherit', fontSize:'1rem', 
                                    resize:'vertical', background:'#fafafa'
                                }}
                            />
                            <small style={{color:'#888'}}>Opcional: Instrucciones adicionales para esta clase.</small>
                        </div>

                        <div className="form-group">
                            <label>Enlace de Contenido (Drive / Meet / YouTube)</label>
                            <input type="text" name="video_url" value={lesson.video_url} onChange={handleChange} required />
                            <small style={{color:'#666', marginTop:'5px', display:'block'}}>
                                * Pega aquí el enlace de Google Drive (video/carpeta) o el enlace de Google Meet.
                            </small>
                        </div>

                        <div className="row-2">
                            <div className="form-group">
                                <label>Duración</label>
                                <input type="text" name="duracion" value={lesson.duracion} onChange={handleChange} placeholder="Ej: 45 min" />
                            </div>
                            <div className="form-group">
                                <label>Orden (Número)</label>
                                <input type="number" name="orden" value={lesson.orden} onChange={handleChange} />
                            </div>
                        </div>
                    </section>
                </form>
            </div>

            {/* MODAL DE ÉXITO */}
            {showSuccess && (
                <div className="success-overlay">
                    <div className="success-modal">
                        <div className="icon-container"><FaCheckCircle /></div>
                        <h2>¡Lección Actualizada!</h2>
                        <p>Los cambios se han guardado correctamente.</p>
                        <button className="btn-success-close" onClick={goBack}>
                            Volver al Listado
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AdminEditLesson;