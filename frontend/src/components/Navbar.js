import { useContext } from 'react';
import { AuthContext } from '../App';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, Trophy, Calendar, TrendingUp, Dumbbell, Newspaper, User, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Tableau de bord', path: '/', emoji: '🏠', color: 'bg-[#06B6D4]' },
    { name: 'Tournois', path: '/tournaments', emoji: '🏆', color: 'bg-[#FF6B35]' },
    { name: 'Matchs', path: '/matches', emoji: '🏐', color: 'bg-[#10B981]' },
    { name: 'Classement', path: '/rankings', emoji: '📊', color: 'bg-[#8B5CF6]' },
    { name: 'Entraînements', path: '/training', emoji: '💪', color: 'bg-[#F59E0B]' },
    { name: 'Actualités', path: '/news', emoji: '📰', color: 'bg-[#84CC16]' },
  ];

  return (
    <nav className="glass-card shadow-lg relative z-20 border-0 rounded-none" data-testid="navbar" style={{ background: 'rgba(30, 36, 51, 0.95)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3" data-testid="navbar-logo">
            <img 
              src="https://customer-assets.emergentagent.com/job_tcsvolley/artifacts/h6inbvsa_WhatsApp%20Image%202025-12-19%20at%2003.44.40.jpeg" 
              alt="TCS Suzini Logo" 
              className="w-12 h-12 rounded-full shadow-lg"
            />
            <span className="font-anton text-2xl text-white tracking-wider">TCS SUZINI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <div
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all cursor-pointer ${
                      isActive ? `${item.color} text-white shadow-lg` : 'bg-white/5 text-gray-300 hover:bg-white/10'
                    }`}
                    data-testid={`nav-link-${item.path}`}
                  >
                    <span className="text-lg">{item.emoji}</span>
                    <span className="font-medium">{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-2">
            {user?.role === 'referent' && (
              <Link to="/referent">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#10B981] text-white hover:bg-[#059669] transition-all cursor-pointer shadow-lg">
                  <span className="text-lg">🔐</span>
                  <span className="font-medium">Référent</span>
                </div>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin">
                <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#8B5CF6] text-white hover:bg-[#7C3AED] transition-all cursor-pointer shadow-lg">
                  <span className="text-lg">⚙️</span>
                  <span className="font-medium">Admin</span>
                </div>
              </Link>
            )}
            <Link to="/profile">
              <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#06B6D4] text-white hover:bg-[#0891B2] transition-all cursor-pointer shadow-lg">
                <span className="text-lg">👤</span>
                <span className="font-medium">Profil</span>
              </div>
            </Link>
            <div 
              onClick={logout}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-[#EF4444] text-white hover:bg-[#DC2626] transition-all cursor-pointer shadow-lg"
            >
              <span className="text-lg">👋</span>
              <span className="font-medium">Déconnexion</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden bg-white/10 backdrop-blur-sm">
        <div className="px-2 pt-2 pb-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link key={item.path} to={item.path}>
                <div
                  className={`flex items-center px-3 py-2 rounded-md text-white hover:bg-white/20 ${
                    isActive ? 'bg-white/20' : ''
                  }`}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  {item.name}
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}