import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VolleyballEmojis from '../components/VolleyballEmojis';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

export default function Rankings() {
  const { token, user } = useContext(AuthContext);
  const [rankings, setRankings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const response = await axios.get(`${API}/rankings`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRankings(response.data);
      } catch (error) {
        console.error('Error fetching rankings:', error);
        toast.error('Erreur lors du chargement du classement');
      } finally {
        setLoading(false);
      }
    };

    fetchRankings();
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
        <div className="mb-8" data-testid="rankings-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">
            📊 Classement
          </h1>
          <p className="text-lg text-gray-400 mt-2">Les meilleurs membres du club</p>
        </div>

        {rankings.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <span className="text-6xl mb-4 block">🏆</span>
              <p className="text-gray-400 text-lg">Aucun classement disponible</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rankings.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {rankings.slice(0, 3).map((player, index) => (
                  <Card key={player.id} className="glass-card border-0" data-testid={`podium-${index + 1}`}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`w-20 h-20 rounded-full ${
                          index === 0 ? 'bg-gradient-to-br from-[#FFD700] to-[#FFA500]' : 
                          index === 1 ? 'bg-gradient-to-br from-[#C0C0C0] to-[#808080]' : 
                          'bg-gradient-to-br from-[#CD7F32] to-[#8B4513]'
                        } flex items-center justify-center shadow-lg`}>
                          <span className="text-3xl font-anton text-white">{index + 1}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-white">{player.prenom} {player.nom}</CardTitle>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <span className="text-2xl">{index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}</span>
                        <span className="text-2xl font-bold text-[#FF6B35]">{player.points} pts</span>
                      </div>
                      <p className="text-sm text-gray-400 mt-2">🎯 {player.participations} participations</p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            <Card className="glass-card border-0" data-testid="full-rankings-card">
              <CardHeader>
                <CardTitle className="text-2xl font-anton uppercase text-white">Classement Complet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rankings.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-xl flex items-center justify-between ${
                        player.id === user?.id ? 'bg-[#FF6B35]/20 border-2 border-[#FF6B35]' : 'glass-card border-0'
                      } hover:bg-white/10 transition-colors`}
                      data-testid={`ranking-row-${index}`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#10B981] rounded-full flex items-center justify-center shadow-lg">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-bold text-white">
                            {player.prenom} {player.nom}
                            {player.id === user?.id && <span className="ml-2 text-sm text-[#FF6B35]">(Vous)</span>}
                          </p>
                          <p className="text-sm text-gray-400">🎯 {player.participations} participations</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xl">⭐</span>
                        <span className="text-xl font-bold text-white">{player.points}</span>
                        <span className="text-sm text-gray-400">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
