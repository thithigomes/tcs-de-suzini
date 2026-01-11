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
import { Trophy, Newspaper, Calendar, Plus, Dumbbell, Edit, Trash2 } from 'lucide-react';
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

  const [trainingData, setTrainingData] = useState({
    jour: '',
    heure_debut: '',
    heure_fin: '',
    type: 'Entraînement',
    licence_requise: 'competition',
    description: ''
  });

  const [trainings, setTrainings] = useState([]);
  const [editingTrainingId, setEditingTrainingId] = useState(null);
  const [loadingTrainings, setLoadingTrainings] = useState(true);

  useEffect(() => {
    fetchTrainings();
  }, [token]);

  const fetchTrainings = async () => {
    try {
      setLoadingTrainings(true);
      const response = await axios.get(`${API}/training-schedule`, {
        timeout: 10000,
        headers: {}
      });
      console.log('✓ Trainings loaded:', response.data);
      setTrainings(response.data || []);
    } catch (error) {
      const errorMsg = error.response?.data?.detail || error.message || 'Erreur inconnue';
      console.error('✗ Error fetching trainings:', errorMsg);
      toast.error('Erreur lors du chargement des treinos: ' + errorMsg);
      setTrainings([]);
    } finally {
      setLoadingTrainings(false);
    }
  };

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

  const handleCreateOrUpdateTraining = async (e) => {
    e.preventDefault();
    try {
      if (editingTrainingId) {
        await axios.put(`${API}/training-schedule/${editingTrainingId}`, trainingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Treino atualizado com sucesso!');
        setEditingTrainingId(null);
      } else {
        await axios.post(`${API}/training-schedule`, trainingData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Treino criado com sucesso!');
      }
      setTrainingData({
        jour: '',
        heure_debut: '',
        heure_fin: '',
        type: 'Entraînement',
        licence_requise: 'competition',
        description: ''
      });
      fetchTrainings();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar o treino');
    }
  };

  const handleEditTraining = (training) => {
    setTrainingData({
      jour: training.jour,
      heure_debut: training.heure_debut,
      heure_fin: training.heure_fin,
      type: training.type,
      licence_requise: training.licence_requise,
      description: training.description
    });
    setEditingTrainingId(training.id);
  };

  const handleDeleteTraining = async (trainingId) => {
    if (window.confirm('Tem certeza que deseja deletar este treino?')) {
      try {
        await axios.delete(`${API}/training-schedule/${trainingId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Treino deletado com sucesso!');
        fetchTrainings();
      } catch (error) {
        toast.error(error.response?.data?.detail || 'Erro ao deletar o treino');
      }
    }
  };

  const handleCancelEdit = () => {
    setEditingTrainingId(null);
    setTrainingData({
      jour: '',
      heure_debut: '',
      heure_fin: '',
      type: 'Entraînement',
      licence_requise: 'competition',
      description: ''
    });
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
          <TabsList className="grid w-full grid-cols-4 mb-8" data-testid="admin-tabs">
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
            <TabsTrigger value="trainings" data-testid="tab-trainings">
              <Dumbbell className="w-4 h-4 mr-2" />
              Treinos
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

          <TabsContent value="trainings">
            <div className="space-y-6">
              <Card className="glass-card" data-testid="create-training-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-anton uppercase text-[#064E3B] flex items-center">
                    <Plus className="w-6 h-6 mr-2" />
                    {editingTrainingId ? 'Editar Treino' : 'Criar Treino'}
                  </CardTitle>
                  <CardDescription>
                    {editingTrainingId ? 'Atualize os detalhes do treino' : 'Adicionar novo treino ao calendário'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateOrUpdateTraining} className="space-y-4" data-testid="training-form">
                    <div>
                      <Label htmlFor="training-jour">Dia da Semana</Label>
                      <select
                        id="training-jour"
                        data-testid="training-day-input"
                        value={trainingData.jour}
                        onChange={(e) => setTrainingData({ ...trainingData, jour: e.target.value })}
                        required
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="">Selecione um dia</option>
                        <option value="Lundi">Segunda-feira</option>
                        <option value="Mardi">Terça-feira</option>
                        <option value="Mercredi">Quarta-feira</option>
                        <option value="Jeudi">Quinta-feira</option>
                        <option value="Vendredi">Sexta-feira</option>
                        <option value="Samedi">Sábado</option>
                        <option value="Dimanche">Domingo</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="training-heure-debut">Hora de Início</Label>
                        <Input
                          id="training-heure-debut"
                          data-testid="training-start-time-input"
                          type="time"
                          value={trainingData.heure_debut}
                          onChange={(e) => setTrainingData({ ...trainingData, heure_debut: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="training-heure-fin">Hora de Fim</Label>
                        <Input
                          id="training-heure-fin"
                          data-testid="training-end-time-input"
                          type="time"
                          value={trainingData.heure_fin}
                          onChange={(e) => setTrainingData({ ...trainingData, heure_fin: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="training-type">Tipo de Treino</Label>
                        <select
                          id="training-type"
                          data-testid="training-type-input"
                          value={trainingData.type}
                          onChange={(e) => setTrainingData({ ...trainingData, type: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="Entraînement">Entraînement</option>
                          <option value="Jeu Libre">Jeu Libre</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="training-licence">Licença Requerida</Label>
                        <select
                          id="training-licence"
                          data-testid="training-license-input"
                          value={trainingData.licence_requise}
                          onChange={(e) => setTrainingData({ ...trainingData, licence_requise: e.target.value })}
                          required
                          className="w-full px-3 py-2 border border-gray-300 rounded-md"
                        >
                          <option value="competition">Compétition</option>
                          <option value="tous">Todos</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="training-description">Descrição</Label>
                      <Textarea
                        id="training-description"
                        data-testid="training-description-input"
                        value={trainingData.description}
                        onChange={(e) => setTrainingData({ ...trainingData, description: e.target.value })}
                        rows={3}
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="flex-1 btn-primary" data-testid="create-training-button">
                        {editingTrainingId ? 'Atualizar Treino' : 'Criar Treino'}
                      </Button>
                      {editingTrainingId && (
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="flex-1">
                          Cancelar
                        </Button>
                      )}
                    </div>
                  </form>
                </CardContent>
              </Card>

              <Card className="glass-card" data-testid="trainings-list-card">
                <CardHeader>
                  <CardTitle className="text-2xl font-anton uppercase text-[#064E3B] flex items-center">
                    <Dumbbell className="w-6 h-6 mr-2" />
                    Treinos Existentes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingTrainings ? (
                    <p className="text-gray-600">Carregando treinos...</p>
                  ) : trainings.length === 0 ? (
                    <p className="text-gray-600">Nenhum treino cadastrado</p>
                  ) : (
                    <div className="space-y-3">
                      {trainings.map((training) => (
                        <div key={training.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h3 className="font-bold text-lg text-[#064E3B]">
                                  {training.jour}
                                </h3>
                                <span className={`px-2 py-1 text-xs font-bold rounded ${
                                  training.type === 'Entraînement'
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-green-100 text-green-700'
                                }`}>
                                  {training.type}
                                </span>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">
                                ⏰ {training.heure_debut} - {training.heure_fin}
                              </p>
                              <p className="text-sm text-gray-600 mb-1">
                                🎫 {training.licence_requise === 'competition' ? 'Compétition' : 'Todos'}
                              </p>
                              <p className="text-sm text-gray-700">{training.description}</p>
                            </div>
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleEditTraining(training)}
                                data-testid={`edit-training-${training.id}`}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteTraining(training.id)}
                                data-testid={`delete-training-${training.id}`}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}