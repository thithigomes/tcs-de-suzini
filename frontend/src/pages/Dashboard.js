import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VolleyballEmojis from '../components/VolleyballEmojis';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { user, token } = useContext(AuthContext);
  const [stats, setStats] = useState({
    tournaments: 0,
    upcomingMatches: 0,
    userRank: 0,
    achievements: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [tournamentsRes, matchesRes, profileRes] = await Promise.all([
          axios.get(`${API}/tournaments`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/matches`, { headers: { Authorization: `Bearer ${token}` } }),
          axios.get(`${API}/users/me`, { headers: { Authorization: `Bearer ${token}` } })
        ]);

        const activeTournaments = tournamentsRes.data.filter(t => t.statut !== 'terminé').length;
        const upcomingMatches = matchesRes.data.filter(m => new Date(m.date) >= new Date()).length;

        setStats({
          tournaments: activeTournaments,
          upcomingMatches: upcomingMatches,
          userRank: profileRes.data.points,
          achievements: profileRes.data.achievements.length
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };

    fetchDashboardData();
  }, [token]);

  const quickStats = [
    { title: 'Tournois Actifs', value: stats.tournaments, emoji: '🏆', color: 'from-[#FF6B35] to-[#ff8854]', link: '/tournaments' },
    { title: 'Prochains Matchs', value: stats.upcomingMatches, emoji: '📅', color: 'from-[#10B981] to-[#34d399]', link: '/matches' },
    { title: 'Vos Points', value: stats.userRank, emoji: '⭐', color: 'from-[#84CC16] to-[#a3e635]', link: '/rankings' },
    { title: 'Badges', value: stats.achievements, emoji: '🎖️', color: 'from-[#8B5CF6] to-[#a78bfa]', link: '/profile' }
  ];

  const menuItems = [
    { name: 'Tournois', emoji: '🏆', description: 'Inscrivez-vous aux compétitions', link: '/tournaments', color: 'bg-[#FF6B35]' },
    { name: 'Matchs', emoji: '⚽', description: 'Calendrier des rencontres', link: '/matches', color: 'bg-[#10B981]' },
    { name: 'Classement', emoji: '📊', description: 'Voir le ranking', link: '/rankings', color: 'bg-[#84CC16]' },
    { name: 'Entraînements', emoji: '💪', description: 'Horaires et sessions', link: '/training', color: 'bg-[#8B5CF6]' },
    { name: 'Actualités', emoji: '📰', description: 'Nouvelles du club', link: '/news', color: 'bg-[#F59E0B]' },
    { name: 'Mon Profil', emoji: '👤', description: 'Vos informations', link: '/profile', color: 'bg-[#06B6D4]' }
  ];

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: '#1a1f2e' }}>
      <VolleyballEmojis />
      <div className="grain-texture absolute inset-0"></div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">
            Bienvenue, {user?.prenom}! 🏐
          </h1>
          <p className="text-lg text-gray-400 mt-2">Tableau de bord - TCS de Suzini</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => (
            <Link key={index} to={stat.link}>
              <Card className="glass-card card-hover cursor-pointer border-0">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
                      <p className="text-4xl font-bold text-white">{stat.value}</p>
                    </div>
                    <div className={`w-16 h-16 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                      {stat.emoji}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-anton uppercase text-white">Accès Rapide</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {menuItems.map((item, index) => (
                <Link key={index} to={item.link}>
                  <div className="p-4 glass-card hover:bg-white/10 transition-all cursor-pointer card-hover border-0">
                    <div className="flex flex-col items-center text-center space-y-2">
                      <div className={`w-14 h-14 ${item.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                        {item.emoji}
                      </div>
                      <h3 className="font-bold text-white text-sm">{item.name}</h3>
                      <p className="text-xs text-gray-400">{item.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-card border-0">
            <CardHeader>
              <CardTitle className="text-2xl font-anton uppercase text-white">Votre Statut</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 glass-card border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎫</span>
                  <span className="text-gray-300">Type de licence</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  user?.type_licence === 'competition' 
                    ? 'bg-[#FF6B35]/20 text-[#FF6B35] border border-[#FF6B35]' 
                    : 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]'
                }`}>
                  {user?.type_licence === 'competition' ? 'Compétition' : 'Jeu Libre'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 glass-card border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">✅</span>
                  <span className="text-gray-300">Statut</span>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                  user?.est_licencie 
                    ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]' 
                    : 'bg-gray-500/20 text-gray-400 border border-gray-500'
                }`}>
                  {user?.est_licencie ? 'Licencié' : 'Non licencié'}
                </span>
              </div>

              <div className="flex items-center justify-between p-4 glass-card border-0">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🎯</span>
                  <span className="text-gray-300">Participations</span>
                </div>
                <span className="text-2xl font-bold text-white">{user?.participations || 0}</span>
              </div>

              {user?.type_licence === 'competition' && (
                <div className="mt-4 p-4 bg-gradient-to-r from-[#FF6B35] to-[#10B981] rounded-xl">
                  <p className="font-bold text-white mb-2">🌟 Avantages Compétition</p>
                  <ul className="text-sm text-white/90 space-y-1">
                    <li>✓ Entraînements dirigés</li>
                    <li>✓ Jeu libre</li>
                    <li>✓ Inscription aux tournois</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}
