// components/Navbar.jsx

import { Link } from 'react-router-dom';
import { LayoutDashboard, Briefcase, FileText, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { logout } = useAuth();

  return (
    <nav className="bg-white border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold">
            JT
          </div>
          <span className="font-bold text-lg">
            JobTracker AI
          </span>
        </div>

        <div className="flex gap-6">
          <Link to="/" className="flex items-center gap-2">
            <LayoutDashboard size={18}/>
            Dashboard
          </Link>

          <Link to="/jobs" className="flex items-center gap-2">
            <Briefcase size={18}/>
            Jobs
          </Link>

          <Link to="/resume" className="flex items-center gap-2">
            <FileText size={18}/>
            Resume
          </Link>

          <Link to="/ai" className="flex items-center gap-2">
            <Sparkles size={18}/>
            AI
          </Link>
        </div>

        <button
          onClick={logout}
          className="bg-red-500 text-white px-4 py-2 rounded-xl"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}