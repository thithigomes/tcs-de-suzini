import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Award, TrendingUp, Calendar, Trophy, User } from 'lucide-react';
import { toast } from 'sonner';

export default function Profile() {
  const { token, user } = useContext(AuthContext);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get(`${API}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProfile(response.data);
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8" data-testid="profile-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Mon Profil</h1>
          <p className="text-lg text-gray-600 mt-2">Vos informations et accomplissements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="glass-card" data-testid="profile-info-card">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-energy rounded-full mx-auto mb-4 flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <CardTitle className="text-2xl text-[#064E3B]" data-testid="profile-name">
                  {profile?.prenom} {profile?.nom}
                </CardTitle>
                <CardDescription>{profile?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Type de licence</p>
                  <span className={`${profile?.type_licence === 'competition' ? 'badge-competition' : 'badge-jeu-libre'}`}>
                    {profile?.type_licence === 'competition' ? 'Compétition' : 'Jeu Libre'}
                  </span>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Statut</p>
                  <span className={`badge-achievement ${profile?.est_licencie ? 'bg-[#84CC16]/20 text-[#84CC16]' : 'bg-gray-200 text-gray-600'}`}>
                    {profile?.est_licencie ? 'Licencié' : 'Non licencié'}
                  </span>
                </div>
                <div className="p-4 bg-white rounded-xl">
                  <p className="text-sm text-gray-600 mb-1">Membre depuis</p>
                  <p className="font-bold text-[#064E3B]">{new Date(profile?.date_creation).toLocaleDateString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card" data-testid="profile-stat-points">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#FF6B35] rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Points</p>
                      <p className="text-2xl font-bold text-[#064E3B]">{profile?.points || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card" data-testid="profile-stat-participations">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#064E3B] rounded-xl flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Participations</p>
                      <p className="text-2xl font-bold text-[#064E3B]">{profile?.participations || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card" data-testid="profile-stat-achievements">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-[#84CC16] rounded-xl flex items-center justify-center">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Badges</p>
                      <p className="text-2xl font-bold text-[#064E3B]">{profile?.achievements?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card" data-testid="achievements-card">
              <CardHeader>
                <CardTitle className="text-2xl font-anton uppercase text-[#064E3B] flex items-center">
                  <Trophy className="w-6 h-6 mr-3 text-[#FF6B35]" />
                  Badges & Récompenses
                </CardTitle>
                <CardDescription>Vos accomplissements au club</CardDescription>
              </CardHeader>
              <CardContent>
                {!profile?.achievements || profile.achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <Award className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Aucun badge obtenu pour le moment</p>
                    <p className="text-sm text-gray-500 mt-2">Participez aux événements du club pour débloquer des badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={achievement.id}
                        className="p-4 bg-white rounded-xl border-2 border-[#84CC16]/30 hover:border-[#84CC16] transition-colors"
                        data-testid={`achievement-card-${index}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-4xl">{achievement.icone}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-[#064E3B] mb-1" data-testid={`achievement-name-${index}`}>{achievement.nom}</h4>
                            <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                            <p className="text-xs text-gray-500">
                              Obtenu le {new Date(achievement.date_obtenu).toLocaleDateString('fr-FR')}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}