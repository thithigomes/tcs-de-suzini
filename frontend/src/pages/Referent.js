import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingBalls from '../components/FloatingBalls';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Users, Search, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function Referent() {
  const { token } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchQuery) {
      const filtered = users.filter(user => 
        user.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.prenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers(users);
    }
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/referent/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleLicense = async (userId) => {
    try {
      const response = await axios.patch(`${API}/referent/users/${userId}/toggle-license`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Statut de licence modifié');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur?')) {
      return;
    }
    try {
      await axios.delete(`${API}/referent/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Utilisateur supprimé');
      fetchUsers();
    } catch (error) {
      toast.error('Erreur lors de la suppression');
    }
  };

  const stats = {
    total: users.length,
    licencies: users.filter(u => u.est_licencie).length,
    nonLicencies: users.filter(u => !u.est_licencie).length,
    competition: users.filter(u => u.type_licence === 'competition').length
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e]">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-300 text-xl">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#1a1f2e] relative flex flex-col">
      <FloatingBalls />
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex-1">
        <div className="mb-8" data-testid="referent-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">Gestion des Membres</h1>
          <p className="text-lg text-gray-400 mt-2">Espace référent - Accès total</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Total</p>
                  <p className="text-3xl font-bold text-white">{stats.total}</p>
                </div>
                <Users className="w-10 h-10 text-[#FF6B35]" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Licenciés</p>
                  <p className="text-3xl font-bold text-white">{stats.licencies}</p>
                </div>
                <CheckCircle className="w-10 h-10 text-[#84CC16]" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Non Licenciés</p>
                  <p className="text-3xl font-bold text-white">{stats.nonLicencies}</p>
                </div>
                <XCircle className="w-10 h-10 text-gray-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400">Compétition</p>
                  <p className="text-3xl font-bold text-white">{stats.competition}</p>
                </div>
                <Users className="w-10 h-10 text-[#064E3B]" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="glass-card" data-testid="users-table-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-anton uppercase text-white">Liste des Membres</CardTitle>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Rechercher..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="search-input"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-600">
                    <th className="text-left py-3 px-4 font-bold text-gray-200">Nom</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-200">Email</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-200">Type</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-200">Licence</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-200">Rôle</th>
                    <th className="text-left py-3 px-4 font-bold text-gray-200">Points</th>
                    <th className="text-right py-3 px-4 font-bold text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr key={user.id} className="border-b border-gray-700 hover:bg-[#252b3d]" data-testid={`user-row-${index}`}>
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-white">{user.prenom} {user.nom}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">{user.email}</td>
                      <td className="py-3 px-4">
                        <span className={`${user.type_licence === 'competition' ? 'badge-competition' : 'badge-jeu-libre'} text-xs`}>
                          {user.type_licence === 'competition' ? 'Compétition' : 'Jeu Libre'}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`badge-achievement text-xs ${user.est_licencie ? 'bg-[#84CC16]/20 text-[#84CC16]' : 'bg-gray-200 text-gray-600'}`}>
                          {user.est_licencie ? 'Licencié' : 'Non licencié'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <span className="capitalize text-gray-300">{user.role}</span>
                      </td>
                      <td className="py-3 px-4 font-bold text-white">{user.points}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleLicense(user.id)}
                            disabled={user.role === 'referent'}
                            data-testid={`toggle-license-${index}`}
                          >
                            {user.est_licencie ? 'Révoquer' : 'Valider'}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={user.role === 'referent'}
                            data-testid={`delete-user-${index}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
}