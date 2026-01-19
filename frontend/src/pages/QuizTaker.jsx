import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axios';
import { 
    FaClock, FaCheckCircle, FaTimesCircle, FaArrowRight, FaPaperPlane, FaFont 
} from 'react-icons/fa';

function QuizTaker() {
    const { quizId } = useParams();
    const navigate = useNavigate();

    const [quiz, setQuiz] = useState(null);
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [answers, setAnswers] = useState({});
    const [result, setResult] = useState(null); 
    const [submitting, setSubmitting] = useState(false);
    
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = { headers: { Authorization: `Bearer ${token}` } };
                
                const res = await axios.get(`/quizzes/${quizId}`, config);
                setQuiz(res.data.quiz);
                setQuestions(res.data.questions);
                setLoading(false);
            } catch (error) {
                console.error(error);
                navigate(-1);
            }
        };
        fetchQuiz();
    }, [quizId, navigate]);

    const handleOptionSelect = (qId, optId) => {
        setAnswers(prev => ({ ...prev, [qId]: { optionId: optId } }));
    };

    const handleTextChange = (qId, text) => {
        setAnswers(prev => ({ ...prev, [qId]: { textValue: text } }));
    };

    const handlePreSubmit = () => {
        setShowConfirmModal(true);
    };

    const confirmSubmit = async () => {
        setShowConfirmModal(false);
        setSubmitting(true);
        
        try {
            const answersArray = Object.keys(answers).map(qId => ({
                questionId: parseInt(qId),
                ...answers[qId]
            }));

            const token = localStorage.getItem('token');
            const res = await axios.post('/quizzes/submit', {
                quizId: quizId,
                answers: answersArray
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setResult(res.data); 
        } catch (error) {
            console.error(error);
            // Si el backend dice que ya lo diste (403), puedes mostrar un aviso aquí
            if(error.response?.status === 403) {
                alert("Ya has realizado este examen. No se permiten reintentos.");
                navigate(-1);
            }
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <div style={{padding:'50px', textAlign:'center'}}>Cargando examen...</div>;

    if (result) {
        return (
            <div style={{ maxWidth: '600px', margin: '50px auto', padding: '40px', background: 'white', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', textAlign: 'center', fontFamily: "'Poppins', sans-serif" }}>
                <div style={{ fontSize: '5rem', marginBottom: '20px', color: result.aprobado ? '#2E7D32' : '#D32F2F' }}>
                    {result.aprobado ? <FaCheckCircle /> : <FaTimesCircle />}
                </div>
                <h1 style={{ color: '#211F30', margin: '0 0 10px 0' }}>
                    {result.aprobado ? '¡Aprobado!' : 'No Aprobado'}
                </h1>
                <p style={{ color: '#666', fontSize: '1.1rem' }}>
                    Has obtenido <strong style={{ color: '#217CA3', fontSize: '1.3rem' }}>{result.score}</strong> puntos.
                </p>
                <button onClick={() => navigate(-1)} style={{ marginTop: '30px', background: '#217CA3', color: 'white', border: 'none', padding: '15px 40px', borderRadius: '30px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    Volver al Curso
                </button>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: '#F4F6F8', padding: '30px', fontFamily: "'Poppins', sans-serif" }}>
            <div style={{ maxWidth: '800px', margin: '0 auto 30px', background: 'white', padding: '15px 25px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: '20px', zIndex: 100 }}>
                <div>
                    <h2 style={{ margin: 0, fontSize: '1.2rem', color: '#211F30' }}>{quiz.titulo}</h2>
                    <span style={{ fontSize: '0.85rem', color: '#888' }}>{questions.length} preguntas</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#FFF3E0', color: '#E65100', padding: '8px 15px', borderRadius: '20px', fontWeight: 'bold' }}>
                    <FaClock /> {quiz.duracion_minutos} min
                </div>
            </div>

            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                {questions.map((q, index) => (
                    <div key={q.id} style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <span style={{ display: 'inline-block', background: '#E3F2FD', color: '#1565C0', padding: '4px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: '10px' }}>Pregunta {index + 1}</span>
                            <h3 style={{ margin: 0, color: '#333', fontSize: '1.1rem', lineHeight: '1.5' }}>{q.enunciado}</h3>
                            <span style={{ fontSize: '0.8rem', color: '#999' }}>({q.puntos} puntos)</span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {q.tipo === 'multiple' ? (
                                q.options.map(opt => (
                                    <label key={opt.id} style={{ 
                                        display: 'flex', alignItems: 'center', gap: '15px', padding: '15px', 
                                        border: answers[q.id]?.optionId === opt.id ? '2px solid #217CA3' : '1px solid #eee', 
                                        borderRadius: '10px', cursor: 'pointer', transition: 'all 0.2s',
                                        background: answers[q.id]?.optionId === opt.id ? '#F0F7FA' : 'white'
                                    }}>
                                        <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid #ddd', background: answers[q.id]?.optionId === opt.id ? '#217CA3' : 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                            {answers[q.id]?.optionId === opt.id && <div style={{width:'8px', height:'8px', background:'white', borderRadius:'50%'}}></div>}
                                        </div>
                                        <input type="radio" name={`question-${q.id}`} value={opt.id} onChange={() => handleOptionSelect(q.id, opt.id)} style={{ display: 'none' }} />
                                        <span style={{ color: '#444' }}>{opt.texto_opcion}</span>
                                    </label>
                                ))
                            ) : (
                                <div style={{ position: 'relative' }}>
                                    <FaFont style={{ position: 'absolute', left: '15px', top: '15px', color: '#ccc' }} />
                                    <input type="text" placeholder="Escribe tu respuesta aquí..." value={answers[q.id]?.textValue || ''} onChange={(e) => handleTextChange(q.id, e.target.value)} style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '10px', border: '1px solid #ddd', outline: 'none', fontSize: '1rem' }} />
                                </div>
                            )}
                        </div>
                    </div>
                ))}
                
                <div style={{ textAlign: 'center', marginTop: '20px', marginBottom: '50px' }}>
                    <button onClick={handlePreSubmit} disabled={submitting} style={{ background: '#E29930', color: 'white', border: 'none', padding: '15px 50px', borderRadius: '50px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 20px rgba(226, 153, 48, 0.4)', display: 'inline-flex', alignItems: 'center', gap: '10px', opacity: submitting ? 0.7 : 1 }}>
                        {submitting ? 'Procesando...' : <>Enviar Examen <FaArrowRight /></>}
                    </button>
                </div>
            </div>

            {/* --- MODAL DE CONFIRMACIÓN (SOLUCIÓN A LA ALERTA GRIS) --- */}
            {showConfirmModal && (
                <div className="custom-modal-overlay" style={{position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', justifyContent:'center', alignItems:'center', zIndex:1000}}>
                    <div style={{background:'white', padding:'35px', borderRadius:'20px', width:'380px', textAlign:'center', boxShadow:'0 15px 40px rgba(0,0,0,0.2)'}}>
                        <div style={{fontSize:'3.5rem', color:'#217CA3', marginBottom:'15px'}}><FaPaperPlane /></div>
                        <h2 style={{color:'#211F30', margin:'0 0 10px 0'}}>¿Enviar Examen?</h2>
                        <p style={{color:'#666', marginBottom:'25px', lineHeight:'1.5'}}>Asegúrate de haber respondido todas las preguntas. <br/>Una vez enviado, no podrás cambiar tus respuestas.</p>
                        <div style={{display:'flex', gap:'15px', justifyContent:'center'}}>
                            <button onClick={() => setShowConfirmModal(false)} style={{background:'#F0F0F0', color:'#555', border:'none', padding:'12px 25px', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', fontSize:'0.9rem'}}>Revisar más</button>
                            <button onClick={confirmSubmit} style={{background:'#E29930', color:'white', border:'none', padding:'12px 30px', borderRadius:'10px', fontWeight:'bold', cursor:'pointer', boxShadow:'0 4px 15px rgba(226, 153, 48, 0.3)', fontSize:'0.9rem'}}>Sí, Enviar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default QuizTaker;