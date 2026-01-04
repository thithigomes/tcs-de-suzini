import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Checkbox } from '../components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import FloatingBalls from '../components/FloatingBalls';

export default function Login() {
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showNonLicencieDialog, setShowNonLicencieDialog] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    type_licence: 'competition',
    est_licencie: true
  });

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      login(response.data.token, response.data.user);
      toast.success('Connexion réussie!');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    
    if (!registerData.est_licencie) {
      setShowNonLicencieDialog(true);
      return;
    }
    
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/auth/register`, registerData);
      login(response.data.token, response.data.user);
      toast.success('Inscription réussie!');
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      toast.error('Veuillez entrer votre email');
      return;
    }
    try {
      await axios.post(`${API}/auth/forgot-password`, { email: forgotEmail });
      toast.success('Un email de réinitialisation a été envoyé');
      setShowForgotPassword(false);
      setForgotEmail('');
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de l\'email');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center grain-texture relative overflow-hidden" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1628870571205-7e781523bfbc?q=80&w=2000)' }}>
      <FloatingBalls />
      <div className="absolute inset-0 bg-gradient-to-br from-[#064E3B]/90 to-[#FF6B35]/80"></div>
      
      <div className="relative z-10 w-full max-w-6xl mx-4 grid md:grid-cols-2 gap-8 items-center">
        <div className="text-white space-y-6 hidden md:block">
          <h1 className="font-anton text-6xl uppercase tracking-wider animate-slide-in" data-testid="login-title">TCS de Suzini</h1>
          <p className="text-2xl font-manrope font-light animate-slide-in stagger-1">Votre club de volley-ball en Guyane Française</p>
          <div className="space-y-4 mt-8">
            <div className="flex items-center space-x-3 animate-slide-in stagger-2">
              <div className="w-12 h-12 rounded-full bg-[#84CC16] flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏐</span>
              </div>
              <p className="text-lg">Entraînements dirigés & Jeu libre</p>
            </div>
            <div className="flex items-center space-x-3 animate-slide-in stagger-3">
              <div className="w-12 h-12 rounded-full bg-[#84CC16] flex items-center justify-center shadow-lg">
                <span className="text-2xl">🏆</span>
              </div>
              <p className="text-lg">Tournois & Compétitions</p>
            </div>
            <div className="flex items-center space-x-3 animate-slide-in stagger-4">
              <div className="w-12 h-12 rounded-full bg-[#84CC16] flex items-center justify-center shadow-lg">
                <span className="text-2xl">⭐</span>
              </div>
              <p className="text-lg">Badges & Récompenses</p>
            </div>
          </div>
        </div>

        <Card className="glass-card shadow-2xl" data-testid="login-card">
          <CardHeader>
            <CardTitle className="text-3xl font-anton text-[#064E3B]">BIENVENUE</CardTitle>
            <CardDescription>Connectez-vous à votre espace membre</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3" data-testid="login-tabs">
                <TabsTrigger value="login" data-testid="tab-login">Connexion</TabsTrigger>
                <TabsTrigger value="register" data-testid="tab-register">Inscription</TabsTrigger>
                <TabsTrigger value="referent" data-testid="tab-referent">Référent</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                  <div>
                    <Label htmlFor="login-email">Email</Label>
                    <Input
                      id="login-email"
                      data-testid="login-email-input"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="login-password">Mot de passe</Label>
                    <Input
                      id="login-password"
                      data-testid="login-password-input"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-[#FF6B35] hover:underline"
                    data-testid="forgot-password-link"
                  >
                    Mot de passe oublié?
                  </button>
                  <Button type="submit" className="w-full btn-primary" disabled={isLoading} data-testid="login-submit-button">
                    {isLoading ? 'Connexion...' : 'Se connecter'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4" data-testid="register-form">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="prenom">Prénom</Label>
                      <Input
                        id="prenom"
                        data-testid="register-prenom-input"
                        value={registerData.prenom}
                        onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="nom">Nom</Label>
                      <Input
                        id="nom"
                        data-testid="register-nom-input"
                        value={registerData.nom}
                        onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="register-email">Email</Label>
                    <Input
                      id="register-email"
                      data-testid="register-email-input"
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="register-password">Mot de passe</Label>
                    <Input
                      id="register-password"
                      data-testid="register-password-input"
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-3">
                    <Label>Type de licence</Label>
                    <RadioGroup
                      value={registerData.type_licence}
                      onValueChange={(value) => setRegisterData({ ...registerData, type_licence: value })}
                      data-testid="licence-type-radio"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="competition" id="competition" data-testid="radio-competition" />
                        <Label htmlFor="competition" className="cursor-pointer">
                          <span className="badge-competition">Compétition</span>
                          <span className="text-sm text-gray-600 ml-2">(Entraînements + Jeu libre)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jeu_libre" id="jeu_libre" data-testid="radio-jeu-libre" />
                        <Label htmlFor="jeu_libre" className="cursor-pointer">
                          <span className="badge-jeu-libre">Jeu Libre</span>
                          <span className="text-sm text-gray-600 ml-2">(Jeu libre uniquement)</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div className="space-y-3">
                    <Label>Statut de licence</Label>
                    <RadioGroup
                      value={registerData.est_licencie ? "licencie" : "non_licencie"}
                      onValueChange={(value) => setRegisterData({ ...registerData, est_licencie: value === "licencie" })}
                      data-testid="licence-status-radio"
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="licencie" id="licencie" data-testid="radio-licencie" />
                        <Label htmlFor="licencie" className="cursor-pointer">
                          Je suis licencié(e) au club TCS de Suzini
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non_licencie" id="non_licencie" data-testid="radio-non-licencie" />
                        <Label htmlFor="non_licencie" className="cursor-pointer">
                          Non licencié
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full btn-primary" disabled={isLoading} data-testid="register-submit-button">
                    {isLoading ? 'Inscription...' : "S'inscrire"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="referent">
                <form onSubmit={(e) => { e.preventDefault(); handleLogin(e); }} className="space-y-4" data-testid="referent-form">
                  <div className="p-4 bg-[#FF6B35]/10 border border-[#FF6B35]/30 rounded-lg mb-4">
                    <p className="text-sm text-[#064E3B] flex items-center">
                      <span className="mr-2">🔐</span>
                      Espace réservé aux référents (directeurs) du club
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="referent-email">Email</Label>
                    <Input
                      id="referent-email"
                      data-testid="referent-email-input"
                      type="email"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="referent-password">Mot de passe</Label>
                    <Input
                      id="referent-password"
                      data-testid="referent-password-input"
                      type="password"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full btn-primary" disabled={isLoading} data-testid="referent-submit-button">
                    {isLoading ? 'Connexion...' : 'Connexion Référent'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showNonLicencieDialog} onOpenChange={setShowNonLicencieDialog}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-[#064E3B] flex items-center">
              <span className="mr-3 text-3xl">👥</span>
              Vous n'êtes pas encore licencié?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base">
              Demandez une période d'essai pour vous entraîner!
              <br /><br />
              Contactez-nous pour plus d'informations sur comment rejoindre le club TCS de Suzini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className="btn-primary" onClick={() => setShowNonLicencieDialog(false)}>
              D'accord
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <AlertDialogContent className="glass-card">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-[#064E3B]">Mot de passe oublié</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <p>Entrez votre email pour recevoir un lien de réinitialisation</p>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  data-testid="forgot-email-input"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowForgotPassword(false)}>Annuler</Button>
            <Button className="btn-primary" onClick={handleForgotPassword} data-testid="send-reset-button">
              Envoyer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}