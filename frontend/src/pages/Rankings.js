import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Trophy, Medal, TrendingUp } from 'lucide-react';
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

  const getMedalColor = (index) => {
    if (index === 0) return 'text-yellow-500';
    if (index === 1) return 'text-gray-400';
    if (index === 2) return 'text-amber-700';
    return 'text-gray-300';
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8" data-testid="rankings-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Classement</h1>
          <p className="text-lg text-gray-600 mt-2">Les meilleurs membres du club</p>
        </div>

        {rankings.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Trophy className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucun classement disponible</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {rankings.slice(0, 3).length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {rankings.slice(0, 3).map((player, index) => (
                  <Card key={player.id} className={`glass-card ${index === 0 ? 'md:col-span-3 lg:col-span-1 md:order-2' : ''}`} data-testid={`podium-${index + 1}`}>
                    <CardHeader className="text-center">
                      <div className="flex justify-center mb-4">
                        <div className={`w-20 h-20 rounded-full ${index === 0 ? 'gradient-energy' : index === 1 ? 'bg-gray-400' : 'bg-amber-700'} flex items-center justify-center`}>
                          <span className="text-3xl font-anton text-white">{index + 1}</span>
                        </div>
                      </div>
                      <CardTitle className="text-xl text-[#064E3B]">{player.prenom} {player.nom}</CardTitle>
                      <div className="flex items-center justify-center space-x-2 mt-2">
                        <Trophy className={getMedalColor(index)} />
                        <span className="text-2xl font-bold text-[#FF6B35]">{player.points} pts</span>
                      </div>
                      <p className="text-sm text-gray-600 mt-2">{player.participations} participations</p>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}

            <Card className="glass-card" data-testid="full-rankings-card">
              <CardHeader>
                <CardTitle className="text-2xl font-anton uppercase text-[#064E3B]">Classement Complet</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rankings.map((player, index) => (
                    <div
                      key={player.id}
                      className={`p-4 rounded-xl flex items-center justify-between ${
                        player.id === user?.id ? 'bg-[#FF6B35]/20 border-2 border-[#FF6B35]' : 'bg-white'
                      } hover:bg-[#FF6B35]/10 transition-colors`}
                      data-testid={`ranking-row-${index}`}
                    >
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="w-10 h-10 bg-[#064E3B] rounded-full flex items-center justify-center">
                          <span className="text-white font-bold">{index + 1}</span>
                        </div>
                        <div>
                          <p className="font-bold text-[#064E3B]">
                            {player.prenom} {player.nom}
                            {player.id === user?.id && <span className="ml-2 text-sm text-[#FF6B35]">(Vous)</span>}
                          </p>
                          <p className="text-sm text-gray-600">{player.participations} participations</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5 text-[#FF6B35]" />
                        <span className="text-xl font-bold text-[#064E3B]">{player.points}</span>
                        <span className="text-sm text-gray-600">pts</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}