import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VolleyballEmojis from '../components/VolleyballEmojis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';

export default function Tournaments() {
  const { user, token } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const response = await axios.get(`${API}/tournaments`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTournaments(response.data);
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      toast.error('Erreur lors du chargement des tournois');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (tournamentId) => {
    if (!user?.est_licencie) {
      toast.error('Vous devez être licencié pour vous inscrire');
      return;
    }

    try {
      await axios.post(`${API}/tournaments/${tournamentId}/register`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Inscription réussie au tournoi!');
      fetchTournaments();
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'inscription");
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      'à_venir': 'bg-[#84CC16]/20 text-[#84CC16] border-[#84CC16]',
      'en_cours': 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]',
      'terminé': 'bg-gray-500/20 text-gray-400 border-gray-500'
    };
    const labels = {
      'à_venir': 'À venir',
      'en_cours': 'En cours',
      'terminé': 'Terminé'
    };
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${badges[statut] || badges['à_venir']}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col relative" style={{ background: '#1a1f2e' }}>
        <VolleyballEmojis />
        <Navbar />
        <div className="flex items-center justify-center h-96 relative z-10">
          <p className="text-white text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col" style={{ background: '#1a1f2e' }}>
      <VolleyballEmojis />
      <div className="grain-texture absolute inset-0"></div>
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
        <div className="mb-8" data-testid="tournaments-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">
            🏆 Tournois
          </h1>
          <p className="text-lg text-gray-400 mt-2">Inscrivez-vous et participez aux compétitions</p>
        </div>

        {tournaments.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <span className="text-6xl mb-4 block">🏆</span>
              <p className="text-gray-400 text-lg">Aucun tournoi disponible pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <Card key={tournament.id} className="glass-card card-hover border-0" data-testid={`tournament-card-${index}`}>
                <CardHeader>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-white mb-3" data-testid={`tournament-name-${index}`}>
                        {tournament.nom}
                      </CardTitle>
                      {getStatusBadge(tournament.statut)}
                    </div>
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#ff8854] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🏆
                    </div>
                  </div>
                  <CardDescription className="text-gray-400">{tournament.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">📅</span>
                    <span>{new Date(tournament.date_debut).toLocaleDateString('fr-FR')} - {new Date(tournament.date_fin).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-400">
                    <span className="mr-2">👥</span>
                    <span>{tournament.participants_actuels || 0}/{tournament.participants_max || tournament.max_participants || 16} participants</span>
                  </div>

                  {tournament.statut === 'inscriptions_ouvertes' && (
                    <Button
                      onClick={() => handleRegister(tournament.id)}
                      className="w-full btn-primary mt-4"
                      disabled={(tournament.participants_actuels || 0) >= (tournament.participants_max || tournament.max_participants || 16)}
                      data-testid={`tournament-register-button-${index}`}
                    >
                      {(tournament.participants_actuels || 0) >= (tournament.participants_max || tournament.max_participants || 16) ? 'Complet' : "S'inscrire"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
