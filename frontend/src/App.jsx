import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/loginPage';
import HomePage from './pages/HomePage';
import LandingPage from './pages/LandingPage';
import CoursePage from './pages/CoursePage';
import CourseLearn from './pages/CourseLearn';
import AdminDashboard from './pages/AdminDashboard'; 
import AdminEditCourse from './pages/AdminEditCourse';
import AdminCourseContent from './pages/AdminCourseContent';
import AdminEditLesson from './pages/AdminEditLesson';
import QuizEditor from './pages/QuizEditor';
import QuizTaker from './pages/QuizTaker';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/courses" element={<Navigate to="/home" replace />} />
        
        {/* Rutas Admin */}
        <Route path="/admin" element={<AdminDashboard />} /> 
        <Route path="/admin/course/:id/edit" element={<AdminEditCourse />} />
        <Route path="/admin/course/:id/manage" element={<AdminCourseContent />} />
        <Route path="/admin/course/:id/lesson/:lessonId/edit" element={<AdminEditLesson />} />
        
        {/* Rutas de Exámenes (Admin y Alumno) */}
        <Route path="/admin/quiz/:id/edit" element={<QuizEditor />} /> 
        <Route path="/course/quiz/:quizId/take" element={<QuizTaker />} />  
        
        {/* Rutas Públicas */}
        <Route path="/course/:id" element={<CoursePage />} />

        {/* Rutas Privadas */}
        <Route path="/course/:id/learn" element={<CourseLearn />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;