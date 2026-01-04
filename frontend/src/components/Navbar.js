import { useContext } from 'react';
import { AuthContext } from '../App';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Home, Trophy, Calendar, TrendingUp, Dumbbell, Newspaper, User, LogOut, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();

  const navItems = [
    { name: 'Tableau de bord', path: '/', icon: Home },
    { name: 'Tournois', path: '/tournaments', icon: Trophy },
    { name: 'Matchs', path: '/matches', icon: Calendar },
    { name: 'Classement', path: '/rankings', icon: TrendingUp },
    { name: 'Entraînements', path: '/training', icon: Dumbbell },
    { name: 'Actualités', path: '/news', icon: Newspaper },
  ];

  return (
    <nav className="glass-card shadow-lg relative z-20 border-0 rounded-none" data-testid="navbar" style={{ background: 'rgba(30, 36, 51, 0.95)' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-3" data-testid="navbar-logo">
            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
              <Trophy className="w-7 h-7 text-[#FF6B35]" />
            </div>
            <span className="font-anton text-2xl text-white tracking-wider">TCS SUZINI</span>
          </Link>

          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant="ghost"
                    className={`text-white hover:bg-white/20 transition-colors ${
                      isActive ? 'bg-white/20' : ''
                    }`}
                    data-testid={`nav-link-${item.path}`}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {item.name}
                  </Button>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-3">
            {user?.role === 'referent' && (
              <Link to="/referent">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  data-testid="nav-referent-link"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  R\u00e9f\u00e9rent
                </Button>
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link to="/admin">
                <Button
                  variant="ghost"
                  className="text-white hover:bg-white/20"
                  data-testid="nav-admin-link"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/profile">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/20"
                data-testid="nav-profile-link"
              >
                <User className="w-4 h-4 mr-2" />
                Profil
              </Button>
            </Link>
            <Button
              onClick={logout}
              variant="ghost"
              className="text-white hover:bg-white/20"
              data-testid="nav-logout-button"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
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