import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Clock, Calendar, Users, Info } from 'lucide-react';
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8" data-testid="training-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Entraînements</h1>
          <p className="text-lg text-gray-600 mt-2">Horaires d'entraînement et jeu libre</p>
        </div>

        {!user?.est_licencie && (
          <Card className="glass-card mb-8 border-2 border-[#FF6B35]" data-testid="trial-info-banner">
            <CardContent className="py-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#FF6B35] rounded-full flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-[#064E3B] text-lg mb-2">Vous n'êtes pas encore licencié?</h3>
                  <p className="text-gray-600">Demandez une période d'essai pour vous entraîner! Contactez-nous pour plus d'informations.</p>
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
              <Card key={jour} className="glass-card" data-testid={`training-day-${jour}`}>
                <CardHeader>
                  <CardTitle className="text-2xl font-anton uppercase text-[#064E3B] flex items-center">
                    <Calendar className="w-6 h-6 mr-3 text-[#FF6B35]" />
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
                            ? 'bg-white border-[#84CC16]/30 hover:border-[#84CC16] transition-colors'
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                        data-testid={`training-session-${index}`}
                      >
                        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-3 md:space-y-0">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`badge-achievement ${
                                schedule.type === 'Entraînement' ? 'bg-[#FF6B35]/20 text-[#FF6B35]' : 'bg-[#064E3B]/20 text-[#064E3B]'
                              }`}>
                                {schedule.type}
                              </span>
                              {schedule.licence_requise === 'competition' && (
                                <span className="badge-competition">Compétition</span>
                              )}
                              {schedule.licence_requise === 'tous' && (
                                <span className="badge-achievement bg-[#84CC16]/20 text-[#84CC16]">Tous</span>
                              )}
                            </div>
                            <p className="text-gray-700">{schedule.description}</p>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center text-[#064E3B]">
                              <Clock className="w-5 h-5 mr-2 text-[#FF6B35]" />
                              <span className="font-bold text-lg">{schedule.heure_debut} - {schedule.heure_fin}</span>
                            </div>
                            {!canAccess(schedule) && (
                              <div className="flex items-center text-gray-500 text-sm">
                                <Info className="w-4 h-4 mr-1" />
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

        <Card className="glass-card mt-8" data-testid="training-info-card">
          <CardHeader>
            <CardTitle className="text-xl font-anton uppercase text-[#064E3B]">Informations Importantes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#FF6B35] rounded-full mt-2"></div>
              <p className="text-gray-700"><strong>Licence Compétition:</strong> Accès aux entraînements dirigés ET au jeu libre</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#064E3B] rounded-full mt-2"></div>
              <p className="text-gray-700"><strong>Licence Jeu Libre:</strong> Accès uniquement au jeu libre</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-[#84CC16] rounded-full mt-2"></div>
              <p className="text-gray-700"><strong>Matériel:</strong> Pensez à apporter vos chaussures de sport et une bouteille d'eau</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}