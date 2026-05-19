import { useState, useCallback } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import Register from "./pages/Register";
import Login from "./pages/Login";

import TeacherDashboard from "./pages/TeacherDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import QuizPage from "./pages/QuizPage";
import UploadLecture from "./pages/UploadLecture";
import GenerateQuiz from "./pages/GenerateQuiz";
import ProtectedRoute from "./components/ProtectedRoute";
import Preloader from "./components/Preloader";

function App() {
  const [ready, setReady] = useState(false);
  const handlePreloaderDone = useCallback(() => setReady(true), []);

  return (
    <>
    <Router>
      <Routes>
        {/* Public */}
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<MainPage />} />
        <Route path="/login" element={<Login />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Teacher */}
        <Route
          path="/teacher"
          element={
            <ProtectedRoute role="teacher">
              <TeacherDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/upload-lecture"
          element={
            <ProtectedRoute role="teacher">
              <UploadLecture />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate-quiz"
          element={
            <ProtectedRoute role="teacher">
              <GenerateQuiz />
            </ProtectedRoute>
          }
        />

        {/* Student */}
        <Route
          path="/student"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/quiz/:quizId"
          element={
            <ProtectedRoute role="student">
              <QuizPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
    {!ready && <Preloader onDone={handlePreloaderDone} />}
    </>
  );
}

export default App;