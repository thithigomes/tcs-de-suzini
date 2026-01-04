import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VolleyballEmojis from '../components/VolleyballEmojis';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
        <div className="mb-8" data-testid="profile-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">
            👤 Mon Profil
          </h1>
          <p className="text-lg text-gray-400 mt-2">Vos informations et accomplissements</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card className="glass-card border-0" data-testid="profile-info-card">
              <CardHeader className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-[#FF6B35] to-[#10B981] rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">
                  👤
                </div>
                <CardTitle className="text-2xl text-white" data-testid="profile-name">
                  {profile?.prenom} {profile?.nom}
                </CardTitle>
                <CardDescription className="text-gray-400">{profile?.email}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 glass-card border-0">
                  <p className="text-sm text-gray-400 mb-2">🎫 Type de licence</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    profile?.type_licence === 'competition' 
                      ? 'bg-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]' 
                      : 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]'
                  }`}>
                    {profile?.type_licence === 'competition' ? 'Compétition' : 'Jeu Libre'}
                  </span>
                </div>
                <div className="p-4 glass-card border-0">
                  <p className="text-sm text-gray-400 mb-2">✅ Statut</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${
                    profile?.est_licencie 
                      ? 'bg-[#10B981]/20 text-[#10B981] border-[#10B981]' 
                      : 'bg-gray-500/20 text-gray-400 border-gray-500'
                  }`}>
                    {profile?.est_licencie ? 'Licencié' : 'Non licencié'}
                  </span>
                </div>
                <div className="p-4 glass-card border-0">
                  <p className="text-sm text-gray-400 mb-2">📅 Membre depuis</p>
                  <p className="font-bold text-white">{new Date(profile?.date_creation).toLocaleDateString('fr-FR')}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="glass-card border-0" data-testid="profile-stat-points">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#FF6B35] to-[#ff8854] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      ⭐
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Points</p>
                      <p className="text-2xl font-bold text-white">{profile?.points || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0" data-testid="profile-stat-participations">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#10B981] to-[#34d399] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🎯
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Participations</p>
                      <p className="text-2xl font-bold text-white">{profile?.participations || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="glass-card border-0" data-testid="profile-stat-achievements">
                <CardContent className="pt-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#84CC16] to-[#a3e635] rounded-xl flex items-center justify-center text-2xl shadow-lg">
                      🎖️
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Badges</p>
                      <p className="text-2xl font-bold text-white">{profile?.achievements?.length || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass-card border-0" data-testid="achievements-card">
              <CardHeader>
                <CardTitle className="text-2xl font-anton uppercase text-white flex items-center">
                  <span className="mr-3 text-2xl">🏆</span>
                  Badges & Récompenses
                </CardTitle>
                <CardDescription className="text-gray-400">Vos accomplissements au club</CardDescription>
              </CardHeader>
              <CardContent>
                {!profile?.achievements || profile.achievements.length === 0 ? (
                  <div className="text-center py-12">
                    <span className="text-6xl mb-4 block">🎖️</span>
                    <p className="text-gray-400">Aucun badge obtenu pour le moment</p>
                    <p className="text-sm text-gray-500 mt-2">Participez aux événements du club pour débloquer des badges!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.achievements.map((achievement, index) => (
                      <div
                        key={achievement.id}
                        className="p-4 glass-card border-2 border-[#84CC16] hover:border-[#10B981] transition-colors"
                        data-testid={`achievement-card-${index}`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="text-4xl">{achievement.icone}</div>
                          <div className="flex-1">
                            <h4 className="font-bold text-white mb-1" data-testid={`achievement-name-${index}`}>
                              {achievement.nom}
                            </h4>
                            <p className="text-sm text-gray-400 mb-2">{achievement.description}</p>
                            <p className="text-xs text-gray-500">
                              📅 {new Date(achievement.date_obtenu).toLocaleDateString('fr-FR')}
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
      <Footer />
    </div>
  );
}
