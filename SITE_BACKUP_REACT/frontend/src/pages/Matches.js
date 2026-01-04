import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VolleyballEmojis from '../components/VolleyballEmojis';
import { Card, CardContent } from '../components/ui/card';
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
        <div className="mb-8" data-testid="matches-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">
            🏐 Prochains Matchs
          </h1>
          <p className="text-lg text-gray-400 mt-2">Calendrier des rencontres à venir</p>
        </div>

        {matches.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <span className="text-6xl mb-4 block">🏐</span>
              <p className="text-gray-400 text-lg">Aucun match programmé pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {matches.map((match, index) => (
              <Card key={match.id} className="glass-card card-hover border-0" data-testid={`match-card-${index}`}>
                <CardContent className="py-6">
                  <div className="grid md:grid-cols-5 gap-6 items-center">
                    <div className="md:col-span-2 text-center md:text-right">
                      <p className="text-2xl font-bold text-white" data-testid={`match-team-a-${index}`}>
                        {match.equipe_a}
                      </p>
                    </div>

                    <div className="flex flex-col items-center justify-center">
                      <div className="text-4xl font-anton text-[#FF6B35] mb-2">VS</div>
                      {match.score_a !== null && match.score_b !== null ? (
                        <div className="text-3xl font-bold text-white">
                          {match.score_a} - {match.score_b}
                        </div>
                      ) : (
                        <div className="text-sm text-gray-400 bg-[#10B981]/20 px-3 py-1 rounded-full border border-[#10B981]">
                          À venir
                        </div>
                      )}
                    </div>

                    <div className="md:col-span-2 text-center md:text-left">
                      <p className="text-2xl font-bold text-white" data-testid={`match-team-b-${index}`}>
                        {match.equipe_b}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-gray-700 flex flex-wrap gap-4 justify-center text-sm text-gray-400">
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>{new Date(match.date).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">⏰</span>
                      <span>{match.heure}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📍</span>
                      <span>{match.lieu}</span>
                    </div>
                  </div>
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
