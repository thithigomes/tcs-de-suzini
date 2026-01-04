import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VolleyballEmojis from '../components/VolleyballEmojis';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';

export default function Training() {
  const { token, user } = useContext(AuthContext);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get(`${API}/training-schedule`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setSchedules(response.data);
      } catch (error) {
        console.error('Error fetching schedules:', error);
        toast.error('Erreur lors du chargement des horaires');
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, [token]);

  const canAccess = (schedule) => {
    if (schedule.licence_requise === 'tous') return true;
    if (schedule.licence_requise === 'competition' && user?.type_licence === 'competition') return true;
    return false;
  };

  const groupedSchedules = schedules.reduce((acc, schedule) => {
    if (!acc[schedule.jour]) acc[schedule.jour] = [];
    acc[schedule.jour].push(schedule);
    return acc;
  }, {});

  const jourOrder = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
        <div className="mb-8" data-testid="training-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">
            💪 Entraînements
          </h1>
          <p className="text-lg text-gray-400 mt-2">Horaires d'entraînement et jeu libre</p>
        </div>

        {!user?.est_licencie && (
          <Card className="glass-card mb-8 border-2 border-[#FF6B35]" data-testid="trial-info-banner">
            <CardContent className="py-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0 text-2xl shadow-lg">
                  👥
                </div>
                <div>
                  <h3 className="font-bold text-white text-lg mb-2">Vous n'êtes pas encore licencié?</h3>
                  <p className="text-gray-300">Demandez une période d'essai pour vous entraîner! Contactez-nous pour plus d'informations.</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 gap-6">
          {jourOrder.map((jour) => {
            const daySchedules = groupedSchedules[jour];
            if (!daySchedules || daySchedules.length === 0) return null;

            return (
              <Card key={jour} className="glass-card border-0" data-testid={`training-day-${jour}`}>
                <CardHeader>
                  <CardTitle className="text-2xl font-anton uppercase text-white flex items-center">
                    <span className="mr-3 text-2xl">📅</span>
                    {jour}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {daySchedules.map((schedule, index) => (
                      <div
                        key={schedule.id}
                        className={`p-4 rounded-xl border-2 ${
                          canAccess(schedule)
                            ? 'glass-card border-[#10B981] hover:border-[#84CC16] transition-colors'
                            : 'glass-card border-gray-700 opacity-50'
                        }`}
                        data-testid={`training-session-${index}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                schedule.type === 'Entraînement' 
                                  ? 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]' 
                                  : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]'
                              }`}>
                                {schedule.type === 'Entraînement' ? '🏋️ Entraînement' : '🎮 Jeu Libre'}
                              </span>
                              {schedule.licence_requise === 'competition' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]">
                                  Compétition
                                </span>
                              )}
                              {schedule.licence_requise === 'tous' && (
                                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#84CC16]/20 text-[#84CC16] border border-[#84CC16]">
                                  ✓ Tous
                                </span>
                              )}
                            </div>
                            <p className="text-gray-300">{schedule.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-white">
                              <span className="mr-2 text-xl">⏰</span>
                              <span className="font-bold text-lg">{schedule.heure_debut} - {schedule.heure_fin}</span>
                            </div>
                            {!canAccess(schedule) && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <span className="mr-1">🔒</span>
                                Non accessible
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="glass-card mt-8 border-0" data-testid="training-info-card">
          <CardHeader>
            <CardTitle className="text-xl font-anton uppercase text-white">ℹ️ Informations Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <span className="text-xl">🏆</span>
              <p className="text-gray-300"><strong className="text-white">Licence Compétition:</strong> Accès aux entraînements dirigés ET au jeu libre</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-xl">🎮</span>
              <p className="text-gray-300"><strong className="text-white">Licence Jeu Libre:</strong> Accès uniquement au jeu libre</p>
            </div>
            <div className="flex items-start space-x-3">
              <span className="text-xl">🎒</span>
              <p className="text-gray-300"><strong className="text-white">Matériel:</strong> Pensez à apporter vos chaussures de sport et une bouteille d'eau</p>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}
