import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import VolleyballEmojis from '../components/VolleyballEmojis';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
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
        <div className="mb-8" data-testid="news-header">
          <h1 className="text-4xl md:text-5xl font-anton uppercase text-white tracking-wider">
            📰 Actualités
          </h1>
          <p className="text-lg text-gray-400 mt-2">Les dernières nouvelles du club</p>
        </div>

        {news.length === 0 ? (
          <Card className="glass-card border-0">
            <CardContent className="py-12 text-center">
              <span className="text-6xl mb-4 block">📰</span>
              <p className="text-gray-400 text-lg">Aucune actualité disponible pour le moment</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {news.map((article, index) => (
              <Card key={article.id} className="glass-card card-hover border-0" data-testid={`news-card-${index}`}>
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
                  <CardTitle className="text-2xl font-bold text-white flex items-start" data-testid={`news-title-${index}`}>
                    <span className="mr-3 text-3xl">📢</span>
                    <span>{article.titre}</span>
                  </CardTitle>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mt-2">
                    <div className="flex items-center">
                      <span className="mr-2">👤</span>
                      <span>{article.auteur_nom}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-2">📅</span>
                      <span>{new Date(article.date_publication).toLocaleDateString('fr-FR')}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-300 whitespace-pre-line" data-testid={`news-content-${index}`}>
                    {article.contenu}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
