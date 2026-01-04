import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBalls from '../components/FloatingBalls';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Calendar, TrendingUp, Award, Users, Newspaper } from 'lucide-react';
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
    { title: 'Tournois Actifs', value: stats.tournaments, icon: Trophy, color: 'bg-[#FF6B35]', link: '/tournaments', testId: 'stat-tournaments' },
    { title: 'Prochains Matchs', value: stats.upcomingMatches, icon: Calendar, color: 'bg-[#064E3B]', link: '/matches', testId: 'stat-matches' },
    { title: 'Vos Points', value: stats.userRank, icon: TrendingUp, color: 'bg-[#84CC16]', link: '/rankings', testId: 'stat-points' },
    { title: 'Badges Obtenus', value: stats.achievements, icon: Award, color: 'bg-[#FF6B35]', link: '/profile', testId: 'stat-badges' }
  ];

  return (
    <div className="min-h-screen bg-[#FFF7ED] relative flex flex-col">
      <FloatingBalls />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
        <div className="mb-8 animate-slide-in" data-testid="dashboard-welcome">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Tableau de Bord</h1>
          <p className="text-lg text-gray-600 mt-2">Bienvenue, {user?.prenom} {user?.nom}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Link key={index} to={stat.link}>
                <Card className={`glass-card card-hover cursor-pointer animate-slide-in stagger-${index + 1}`} data-testid={stat.testId}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                        <p className="text-3xl font-bold text-[#064E3B]">{stat.value}</p>
                      </div>
                      <div className={`w-14 h-14 ${stat.color} rounded-2xl flex items-center justify-center transform rotate-3`}>
                        <Icon className="w-7 h-7 text-white" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="glass-card" data-testid="quick-access-card">
            <CardHeader>
              <CardTitle className="text-2xl font-anton uppercase text-[#064E3B]">Accès Rapide</CardTitle>
              <CardDescription>Naviguer vers les sections principales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link to="/tournaments">
                <div className="p-4 bg-white rounded-xl hover:bg-[#FF6B35]/10 transition-colors cursor-pointer flex items-center space-x-3" data-testid="quick-tournaments-link">
                  <Trophy className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-medium text-[#064E3B]">Voir les Tournois</span>
                </div>
              </Link>
              <Link to="/training">
                <div className="p-4 bg-white rounded-xl hover:bg-[#FF6B35]/10 transition-colors cursor-pointer flex items-center space-x-3" data-testid="quick-training-link">
                  <Calendar className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-medium text-[#064E3B]">Horaires d'Entraînement</span>
                </div>
              </Link>
              <Link to="/rankings">
                <div className="p-4 bg-white rounded-xl hover:bg-[#FF6B35]/10 transition-colors cursor-pointer flex items-center space-x-3" data-testid="quick-rankings-link">
                  <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-medium text-[#064E3B]">Classement du Club</span>
                </div>
              </Link>
              <Link to="/news">
                <div className="p-4 bg-white rounded-xl hover:bg-[#FF6B35]/10 transition-colors cursor-pointer flex items-center space-x-3" data-testid="quick-news-link">
                  <Newspaper className="w-5 h-5 text-[#FF6B35]" />
                  <span className="font-medium text-[#064E3B]">Actualités du Club</span>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="glass-card" data-testid="licence-info-card">
            <CardHeader>
              <CardTitle className="text-2xl font-anton uppercase text-[#064E3B]">Votre Licence</CardTitle>
              <CardDescription>Informations sur votre statut membre</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                <span className="text-gray-600">Type de licence</span>
                <span className={`${user?.type_licence === 'competition' ? 'badge-competition' : 'badge-jeu-libre'}`}>
                  {user?.type_licence === 'competition' ? 'Compétition' : 'Jeu Libre'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                <span className="text-gray-600">Statut</span>
                <span className={`badge-achievement ${user?.est_licencie ? 'bg-[#84CC16]/20 text-[#84CC16]' : 'bg-gray-200 text-gray-600'}`}>
                  {user?.est_licencie ? 'Licencié' : 'Non licencié'}
                </span>
              </div>
              <div className="flex items-center justify-between p-4 bg-white rounded-xl">
                <span className="text-gray-600">Participations</span>
                <span className="font-bold text-[#064E3B] text-xl">{user?.participations || 0}</span>
              </div>
              
              {user?.type_licence === 'competition' && (
                <div className="mt-4 p-4 bg-gradient-energy rounded-xl text-white">
                  <p className="font-bold mb-1">Avantages Compétition</p>
                  <ul className="text-sm space-y-1">
                    <li>✓ Accès aux entraînements dirigés</li>
                    <li>✓ Participation au jeu libre</li>
                    <li>✓ Inscription aux tournois</li>
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}