import { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { API } from '../App';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { toast } from 'sonner';
import VolleyballFloating from '../components/VolleyballFloating';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginMode, setIsLoginMode] = useState(true);
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
      toast.error('Erreur lors de l\\'envoi de l\\'email');
    }
  };

  return (
    <div className=\"min-h-screen flex items-center justify-center relative overflow-hidden\" 
         style={{ background: '#1a1f2e' }}>
      <VolleyballFloating />
      <div className=\"grain-texture absolute inset-0\"></div>
      
      <div className=\"relative z-10 w-full max-w-md mx-4\">
        <Card className=\"glass-card shadow-2xl border-0\" data-testid=\"login-card\">
          <CardContent className=\"pt-8 pb-8 px-8\">
            {/* Logo et titre */}
            <div className=\"text-center mb-8\">
              <img 
                src=\"https://customer-assets.emergentagent.com/job_tcsvolley/artifacts/h6inbvsa_WhatsApp%20Image%202025-12-19%20at%2003.44.40.jpeg\" 
                alt=\"TCS Suzini Logo\" 
                className=\"w-16 h-16 mx-auto mb-4 rounded-full\"
              />
              <h1 className=\"font-anton text-4xl text-[#FF6B35] mb-2\" style={{ letterSpacing: '0.05em' }}>
                TCS de Suzini
              </h1>
              <p className=\"text-sm text-gray-400\">Beach Volley • L'Arène du Sable</p>
            </div>

            {isLoginMode ? (
              <form onSubmit={handleLogin} className=\"space-y-4\" data-testid=\"login-form\">
                <div>
                  <Label htmlFor=\"email\" className=\"text-gray-300\">Email</Label>
                  <Input
                    id=\"email\"
                    type=\"email\"
                    placeholder=\"votre@email.com\"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                    required
                    className=\"bg-[#252b3d] border-gray-700 text-white placeholder:text-gray-500 mt-1\"
                  />
                </div>
                <div>
                  <Label htmlFor=\"password\" className=\"text-gray-300\">Mot de passe</Label>
                  <Input
                    id=\"password\"
                    type=\"password\"
                    placeholder=\"••••••••\"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                    required
                    className=\"bg-[#252b3d] border-gray-700 text-white placeholder:text-gray-500 mt-1\"
                  />
                </div>
                
                <div className=\"flex items-center space-x-2\">
                  <Checkbox 
                    id=\"remember\" 
                    checked={rememberMe}
                    onCheckedChange={setRememberMe}
                  />
                  <label htmlFor=\"remember\" className=\"text-sm text-gray-400 cursor-pointer\">
                    Se souvenir de moi
                  </label>
                </div>

                <Button type=\"submit\" className=\"w-full btn-primary\" disabled={isLoading}>
                  {isLoading ? 'CONNEXION...' : 'SE CONNECTER'}
                </Button>
                
                <Button 
                  type=\"button\" 
                  onClick={() => setIsLoginMode(false)}
                  className=\"w-full btn-secondary\" 
                >
                  SE CONNECTER EN TANT QU'INVITÉ
                </Button>

                <div className=\"flex justify-between text-sm mt-4\">
                  <button
                    type=\"button\"
                    onClick={() => setShowForgotPassword(true)}
                    className=\"text-gray-400 hover:text-[#FF6B35] transition-colors\"
                  >
                    Mot de passe oublié?
                  </button>
                  <button
                    type=\"button\"
                    onClick={() => setIsLoginMode(false)}
                    className=\"text-gray-400 hover:text-[#10B981] transition-colors\"
                  >
                    Créer un compte
                  </button>
                </div>
              </form>
            ) : (
              <div className=\"space-y-4\">
                <div className=\"flex gap-2 mb-4\">
                  <Button 
                    onClick={() => setIsLoginMode(true)} 
                    variant=\"outline\" 
                    className=\"flex-1 bg-transparent border-gray-700 text-gray-400 hover:text-white\"
                  >
                    Connexion
                  </Button>
                  <Button 
                    variant=\"outline\" 
                    className=\"flex-1 bg-[#252b3d] border-[#FF6B35] text-[#FF6B35]\"
                  >
                    Inscription
                  </Button>
                </div>

                <form onSubmit={handleRegister} className=\"space-y-4\">
                  <div className=\"grid grid-cols-2 gap-3\">
                    <div>
                      <Label className=\"text-gray-300 text-sm\">Prénom</Label>
                      <Input
                        value={registerData.prenom}
                        onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                        required
                        className=\"bg-[#252b3d] border-gray-700 text-white mt-1\"
                      />
                    </div>
                    <div>
                      <Label className=\"text-gray-300 text-sm\">Nom</Label>
                      <Input
                        value={registerData.nom}
                        onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                        required
                        className=\"bg-[#252b3d] border-gray-700 text-white mt-1\"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label className=\"text-gray-300 text-sm\">Email</Label>
                    <Input
                      type=\"email\"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      required
                      className=\"bg-[#252b3d] border-gray-700 text-white mt-1\"
                    />
                  </div>
                  
                  <div>
                    <Label className=\"text-gray-300 text-sm\">Mot de passe</Label>
                    <Input
                      type=\"password\"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      required
                      className=\"bg-[#252b3d] border-gray-700 text-white mt-1\"
                    />
                  </div>

                  <div>
                    <Label className=\"text-gray-300 text-sm mb-2 block\">Type de licence</Label>
                    <RadioGroup
                      value={registerData.type_licence}
                      onValueChange={(value) => setRegisterData({ ...registerData, type_licence: value })}
                    >
                      <div className=\"flex items-center space-x-2 mb-2\">
                        <RadioGroupItem value=\"competition\" id=\"comp\" />
                        <Label htmlFor=\"comp\" className=\"text-gray-300 text-sm cursor-pointer\">
                          Compétition (Entraînements + Jeu libre)
                        </Label>
                      </div>
                      <div className=\"flex items-center space-x-2\">
                        <RadioGroupItem value=\"jeu_libre\" id=\"libre\" />
                        <Label htmlFor=\"libre\" className=\"text-gray-300 text-sm cursor-pointer\">
                          Jeu Libre (Jeu libre uniquement)
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <div>
                    <Label className=\"text-gray-300 text-sm mb-2 block\">Statut</Label>
                    <RadioGroup
                      value={registerData.est_licencie ? \"licencie\" : \"non_licencie\"}
                      onValueChange={(value) => setRegisterData({ ...registerData, est_licencie: value === \"licencie\" })}
                    >
                      <div className=\"flex items-center space-x-2 mb-2\">
                        <RadioGroupItem value=\"licencie\" id=\"lic\" />
                        <Label htmlFor=\"lic\" className=\"text-gray-300 text-sm cursor-pointer\">
                          Je suis licencié(e)
                        </Label>
                      </div>
                      <div className=\"flex items-center space-x-2\">
                        <RadioGroupItem value=\"non_licencie\" id=\"nonlic\" />
                        <Label htmlFor=\"nonlic\" className=\"text-gray-300 text-sm cursor-pointer\">
                          Non licencié
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  <Button type=\"submit\" className=\"w-full btn-primary\" disabled={isLoading}>
                    {isLoading ? 'INSCRIPTION...' : \"S'INSCRIRE\"}
                  </Button>
                </form>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogs */}
      <AlertDialog open={showNonLicencieDialog} onOpenChange={setShowNonLicencieDialog}>
        <AlertDialogContent className=\"glass-card border-0\">
          <AlertDialogHeader>
            <AlertDialogTitle className=\"text-2xl text-[#FF6B35]\">
              👥 Vous n'êtes pas encore licencié?
            </AlertDialogTitle>
            <AlertDialogDescription className=\"text-gray-300\">
              Demandez une période d'essai pour vous entraîner!
              <br /><br />
              Contactez-nous pour plus d'informations.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction className=\"btn-primary\" onClick={() => setShowNonLicencieDialog(false)}>
              D'accord
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showForgotPassword} onOpenChange={setShowForgotPassword}>
        <AlertDialogContent className=\"glass-card border-0\">
          <AlertDialogHeader>
            <AlertDialogTitle className=\"text-xl text-gray-100\">Mot de passe oublié</AlertDialogTitle>
            <AlertDialogDescription>
              <div className=\"space-y-4 mt-4\">
                <p className=\"text-gray-300\">Entrez votre email</p>
                <Input
                  type=\"email\"
                  placeholder=\"votre@email.com\"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className=\"bg-[#252b3d] border-gray-700 text-white\"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant=\"outline\" onClick={() => setShowForgotPassword(false)} className=\"border-gray-700 text-gray-300\">
              Annuler
            </Button>
            <Button className=\"btn-primary\" onClick={handleForgotPassword}>
              Envoyer
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showReferentVerification} onOpenChange={setShowReferentVerification}>
        <AlertDialogContent className=\"glass-card border-0\">
          <AlertDialogHeader>
            <AlertDialogTitle className=\"text-xl text-gray-100\">Vérification Référent</AlertDialogTitle>
            <AlertDialogDescription>
              <div className=\"space-y-4 mt-4\">
                <p className=\"text-gray-300\">Code de vérification (6 chiffres)</p>
                <Input
                  type=\"text\"
                  placeholder=\"000000\"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  maxLength={6}
                  className=\"bg-[#252b3d] border-gray-700 text-white text-center text-2xl tracking-widest\"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant=\"outline\" onClick={() => setShowReferentVerification(false)} className=\"border-gray-700 text-gray-300\">
              Annuler
            </Button>
            <Button className=\"btn-primary\" onClick={handleVerifyReferent}>
              Vérifier
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
