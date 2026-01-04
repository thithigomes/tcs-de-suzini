import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Trophy, Users, Calendar, MapPin } from 'lucide-react';
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
      'à_venir': 'bg-[#84CC16]/20 text-[#84CC16] border-[#84CC16]/30',
      'en_cours': 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30',
      'terminé': 'bg-gray-200 text-gray-600 border-gray-300'
    };
    const labels = {
      'à_venir': 'À venir',
      'en_cours': 'En cours',
      'terminé': 'Terminé'
    };
    return (
      <span className={`badge-achievement ${badges[statut] || badges['à_venir']}`}>
        {labels[statut] || statut}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF7ED]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-[#064E3B] text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8" data-testid="tournaments-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Tournois</h1>
          <p className="text-lg text-gray-600 mt-2">Inscrivez-vous et participez aux compétitions</p>
        </div>

        {tournaments.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucun tournoi disponible pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tournaments.map((tournament, index) => (
              <Card key={tournament.id} className="glass-card card-hover" data-testid={`tournament-card-${index}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl font-bold text-[#064E3B] mb-2" data-testid={`tournament-name-${index}`}>
                        {tournament.nom}
                      </CardTitle>
                      {getStatusBadge(tournament.statut)}
                    </div>
                    <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center">
                      <Trophy className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <CardDescription className="mt-2">{tournament.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center text-sm text-gray-600">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>{new Date(tournament.date_debut).toLocaleDateString('fr-FR')} - {new Date(tournament.date_fin).toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <Users className="w-4 h-4 mr-2" />
                    <span>{tournament.participants.length}/{tournament.max_participants} participants</span>
                  </div>

                  {tournament.statut === 'à_venir' && (
                    <Button
                      onClick={() => handleRegister(tournament.id)}
                      className="w-full btn-primary mt-4"
                      disabled={tournament.participants.includes(user?.id) || tournament.participants.length >= tournament.max_participants}
                      data-testid={`tournament-register-button-${index}`}
                    >
                      {tournament.participants.includes(user?.id) ? 'Inscrit' : tournament.participants.length >= tournament.max_participants ? 'Complet' : "S'inscrire"}
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}