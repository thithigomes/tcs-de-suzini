import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Newspaper, Calendar, User } from 'lucide-react';
import { toast } from 'sonner';

export default function News() {
  const { token } = useContext(AuthContext);
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await axios.get(`${API}/news`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setNews(response.data);
      } catch (error) {
        console.error('Error fetching news:', error);
        toast.error('Erreur lors du chargement des actualités');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8" data-testid="news-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-[#064E3B] tracking-wider">Actualités</h1>
          <p className="text-lg text-gray-600 mt-2">Les dernières nouvelles du club</p>
        </div>

        {news.length === 0 ? (
          <Card className="glass-card">
            <CardContent className="py-12 text-center">
              <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 text-lg">Aucune actualité disponible pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {news.map((article, index) => (
              <Card key={article.id} className="glass-card card-hover" data-testid={`news-card-${index}`}>
                {article.image_url && (
                  <div className="w-full h-64 overflow-hidden rounded-t-2xl">
                    <img
                      src={article.image_url}
                      alt={article.titre}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <CardTitle className="text-2xl font-bold text-[#064E3B]" data-testid={`news-title-${index}`}>
                    {article.titre}
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <User className="w-4 h-4 mr-2" />
                      <span>{article.auteur_nom}</span>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      <span>{new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 whitespace-pre-line" data-testid={`news-content-${index}`}>{article.contenu}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}