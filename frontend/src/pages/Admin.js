import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Trophy, Newspaper, Calendar, Plus } from 'lucide-react';
import { toast } from 'sonner';

export default function Admin() {
  const { token } = useContext(AuthContext);
  const [tournamentData, setTournamentData] = useState({
    nom: '',
    description: '',
    date_debut: '',
    date_fin: '',
    max_participants: 16
  });

  const [newsData, setNewsData] = useState({
    titre: '',
    contenu: '',
    image_url: ''
  });

  const [matchData, setMatchData] = useState({
    equipe_a: '',
    equipe_b: '',
    date: '',
    heure: '',
    lieu: 'Salle TCS Suzini'
  });

  const handleCreateTournament = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/tournaments`, tournamentData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Tournoi créé avec succès!');
      setTournamentData({
        nom: '',
        description: '',
        date_debut: '',
        date_fin: '',
        max_participants: 16
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création du tournoi');
    }
  };

  const handleCreateNews = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/news`, newsData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Actualité publiée avec succès!');
      setNewsData({ titre: '', contenu: '', image_url: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de la publication de l'actualité");
    }
  };

  const handleCreateMatch = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API}/matches`, matchData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Match créé avec succès!');
      setMatchData({
        equipe_a: '',
        equipe_b: '',
        date: '',
        heure: '',
        lieu: 'Salle TCS Suzini'
      });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la création du match');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFF7ED]">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8" data-testid="admin-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Administration</h1>
          <p className="text-lg text-gray-600 mt-2">Gestion du club TCS de Suzini</p>
        </div>

        <Tabs defaultValue="tournaments" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8" data-testid="admin-tabs">
            <TabsTrigger value="tournaments" data-testid="tab-tournaments">
              <Trophy className="w-4 h-4 mr-2" />
              Tournois
            </TabsTrigger>
            <TabsTrigger value="news" data-testid="tab-news">
              <Newspaper className="w-4 h-4 mr-2" />
              Actualités
            </TabsTrigger>
            <TabsTrigger value="matches" data-testid="tab-matches">
              <Calendar className="w-4 h-4 mr-2" />
              Matchs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="tournaments">
            <Card className="glass-card" data-testid="create-tournament-card">
              <CardHeader>
                <CardTitle className="text-2xl font-anton uppercase text-[#064E3B] flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Créer un Tournoi
                </CardTitle>
                <CardDescription>Ajouter un nouveau tournoi au calendrier</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateTournament} className="space-y-4" data-testid="tournament-form">
                  <div>
                    <Label htmlFor="tournament-nom">Nom du tournoi</Label>
                    <Input
                      id="tournament-nom"
                      data-testid="tournament-name-input"
                      value={tournamentData.nom}
                      onChange={(e) => setTournamentData({ ...tournamentData, nom: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="tournament-description">Description</Label>
                    <Textarea
                      id="tournament-description"
                      data-testid="tournament-description-input"
                      value={tournamentData.description}
                      onChange={(e) => setTournamentData({ ...tournamentData, description: e.target.value })}
                      rows={3}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tournament-date-debut">Date de début</Label>
                      <Input
                        id="tournament-date-debut"
                        data-testid="tournament-start-date-input"
                        type="date"
                        value={tournamentData.date_debut}
                        onChange={(e) => setTournamentData({ ...tournamentData, date_debut: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="tournament-date-fin">Date de fin</Label>
                      <Input
                        id="tournament-date-fin"
                        data-testid="tournament-end-date-input"
                        type="date"
                        value={tournamentData.date_fin}
                        onChange={(e) => setTournamentData({ ...tournamentData, date_fin: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="tournament-max">Nombre maximum de participants</Label>
                    <Input
                      id="tournament-max"
                      data-testid="tournament-max-participants-input"
                      type="number"
                      min="2"
                      value={tournamentData.max_participants}
                      onChange={(e) => setTournamentData({ ...tournamentData, max_participants: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary" data-testid="create-tournament-button">
                    Créer le Tournoi
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="news">
            <Card className="glass-card" data-testid="create-news-card">
              <CardHeader>
                <CardTitle className="text-2xl font-anton uppercase text-[#064E3B] flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Publier une Actualité
                </CardTitle>
                <CardDescription>Partager les dernières nouvelles du club</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateNews} className="space-y-4" data-testid="news-form">
                  <div>
                    <Label htmlFor="news-titre">Titre</Label>
                    <Input
                      id="news-titre"
                      data-testid="news-title-input"
                      value={newsData.titre}
                      onChange={(e) => setNewsData({ ...newsData, titre: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-contenu">Contenu</Label>
                    <Textarea
                      id="news-contenu"
                      data-testid="news-content-input"
                      value={newsData.contenu}
                      onChange={(e) => setNewsData({ ...newsData, contenu: e.target.value })}
                      rows={6}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="news-image">URL de l'image (optionnel)</Label>
                    <Input
                      id="news-image"
                      data-testid="news-image-input"
                      type="url"
                      value={newsData.image_url}
                      onChange={(e) => setNewsData({ ...newsData, image_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary" data-testid="create-news-button">
                    Publier l'Actualité
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches">
            <Card className="glass-card" data-testid="create-match-card">
              <CardHeader>
                <CardTitle className="text-2xl font-anton uppercase text-[#064E3B] flex items-center">
                  <Plus className="w-6 h-6 mr-2" />
                  Créer un Match
                </CardTitle>
                <CardDescription>Ajouter un match au calendrier</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateMatch} className="space-y-4" data-testid="match-form">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="match-equipe-a">Équipe A</Label>
                      <Input
                        id="match-equipe-a"
                        data-testid="match-team-a-input"
                        value={matchData.equipe_a}
                        onChange={(e) => setMatchData({ ...matchData, equipe_a: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="match-equipe-b">Équipe B</Label>
                      <Input
                        id="match-equipe-b"
                        data-testid="match-team-b-input"
                        value={matchData.equipe_b}
                        onChange={(e) => setMatchData({ ...matchData, equipe_b: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="match-date">Date</Label>
                      <Input
                        id="match-date"
                        data-testid="match-date-input"
                        type="date"
                        value={matchData.date}
                        onChange={(e) => setMatchData({ ...matchData, date: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="match-heure">Heure</Label>
                      <Input
                        id="match-heure"
                        data-testid="match-time-input"
                        type="time"
                        value={matchData.heure}
                        onChange={(e) => setMatchData({ ...matchData, heure: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="match-lieu">Lieu</Label>
                    <Input
                      id="match-lieu"
                      data-testid="match-location-input"
                      value={matchData.lieu}
                      onChange={(e) => setMatchData({ ...matchData, lieu: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary" data-testid="create-match-button">
                    Créer le Match
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}