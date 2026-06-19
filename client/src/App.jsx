import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Jobs from './pages/Jobs'
import Resume from './pages/Resume'
import AIFeatures from './pages/AIFeatures'
import Analytics from './pages/Analytics'
import OAuthCallback from './pages/OAuthCallback'

function Protected({ children }) {
  const { isAuth } = useAuth()
  return isAuth ? children : <Navigate to="/login" replace />
}

function Guest({ children }) {
  const { isAuth } = useAuth()
  return !isAuth ? children : <Navigate to="/" replace />
}

function AppRoutes() {
  const { isAuth } = useAuth()
  return (
    <>
      {isAuth && <Navbar />}
      <Routes>
        <Route path="/login"    element={<Guest><Login /></Guest>} />
        <Route path="/register" element={<Guest><Register /></Guest>} />
        <Route path="/oauth"    element={<OAuthCallback />} />
        <Route path="/"         element={<Protected><Dashboard /></Protected>} />
        <Route path="/jobs"     element={<Protected><Jobs /></Protected>} />
        <Route path="/resume"   element={<Protected><Resume /></Protected>} />
        <Route path="/ai"       element={<Protected><AIFeatures /></Protected>} />
        <Route path="/analytics" element={<Protected><Analytics /></Protected>} />
        <Route path="*"         element={<Navigate to="/" replace />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      </BrowserRouter>
    </AuthProvider>
  )
}