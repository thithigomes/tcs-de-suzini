import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import VolleyballEmojis from '../components/VolleyballEmojis';

export default function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [showNonLicencieDialog, setShowNonLicencieDialog] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showReferentVerification, setShowReferentVerification] = useState(false);
  const [referentEmail, setReferentEmail] = useState('');
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

  const [referentData, setReferentData] = useState({
    email: '',
    password: '',
    nom: '',
    prenom: '',
    code_secret: ''
  });

  const [verificationCode, setVerificationCode] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/auth/login`, loginData);
      login(response.data.token, response.data.user);
      toast.success('Connexion réussie!');
      // Esperar um pouco mais para o state atualizar
      setTimeout(() => navigate('/'), 200);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = (e) => {
    e.preventDefault();
    // Simuler login com token fake para visitante
    const guestUser = {
      id: 'guest',
      email: 'visiteur@temp.com',
      nom: 'Visiteur',
      prenom: 'Temporaire',
      type_licence: 'visiteur'
    };
    login('temp-guest-token', guestUser);
    // Forçar navegação para dashboard
    setTimeout(() => navigate('/'), 200);
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
      setTimeout(() => navigate('/'), 200);
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur d'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReferentRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const fullCode = `TCS-REF-${referentData.code_secret}`;
      await axios.post(`${API}/auth/register-referent`, {
        ...referentData,
        code_secret: fullCode
      });
      setReferentEmail(referentData.email);
      setShowReferentVerification(true);
      toast.success('Code envoyé à votre email!');
    } catch (error) {
      toast.error(error.response?.data?.detail || "Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyReferent = async () => {
    if (!verificationCode) {
      toast.error('Entrez le code de vérification');
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post(`${API}/auth/verify-referent`, {
        email: referentEmail,
        code_verification: verificationCode
      });
      login(response.data.token, response.data.user);
      toast.success('Compte référent créé avec succès!');
      setShowReferentVerification(false);
      setTimeout(() => navigate('/'), 200);
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Code invalide');
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
      toast.error("Erreur lors de l'envoi de l'email");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden" 
         style={{ background: '#1a1f2e' }}>
      <VolleyballEmojis />
      <div className="grain-texture absolute inset-0"></div>
      
      <div className="relative z-10 w-full max-w-md mx-4">
        <Card className="glass-card shadow-2xl border-0" data-testid="login-card">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="text-center mb-8">
              <img 
                src="/images/tcs-logo.png" 
                alt="TCS Suzini Logo" 
                className="h-32 w-auto mx-auto mb-4"
              />
              <h1 className="font-anton text-4xl text-[#FF6B35] mb-2" style={{ letterSpacing: '0.05em' }}>
                TCS de Suzini
              </h1>
              <p className="text-sm text-gray-400">Beach Volley</p>
            </div>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-[#252b3d] mb-6">
                <TabsTrigger value="login" className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white">
                  Connexion
                </TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-[#FF6B35] data-[state=active]:text-white">
                  Inscription
                </TabsTrigger>
                <TabsTrigger value="referent" className="data-[state=active]:bg-[#10B981] data-[state=active]:text-white">
                  Référent
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4" data-testid="login-form">
                  <div>
                    <Label htmlFor="email" className="text-gray-300">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                      className="bg-[#252b3d] border-gray-700 text-white placeholder:text-gray-500 mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password" className="text-gray-300">Mot de passe</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                      className="bg-[#252b3d] border-gray-700 text-white placeholder:text-gray-500 mt-1"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        id="remember" 
                        checked={rememberMe}
                        onCheckedChange={setRememberMe}
                      />
                      <label htmlFor="remember" className="text-sm text-gray-400 cursor-pointer">
                        Se souvenir
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-gray-400 hover:text-[#FF6B35] transition-colors"
                    >
                      Mot de passe oublié?
                    </button>
                  </div>

                  <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                    {isLoading ? 'CONNEXION...' : 'SE CONNECTER'}
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-[#1a1f2e] text-gray-400">ou</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGuestLogin}
                    className="w-full px-4 py-2 bg-[#252b3d] hover:bg-[#2a3147] border border-gray-700 text-gray-300 rounded-lg transition-colors duration-200"
                  >
                    👤 Accès Visiteur (Temporaire)
                  </button>
                  <p className="text-xs text-gray-500 text-center">*Données non sauvegardées</p>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-sm">Prénom</Label>
                      <Input
                        value={registerData.prenom}
                        onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                        required
                        className="bg-[#252b3d] border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Nom</Label>
                      <Input
                        value={registerData.nom}
                        onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                        required
                        className="bg-[#252b3d] border-gray-700 text-white mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Email</Label>
                    <Input
                      type="email"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className="bg-[#252b3d] border-gray-700 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Mot de passe</Label>
                    <Input
                      type="password"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className="bg-[#252b3d] border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">Type de licence</Label>
                    <RadioGroup
                      value={registerData.type_licence}
                      onValueChange={(value) => setRegisterData({ ...registerData, type_licence: value })}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="competition" id="comp" />
                        <Label htmlFor="comp" className="text-gray-300 text-sm cursor-pointer">
                          Compétition
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="jeu_libre" id="libre" />
                        <Label htmlFor="libre" className="text-gray-300 text-sm cursor-pointer">
                          Jeu Libre
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm mb-2 block">Statut</Label>
                    <RadioGroup
                      value={registerData.est_licencie ? "licencie" : "non_licencie"}
                      onValueChange={(value) => setRegisterData({ ...registerData, est_licencie: value === "licencie" })}
                    >
                      <div className="flex items-center space-x-2 mb-2">
                        <RadioGroupItem value="licencie" id="lic" />
                        <Label htmlFor="lic" className="text-gray-300 text-sm cursor-pointer">
                          Je suis licencié(e)
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="non_licencie" id="nonlic" />
                        <Label htmlFor="nonlic" className="text-gray-300 text-sm cursor-pointer">
                          Non licencié
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type="submit" className="w-full btn-primary" disabled={isLoading}>
                    {isLoading ? 'INSCRIPTION...' : "S'INSCRIRE"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="referent">
                <form onSubmit={handleReferentRegister} className="space-y-4">
                  <div className="p-3 bg-[#10B981]/10 border border-[#10B981]/30 rounded-lg mb-4">
                    <p className="text-sm text-[#10B981] text-center font-medium">
                      🔐 Espace réservé aux référents
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-gray-300 text-sm">Prénom</Label>
                      <Input
                        value={referentData.prenom}
                        onChange={(e) => setReferentData({ ...referentData, prenom: e.target.value })}
                        required
                        className="bg-[#252b3d] border-gray-700 text-white mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 text-sm">Nom</Label>
                      <Input
                        value={referentData.nom}
                        onChange={(e) => setReferentData({ ...referentData, nom: e.target.value })}
                        required
                        className="bg-[#252b3d] border-gray-700 text-white mt-1"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Email</Label>
                    <Input
                      type="email"
                      value={referentData.email}
                      onChange={(e) => setReferentData({ ...referentData, email: e.target.value })}
                      required
                      className="bg-[#252b3d] border-gray-700 text-white mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label className="text-gray-300 text-sm">Mot de passe</Label>
                    <Input
                      type="password"
                      value={referentData.password}
                      onChange={(e) => setReferentData({ ...referentData, password: e.target.value })}
                      required
                      className="bg-[#252b3d] border-gray-700 text-white mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 text-sm">Code Secret</Label>
                    <div className="relative mt-1">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-mono text-sm z-10">
                        TCS-REF-
                      </span>
                      <Input
                        type="password"
                        placeholder="****"
                        value={referentData.code_secret}
                        onChange={(e) => setReferentData({ ...referentData, code_secret: e.target.value })}
                        required
                        maxLength={4}
                        className="bg-[#252b3d] border-gray-700 text-white pl-24"
                      />
                    </div>
                  </div>

                  <Button type="submit" className="w-full btn-secondary" disabled={isLoading}>
                    {isLoading ? 'CRÉATION...' : 'CRÉER COMPTE RÉFÉRENT'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AlertDialog open={showNonLicencieDialog} onOpenChange={setShowNonLicencieDialog}>
        <AlertDialogContent className="glass-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl text-[#FF6B35]">
              👥 Vous n'êtes pas encore licencié?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-300">
              Demandez une période d'essai pour vous entraîner!
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
        <AlertDialogContent className="glass-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-100">Mot de passe oublié</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <p className="text-gray-300">Entrez votre email</p>
                <Input
                  type="email"
                  placeholder="votre@email.com"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="bg-[#252b3d] border-gray-700 text-white"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowForgotPassword(false)} className="border-gray-700 text-gray-300">
              Annuler
            </Button>
            <Button className="btn-primary" onClick={handleForgotPassword}>
              Envoyer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReferentVerification} onOpenChange={setShowReferentVerification}>
        <AlertDialogContent className="glass-card border-0">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-gray-100">Vérification Référent</AlertDialogTitle>
            <AlertDialogDescription>
              <div className="space-y-4 mt-4">
                <p className="text-gray-300">Code de vérification (6 chiffres)</p>
                <Input
                  type="text"
                  placeholder="000000"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className="bg-[#252b3d] border-gray-700 text-white text-center text-2xl tracking-widest"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={() => setShowReferentVerification(false)} className="border-gray-700 text-gray-300">
              Annuler
            </Button>
            <Button className="btn-secondary" onClick={handleVerifyReferent}>
              Vérifier
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
