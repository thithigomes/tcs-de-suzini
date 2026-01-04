import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Calendar, MapPin, Clock } from 'lucide-react';
import { toast } from 'sonner';

export default function Matches() {
  const { token } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMatches = async () => {
      try {
        const response = await axios.get(`${API}/matches`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setMatches(response.data);
      } catch (error) {
        console.error('Error fetching matches:', error);
        toast.error('Erreur lors du chargement des matchs');
      } finally {
        setLoading(false);
      }
    };

    fetchMatches();
  }, [token]);

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
        <div className="mb-8" data-testid="matches-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Prochains Matchs</h1>
          <p className="text-lg text-gray-600 mt-2">Calendrier des rencontres à venir</p>
        </div>

        {matches.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucun match programmé pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={match.id} className="glass-card card-hover" data-testid={`match-card-${index}`}>
                <CardContent className="py-6">
                  <div className="grid md:grid-cols-5 gap-6 items-center">
                    <div className="md:col-span-2 text-center md:text-right">
                      <p className="text-2xl font-bold text-[#064E3B]" data-testid={`match-team-a-${index}`}>{match.equipe_a}</p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="text-3xl font-anton text-[#FF6B35] mb-2">VS</div>
                      {match.score_a !== null && match.score_b !== null ? (
                        <div className="text-2xl font-bold text-[#064E3B]">
                          {match.score_a} - {match.score_b}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-600">Non joué</div>
                      )}
                    </div>

                    <div className="md:col-span-2 text-center md:text-left">
                      <p className="text-2xl font-bold text-[#064E3B]" data-testid={`match-team-b-${index}`}>{match.equipe_b}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-200 flex flex-wrap gap-4 justify-center text-sm text-gray-600">
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(match.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-4 h-4 mr-2" />
                      <span>{match.heure}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-2" />
                      <span>{match.lieu}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}