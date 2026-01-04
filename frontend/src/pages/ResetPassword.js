import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { API } from '../App';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import FloatingBalls from '../components/FloatingBalls';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setIsLoading(true);
    try {
      await axios.post(`${API}/auth/reset-password`, {
        token: token,
        new_password: password
      });
      toast.success('Mot de passe réinitialisé avec succès!');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur lors de la réinitialisation');
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FFF7ED]">
        <Card className="glass-card w-full max-w-md">
          <CardContent className="py-12 text-center">
            <p className="text-red-600">Lien invalide ou expiré</p>
            <Button onClick={() => navigate('/login')} className="mt-4 btn-primary">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1628870571205-7e781523bfbc?q=80&w=2000)' }}>
      <FloatingBalls />
      <div className="absolute inset-0 bg-gradient-to-br from-[#064E3B]/90 to-[#FF6B35]/80"></div>
      
      <Card className="glass-card shadow-2xl w-full max-w-md mx-4 relative z-10" data-testid="reset-password-card">
        <CardHeader>
          <CardTitle className="text-3xl font-anton text-[#064E3B]">RÉINITIALISER</CardTitle>
          <CardDescription>Créez un nouveau mot de passe</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleReset} className="space-y-4" data-testid="reset-form">
            <div>
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                data-testid="new-password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <div>
              <Label htmlFor="confirm-password">Confirmer le mot de passe</Label>
              <Input
                id="confirm-password"
                data-testid="confirm-password-input"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>
            <Button type="submit" className="w-full btn-primary" disabled={isLoading} data-testid="reset-submit-button">
              {isLoading ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}