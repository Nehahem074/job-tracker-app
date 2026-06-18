import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Jobs from './pages/Jobs';
import Resume from './pages/Resume';
import AIFeatures from './pages/AIFeatures';
import Navbar from './components/Navbar';

const Protected = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/jobs" element={<Protected><Jobs /></Protected>} />
          <Route path="/resume" element={<Protected><Resume /></Protected>} />
          <Route path="/ai" element={<Protected><AIFeatures /></Protected>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}