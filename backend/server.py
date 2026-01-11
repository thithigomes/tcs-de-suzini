from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import jwt
import asyncio
import resend

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']

# Try to connect to MongoDB with timeout
try:
    client = AsyncIOMotorClient(mongo_url, serverSelectionTimeoutMS=3000)
    db = client[os.environ['DB_NAME']]
    # Test connection immediately
    logger_test = logging.getLogger(__name__)
    logger_test.info("Attempting MongoDB connection...")
except Exception as e:
    print(f"Warning: MongoDB connection failed ({str(e)[:50]}...). Using fallback data store.")
    client = None
    db = None

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'votre-cle-secrete-super-securisee-changez-moi')
FRONTEND_URL = os.environ.get('FRONTEND_URL', 'http://192.168.1.27:3000')  # URL pour accès réseau
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 43200

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_NOTIFICATION_EMAIL', 'thiago.gomes97300@gmail.com')
REFERENT_SECRET_CODE = f"TCS-REF-{datetime.now(timezone.utc).year}"

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

logger = logging.getLogger(__name__)

# Fallback in-memory data store when MongoDB is unavailable
FALLBACK_DATA = {
    "training_schedule": [],
    "users": [],
    "tournaments": [],
    "matches": [],
    "news": [],
    "achievements": []
}

# Initialize training schedules in fallback
FALLBACK_DATA["training_schedule"] = [
    {
        "id": "lundi_entrainement",
        "jour": "Lundi",
        "heure_debut": "18:00",
        "heure_fin": "20:00",
        "type": "Entraînement",
        "licence_requise": "competition",
        "description": "Entraînement dirigé pour les licenciés Compétition"
    },
    {
        "id": "lundi_jeu_livre",
        "jour": "Lundi",
        "heure_debut": "20:00",
        "heure_fin": "22:00",
        "type": "Jeu Libre",
        "licence_requise": "tous",
        "description": "Jeu libre ouvert à tous les licenciés"
    },
    {
        "id": "mercredi_entrainement",
        "jour": "Mercredi",
        "heure_debut": "18:00",
        "heure_fin": "20:00",
        "type": "Entraînement",
        "licence_requise": "competition",
        "description": "Entraînement dirigé pour les licenciés Compétition"
    },
    {
        "id": "mercredi_jeu_livre",
        "jour": "Mercredi",
        "heure_debut": "20:00",
        "heure_fin": "22:00",
        "type": "Jeu Livre",
        "licence_requise": "tous",
        "description": "Jeu libre ouvert à tous les licenciés"
    },
    {
        "id": "vendredi_jeu_livre",
        "jour": "Vendredi",
        "heure_debut": "18:00",
        "heure_fin": "22:00",
        "type": "Jeu Livre",
        "licence_requise": "tous",
        "description": "Jeu libre ouvert à todos os licenciés"
    }
]

def generate_verification_code():
    import random
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nom: str
    prenom: str
    type_licence: str
    est_licencie: bool

class ReferentRegister(BaseModel):
    email: EmailStr
    password: str
    nom: str
    prenom: str
    code_secret: str

class ReferentVerify(BaseModel):
    email: EmailStr
    code_verification: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    nom: str
    prenom: str
    type_licence: str
    est_licencie: bool
    role: str = "user"
    points: int = 0
    participations: int = 0
    date_creation: str

class UserProfile(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    email: str
    nom: str
    prenom: str
    type_licence: str
    est_licencie: bool
    role: str
    points: int
    participations: int
    date_creation: str
    achievements: List[dict] = []

class Achievement(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    nom: str
    description: str
    icone: str
    points: int

class Tournament(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    nom: str
    description: str
    date_debut: str
    date_fin: str
    statut: str
    participants: List[str] = []
    max_participants: int = 16
    est_payant: bool = False
    prix: float = 0.0

class TournamentCreate(BaseModel):
    nom: str
    description: str
    date_debut: str
    date_fin: str
    max_participants: int = 16
    est_payant: bool = False
    prix: float = 0.0

class Match(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    tournament_id: Optional[str] = None
    equipe_a: str
    equipe_b: str
    date: str
    heure: str
    lieu: str
    score_a: Optional[int] = None
    score_b: Optional[int] = None

class MatchCreate(BaseModel):
    tournament_id: Optional[str] = None
    equipe_a: str
    equipe_b: str
    date: str
    heure: str
    lieu: str

class News(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    titre: str
    contenu: str
    auteur_id: str
    auteur_nom: str
    date_publication: str
    image_url: Optional[str] = None

class NewsCreate(BaseModel):
    titre: str
    contenu: str
    image_url: Optional[str] = None

class TrainingSchedule(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    jour: str
    heure_debut: str
    heure_fin: str
    type: str
    licence_requise: str
    description: str

class TrainingScheduleCreate(BaseModel):
    jour: str
    heure_debut: str
    heure_fin: str
    type: str
    licence_requise: str
    description: str

class TrainingScheduleUpdate(BaseModel):
    jour: Optional[str] = None
    heure_debut: Optional[str] = None
    heure_fin: Optional[str] = None
    type: Optional[str] = None
    licence_requise: Optional[str] = None
    description: Optional[str] = None

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

async def send_email_async(to_email: str, subject: str, html_content: str):
    """Enviar email usando Resend API ou SMTP ou salvar em arquivo de teste"""
    import smtplib
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    
    SMTP_SERVER = os.environ.get('SMTP_SERVER', 'smtp.gmail.com')
    SMTP_PORT = int(os.environ.get('SMTP_PORT', '587'))
    SMTP_EMAIL = os.environ.get('SMTP_EMAIL', '')
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD', '')
    
    # Se usar Resend API
    if RESEND_API_KEY and RESEND_API_KEY not in ['your_resend_api_key_here', '']:
        try:
            params = {
                "from": SENDER_EMAIL,
                "to": [to_email],
                "subject": subject,
                "html": html_content
            }
            await asyncio.to_thread(resend.Emails.send, params)
            logger.info(f"✅ Email sent via Resend: {subject} to {to_email}")
            return
        except Exception as e:
            logger.warning(f"⚠️ Resend failed: {str(e)}")
    
    # Tentar SMTP se credenciais estão completas
    if SMTP_EMAIL and SMTP_PASSWORD and SMTP_PASSWORD not in ['sua_app_password_aqui', '']:
        try:
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = SMTP_EMAIL
            msg['To'] = to_email
            
            html_part = MIMEText(html_content, 'html')
            msg.attach(html_part)
            
            def send_smtp():
                with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
                    server.starttls()
                    server.login(SMTP_EMAIL, SMTP_PASSWORD)
                    server.send_message(msg)
            
            await asyncio.to_thread(send_smtp)
            logger.info(f"✅ Email sent via SMTP: {subject} to {to_email}")
            return
        except Exception as e:
            logger.error(f"⚠️ SMTP error: {str(e)}")
    
    # Fallback: Salvar em arquivo (para teste/desenvolvimento)
    try:
        import hashlib
        email_hash = hashlib.md5(to_email.encode()).hexdigest()[:8]
        email_file = f"/tmp/email_{email_hash}_{int(datetime.now(timezone.utc).timestamp())}.html"
        
        # Extrair código se existir
        code_match = __import__('re').search(r'>(\d{6})<', html_content)
        code = code_match.group(1) if code_match else "N/A"
        
        with open(email_file, 'w', encoding='utf-8') as f:
            f.write(f"""
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Email</title></head>
<body>
<div style="background: #f0f0f0; padding: 20px; border-radius: 10px;">
    <h2>📧 Email para: {to_email}</h2>
    <p><strong>Assunto:</strong> {subject}</p>
    <p><strong>Código:</strong> <span style="font-size: 24px; font-weight: bold; color: #FF6B35;">{code}</span></p>
    <hr>
    {html_content}
    <hr>
    <p style="font-size: 12px; color: #999;">Arquivo de teste salvo em: {email_file}</p>
</div>
</body>
</html>
            """)
        
        logger.info(f"✅ Email saved to file: {email_file}")
        print(f"\n{'='*70}")
        print(f"📧 EMAIL ENVIADO PARA: {to_email}")
        print(f"Assunto: {subject}")
        print(f"Código: {code}")
        print(f"Arquivo: {email_file}")
        print(f"{'='*70}\n")
        
    except Exception as e:
        logger.error(f"❌ Failed to save email: {str(e)}")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise HTTPException(status_code=401, detail="Token invalide")
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        if user is None:
            raise HTTPException(status_code=401, detail="Utilisateur non trouvé")
        return user
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expiré")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Token invalide")

async def get_current_admin(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") not in ["admin", "referent"]:
        raise HTTPException(status_code=403, detail="Accès non autorisé")
    return current_user

async def get_current_referent(current_user: dict = Depends(get_current_user)):
    if current_user.get("role") != "referent":
        raise HTTPException(status_code=403, detail="Accès réservé aux référents")
    return current_user

@api_router.post("/auth/register")
async def register(user_data: UserRegister):
    existing = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    import uuid
    user_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash(user_data.password)
    
    user_doc = {
        "id": user_id,
        "email": user_data.email,
        "password_hash": hashed_password,
        "nom": user_data.nom,
        "prenom": user_data.prenom,
        "type_licence": user_data.type_licence,
        "est_licencie": user_data.est_licencie,
        "role": "user",
        "points": 0,
        "participations": 0,
        "date_creation": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    asyncio.create_task(send_email_async(
        ADMIN_EMAIL,
        f"Nouveau membre: {user_data.prenom} {user_data.nom}",
        f"""
        <h2>Nouvelle inscription au club TCS de Suzini</h2>
        <p><strong>Nom:</strong> {user_data.prenom} {user_data.nom}</p>
        <p><strong>Email:</strong> {user_data.email}</p>
        <p><strong>Type de licence:</strong> {user_data.type_licence}</p>
        <p><strong>Licencié:</strong> {'Oui' if user_data.est_licencie else 'Non'}</p>
        <p><strong>Date d'inscription:</strong> {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}</p>
        """
    ))
    
    token = create_access_token({"sub": user_id})
    return {"token": token, "user": User(**{k: v for k, v in user_doc.items() if k != "password_hash"})}

@api_router.post("/auth/register-referent")
async def register_referent(referent_data: ReferentRegister):
    if referent_data.code_secret != REFERENT_SECRET_CODE:
        raise HTTPException(status_code=403, detail="Code secret invalide")
    
    existing = await db.users.find_one({"email": referent_data.email}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Email déjà utilisé")
    
    verification_code = generate_verification_code()
    
    await db.pending_referents.delete_many({"email": referent_data.email})
    
    import uuid
    pending_id = str(uuid.uuid4())
    hashed_password = pwd_context.hash(referent_data.password)
    
    pending_doc = {
        "id": pending_id,
        "email": referent_data.email,
        "password_hash": hashed_password,
        "nom": referent_data.nom,
        "prenom": referent_data.prenom,
        "verification_code": verification_code,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "expires_at": (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    }
    
    await db.pending_referents.insert_one(pending_doc)
    
    await send_email_async(
        referent_data.email,
        "Code de vérification - Référent TCS Suzini",
        f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #064E3B 0%, #FF6B35 100%);">
            <div style="background: white; padding: 30px; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
                <h1 style="color: #FF6B35; text-align: center; font-size: 32px; margin-bottom: 20px;">🏐 TCS de Suzini</h1>
                <h2 style="color: #064E3B; text-align: center;">Vérification Référent</h2>
                <p style="font-size: 16px; color: #333;">Bonjour {referent_data.prenom},</p>
                <p style="font-size: 16px; color: #333;">Votre code de vérification pour créer un compte référent:</p>
                <div style="background: linear-gradient(90deg, #FF6B35, #84CC16); padding: 20px; border-radius: 10px; text-align: center; margin: 30px 0;">
                    <p style="font-size: 48px; font-weight: bold; color: white; letter-spacing: 10px; margin: 0;">{verification_code}</p>
                </div>
                <p style="font-size: 14px; color: #666; text-align: center;">Ce code expire dans 1 heure</p>
                <p style="font-size: 14px; color: #999; text-align: center; margin-top: 30px;">Si vous n'avez pas demandé ce code, ignorez cet email.</p>
            </div>
        </div>
        """
    )
    
    return {"message": "Code de vérification envoyé à votre email"}

@api_router.post("/auth/verify-referent")
async def verify_referent(verify_data: ReferentVerify):
    pending = await db.pending_referents.find_one({"email": verify_data.email}, {"_id": 0})
    if not pending:
        raise HTTPException(status_code=404, detail="Demande de vérification non trouvée")
    
    if pending["verification_code"] != verify_data.code_verification:
        raise HTTPException(status_code=400, detail="Code de vérification invalide")
    
    expires_at = datetime.fromisoformat(pending["expires_at"])
    if datetime.now(timezone.utc) > expires_at:
        await db.pending_referents.delete_one({"email": verify_data.email})
        raise HTTPException(status_code=400, detail="Code de vérification expiré")
    
    import uuid
    user_id = str(uuid.uuid4())
    
    user_doc = {
        "id": user_id,
        "email": pending["email"],
        "password_hash": pending["password_hash"],
        "nom": pending["nom"],
        "prenom": pending["prenom"],
        "type_licence": "competition",
        "est_licencie": True,
        "role": "referent",
        "points": 0,
        "participations": 0,
        "date_creation": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    await db.pending_referents.delete_one({"email": verify_data.email})
    
    token = create_access_token({"sub": user_id})
    return {"token": token, "user": User(**{k: v for k, v in user_doc.items() if k != "password_hash"})}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not pwd_context.verify(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_access_token({"sub": user["id"]})
    return {"token": token, "user": User(**{k: v for k, v in user.items() if k != "password_hash"})}

@api_router.post("/auth/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    user = await db.users.find_one({"email": request.email}, {"_id": 0})
    if not user:
        return {"message": "Si l'email existe, un lien de réinitialisation a été envoyé"}
    
    reset_token = create_access_token({"sub": user["id"], "type": "reset"})
    
    reset_link = f"{FRONTEND_URL}/reset-password?token={reset_token}"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="fr">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Réinitialisation de mot de passe - TCS de Suzini</title>
        <style>
            body {{
                font-family: 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', sans-serif;
                background: linear-gradient(135deg, #1a1f2e 0%, #252b3d 100%);
                margin: 0;
                padding: 20px;
            }}
            .email-container {{
                max-width: 600px;
                margin: 0 auto;
                background: white;
                border-radius: 12px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
                overflow: hidden;
            }}
            .header {{
                background: linear-gradient(135deg, #FF6B35 0%, #064E3B 100%);
                padding: 40px 20px;
                text-align: center;
                color: white;
            }}
            .header h1 {{
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 0.5px;
            }}
            .content {{
                padding: 40px 30px;
                color: #1a1f2e;
                line-height: 1.8;
            }}
            .greeting {{
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 20px;
                color: #064E3B;
            }}
            .message {{
                font-size: 16px;
                color: #333;
                margin-bottom: 30px;
            }}
            .message p {{
                margin: 12px 0;
            }}
            .button-container {{
                text-align: center;
                margin: 40px 0;
            }}
            .reset-button {{
                display: inline-block;
                background: linear-gradient(135deg, #FF6B35 0%, #FF8A5B 100%);
                color: white !important;
                padding: 16px 40px;
                text-decoration: none;
                border-radius: 8px;
                font-weight: 600;
                font-size: 16px;
                box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
                transition: all 0.3s ease;
            }}
            .reset-button:hover {{
                background: linear-gradient(135deg, #E85A25 0%, #FF7A4B 100%);
                box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
                transform: translateY(-2px);
            }}
            .link-section {{
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                margin: 30px 0;
                text-align: center;
            }}
            .link-section p {{
                margin: 0;
                font-size: 14px;
                color: #666;
            }}
            .link-section a {{
                color: #FF6B35;
                word-break: break-all;
                text-decoration: none;
                font-weight: 500;
            }}
            .footer {{
                padding: 30px;
                background: #f5f5f5;
                text-align: center;
                font-size: 12px;
                color: #999;
                border-top: 1px solid #e0e0e0;
            }}
            .footer p {{
                margin: 8px 0;
            }}
            .warning {{
                background: #fff3cd;
                padding: 15px;
                border-left: 4px solid #FF6B35;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
                color: #666;
            }}
            .logo-text {{
                font-weight: 700;
                color: #FF6B35;
                font-size: 14px;
                margin-bottom: 10px;
            }}
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <div class="logo-text">🏐 TCS DE SUZINI</div>
                <h1>Réinitialisation de Mot de Passe</h1>
            </div>
            
            <div class="content">
                <p class="greeting">Bonjour {user['prenom']},</p>
                
                <div class="message">
                    <p>Vous avez demandé une réinitialisation de votre mot de passe pour accéder à votre compte <strong>TCS de Suzini</strong>.</p>
                    
                    <p>Veuillez cliquer sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé:</p>
                </div>
                
                <div class="button-container">
                    <a href="{reset_link}" class="reset-button">Réinitialiser mon mot de passe</a>
                </div>
                
                <div class="link-section">
                    <p>Ou copiez ce lien dans votre navigateur:</p>
                    <p><a href="{reset_link}">{reset_link}</a></p>
                </div>
                
                <div class="warning">
                    <strong>⏱️ Important:</strong> Ce lien de réinitialisation expirera dans <strong>30 jours</strong> pour des raisons de sécurité.
                </div>
                
                <p style="margin-top: 30px; font-size: 14px; color: #666;">
                    Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email. Votre compte reste en sécurité.
                </p>
            </div>
            
            <div class="footer">
                <p><strong>TCS de Suzini - Beach Volleyball Club</strong></p>
                <p>Gestion des Membres | Tournois | Entraînements</p>
                <p style="margin-top: 15px; color: #bbb;">© 2026 TCS de Suzini. Tous droits réservés.</p>
            </div>
        </div>
    </body>
    </html>
    """
    
    await send_email_async(
        request.email,
        "Réinitialisation de votre mot de passe - TCS de Suzini",
        html_content
    )
    
    return {"message": "Si l'email existe, un lien de réinitialisation a été envoyé"}

@api_router.post("/auth/reset-password")
async def reset_password(request: ResetPasswordRequest):
    try:
        payload = jwt.decode(request.token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("type") != "reset":
            raise HTTPException(status_code=400, detail="Token invalide")
        user_id = payload.get("sub")
    except jwt.JWTError:
        raise HTTPException(status_code=400, detail="Token invalide ou expiré")
    
    hashed_password = pwd_context.hash(request.new_password)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"password_hash": hashed_password}}
    )
    
    return {"message": "Mot de passe réinitialisé avec succès"}

@api_router.get("/users/me", response_model=UserProfile)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    achievements = await db.user_achievements.find({"user_id": current_user["id"]}, {"_id": 0}).to_list(100)
    
    achievement_details = []
    for ua in achievements:
        achievement = await db.achievements.find_one({"id": ua["achievement_id"]}, {"_id": 0})
        if achievement:
            achievement_details.append({
                "id": achievement["id"],
                "nom": achievement["nom"],
                "description": achievement["description"],
                "icone": achievement["icone"],
                "date_obtenu": ua["date_obtenu"]
            })
    
    profile = UserProfile(**current_user, achievements=achievement_details)
    return profile

@api_router.patch("/users/me")
async def update_my_profile(update_data: dict, current_user: dict = Depends(get_current_user)):
    allowed_fields = ["nom", "prenom", "type_licence", "est_licencie"]
    update_fields = {k: v for k, v in update_data.items() if k in allowed_fields}
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="Aucun champ valide à mettre à jour")
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$set": update_fields}
    )
    
    user = await db.users.find_one({"id": current_user["id"]}, {"_id": 0, "password_hash": 0})
    return User(**user)

@api_router.delete("/users/me")
async def delete_my_account(current_user: dict = Depends(get_current_user)):
    await db.users.delete_one({"id": current_user["id"]})
    await db.user_achievements.delete_many({"user_id": current_user["id"]})
    return {"message": "Compte supprimé avec succès"}

@api_router.get("/referent/users", response_model=List[User])
async def get_all_users(current_user: dict = Depends(get_current_referent)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [User(**user) for user in users]

@api_router.patch("/referent/users/{user_id}")
async def update_user(user_id: str, user_data: dict, current_user: dict = Depends(get_current_referent)):
    if not user_data:
        raise HTTPException(status_code=400, detail="Aucune donnée à mettre à jour")
    
    allowed_fields = ["nom", "prenom", "email", "type_licence", "est_licencie", "points", "participations"]
    update_data = {k: v for k, v in user_data.items() if k in allowed_fields}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="Aucun champ valide à mettre à jour")
    
    result = await db.users.update_one(
        {"id": user_id},
        {"$set": update_data}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    user = await db.users.find_one({"id": user_id}, {"_id": 0, "password_hash": 0})
    return User(**user)

@api_router.delete("/referent/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_referent)):
    if current_user["id"] == user_id:
        raise HTTPException(status_code=400, detail="Vous ne pouvez pas supprimer votre propre compte")
    
    result = await db.users.delete_one({"id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return {"message": "Utilisateur supprimé"}

@api_router.patch("/referent/users/{user_id}/toggle-license")
async def toggle_user_license(user_id: str, current_user: dict = Depends(get_current_referent)):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    
    new_status = not user.get("est_licencie", False)
    await db.users.update_one(
        {"id": user_id},
        {"$set": {"est_licencie": new_status}}
    )
    
    return {"message": f"Statut de licence modifié", "est_licencie": new_status}

@api_router.get("/achievements", response_model=List[Achievement])
async def get_achievements():
    achievements = await db.achievements.find({}, {"_id": 0}).to_list(100)
    return achievements

@api_router.get("/tournaments", response_model=List[Tournament])
async def get_tournaments():
    tournaments = await db.tournaments.find({}, {"_id": 0}).sort("date_debut", -1).to_list(100)
    return tournaments

@api_router.post("/tournaments", response_model=Tournament)
async def create_tournament(tournament_data: TournamentCreate, current_user: dict = Depends(get_current_referent)):
    import uuid
    tournament_id = str(uuid.uuid4())
    
    tournament_doc = {
        "id": tournament_id,
        "nom": tournament_data.nom,
        "description": tournament_data.description,
        "date_debut": tournament_data.date_debut,
        "date_fin": tournament_data.date_fin,
        "statut": "à_venir",
        "participants": [],
        "max_participants": tournament_data.max_participants,
        "est_payant": tournament_data.est_payant,
        "prix": tournament_data.prix if tournament_data.est_payant else 0.0
    }
    
    await db.tournaments.insert_one(tournament_doc)
    return Tournament(**tournament_doc)

@api_router.patch("/tournaments/{tournament_id}")
async def update_tournament(tournament_id: str, tournament_data: TournamentCreate, current_user: dict = Depends(get_current_referent)):
    result = await db.tournaments.update_one(
        {"id": tournament_id},
        {"$set": {
            "nom": tournament_data.nom,
            "description": tournament_data.description,
            "date_debut": tournament_data.date_debut,
            "date_fin": tournament_data.date_fin,
            "max_participants": tournament_data.max_participants,
            "est_payant": tournament_data.est_payant,
            "prix": tournament_data.prix if tournament_data.est_payant else 0.0
        }}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Tournoi non trouvé")
    
    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    return Tournament(**tournament)

@api_router.post("/tournaments/{tournament_id}/register")
async def register_tournament(tournament_id: str, current_user: dict = Depends(get_current_user)):
    if not current_user.get("est_licencie"):
        raise HTTPException(status_code=403, detail="Vous devez être licencié pour vous inscrire")
    
    tournament = await db.tournaments.find_one({"id": tournament_id}, {"_id": 0})
    if not tournament:
        raise HTTPException(status_code=404, detail="Tournoi non trouvé")
    
    if current_user["id"] in tournament["participants"]:
        raise HTTPException(status_code=400, detail="Vous êtes déjà inscrit à ce tournoi")
    
    if len(tournament["participants"]) >= tournament["max_participants"]:
        raise HTTPException(status_code=400, detail="Le tournoi est complet")
    
    await db.tournaments.update_one(
        {"id": tournament_id},
        {"$push": {"participants": current_user["id"]}}
    )
    
    await db.users.update_one(
        {"id": current_user["id"]},
        {"$inc": {"participations": 1}}
    )
    
    await check_and_award_achievements(current_user["id"])
    
    asyncio.create_task(send_email_async(
        ADMIN_EMAIL,
        f"Inscription tournoi: {current_user['prenom']} {current_user['nom']}",
        f"""
        <h2>Nouvelle inscription à un tournoi</h2>
        <p><strong>Joueur:</strong> {current_user['prenom']} {current_user['nom']}</p>
        <p><strong>Email:</strong> {current_user['email']}</p>
        <p><strong>Tournoi:</strong> {tournament['nom']}</p>
        <p><strong>Date:</strong> {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M')}</p>
        """
    ))
    
    return {"message": "Inscription réussie"}

@api_router.get("/matches", response_model=List[Match])
async def get_matches():
    matches = await db.matches.find({}, {"_id": 0}).sort("date", 1).to_list(100)
    return matches

@api_router.post("/matches", response_model=Match)
async def create_match(match_data: MatchCreate, current_user: dict = Depends(get_current_referent)):
    import uuid
    match_id = str(uuid.uuid4())
    
    match_doc = {
        "id": match_id,
        "tournament_id": match_data.tournament_id,
        "equipe_a": match_data.equipe_a,
        "equipe_b": match_data.equipe_b,
        "date": match_data.date,
        "heure": match_data.heure,
        "lieu": match_data.lieu,
        "score_a": None,
        "score_b": None
    }
    
    await db.matches.insert_one(match_doc)
    return Match(**match_doc)

@api_router.get("/news", response_model=List[News])
async def get_news():
    news_list = await db.news.find({}, {"_id": 0}).sort("date_publication", -1).to_list(100)
    return news_list

@api_router.post("/news", response_model=News)
async def create_news(news_data: NewsCreate, current_user: dict = Depends(get_current_referent)):
    import uuid
    news_id = str(uuid.uuid4())
    
    news_doc = {
        "id": news_id,
        "titre": news_data.titre,
        "contenu": news_data.contenu,
        "auteur_id": current_user["id"],
        "auteur_nom": f"{current_user['prenom']} {current_user['nom']}",
        "date_publication": datetime.now(timezone.utc).isoformat(),
        "image_url": news_data.image_url
    }
    
    await db.news.insert_one(news_doc)
    return News(**news_doc)

@api_router.get("/training-schedule", response_model=List[TrainingSchedule])
async def get_training_schedule():
    try:
        if db is None:
            return FALLBACK_DATA["training_schedule"]
        schedules = await db.training_schedule.find({}, {"_id": 0}).to_list(100)
        return schedules
    except Exception as e:
        logger.warning(f"Error fetching from MongoDB: {e}. Using fallback data.")
        return FALLBACK_DATA["training_schedule"]

@api_router.post("/training-schedule", response_model=TrainingSchedule)
async def create_training_schedule(training_data: TrainingScheduleCreate, current_user: dict = Depends(get_current_referent)):
    import uuid
    training_id = str(uuid.uuid4())
    
    training_doc = {
        "id": training_id,
        "jour": training_data.jour,
        "heure_debut": training_data.heure_debut,
        "heure_fin": training_data.heure_fin,
        "type": training_data.type,
        "licence_requise": training_data.licence_requise,
        "description": training_data.description
    }
    
    try:
        if db is None:
            FALLBACK_DATA["training_schedule"].append(training_doc)
        else:
            await db.training_schedule.insert_one(training_doc)
    except Exception as e:
        logger.warning(f"Error inserting to MongoDB: {e}. Using fallback.")
        FALLBACK_DATA["training_schedule"].append(training_doc)
    
    return TrainingSchedule(**training_doc)

@api_router.put("/training-schedule/{training_id}", response_model=TrainingSchedule)
async def update_training_schedule(training_id: str, training_data: TrainingScheduleUpdate, current_user: dict = Depends(get_current_referent)):
    update_fields = {}
    
    if training_data.jour is not None:
        update_fields["jour"] = training_data.jour
    if training_data.heure_debut is not None:
        update_fields["heure_debut"] = training_data.heure_debut
    if training_data.heure_fin is not None:
        update_fields["heure_fin"] = training_data.heure_fin
    if training_data.type is not None:
        update_fields["type"] = training_data.type
    if training_data.licence_requise is not None:
        update_fields["licence_requise"] = training_data.licence_requise
    if training_data.description is not None:
        update_fields["description"] = training_data.description
    
    if not update_fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    try:
        if db is None:
            # Update in fallback
            for training in FALLBACK_DATA["training_schedule"]:
                if training["id"] == training_id:
                    training.update(update_fields)
                    return TrainingSchedule(**training)
            raise HTTPException(status_code=404, detail="Training schedule not found")
        else:
            result = await db.training_schedule.update_one(
                {"id": training_id},
                {"$set": update_fields}
            )
            
            if result.matched_count == 0:
                raise HTTPException(status_code=404, detail="Training schedule not found")
            
            updated_training = await db.training_schedule.find_one({"id": training_id}, {"_id": 0})
            return TrainingSchedule(**updated_training)
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Error updating in MongoDB: {e}. Using fallback.")
        for training in FALLBACK_DATA["training_schedule"]:
            if training["id"] == training_id:
                training.update(update_fields)
                return TrainingSchedule(**training)
        raise HTTPException(status_code=404, detail="Training schedule not found")

@api_router.delete("/training-schedule/{training_id}")
async def delete_training_schedule(training_id: str, current_user: dict = Depends(get_current_referent)):
    try:
        if db is None:
            # Delete from fallback
            original_len = len(FALLBACK_DATA["training_schedule"])
            FALLBACK_DATA["training_schedule"] = [t for t in FALLBACK_DATA["training_schedule"] if t["id"] != training_id]
            if len(FALLBACK_DATA["training_schedule"]) < original_len:
                return {"message": "Training schedule deleted successfully"}
            raise HTTPException(status_code=404, detail="Training schedule not found")
        else:
            result = await db.training_schedule.delete_one({"id": training_id})
            
            if result.deleted_count == 0:
                raise HTTPException(status_code=404, detail="Training schedule not found")
            
            return {"message": "Training schedule deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.warning(f"Error deleting from MongoDB: {e}. Using fallback.")
        original_len = len(FALLBACK_DATA["training_schedule"])
        FALLBACK_DATA["training_schedule"] = [t for t in FALLBACK_DATA["training_schedule"] if t["id"] != training_id]
        if len(FALLBACK_DATA["training_schedule"]) < original_len:
            return {"message": "Training schedule deleted successfully"}
        raise HTTPException(status_code=404, detail="Training schedule not found")

@api_router.get("/rankings", response_model=List[User])
async def get_rankings():
    users = await db.users.find({"est_licencie": True}, {"_id": 0, "password_hash": 0}).sort("points", -1).limit(50).to_list(50)
    return [User(**user) for user in users]

async def check_and_award_achievements(user_id: str):
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        return
    
    participations = user.get("participations", 0)
    
    achievements_to_check = [
        {"id": "membre_fidele", "required": 10},
        {"id": "toujours_present", "required": 20},
        {"id": "veteran", "required": 50}
    ]
    
    for ach in achievements_to_check:
        if participations >= ach["required"]:
            existing = await db.user_achievements.find_one({
                "user_id": user_id,
                "achievement_id": ach["id"]
            })
            
            if not existing:
                achievement = await db.achievements.find_one({"id": ach["id"]}, {"_id": 0})
                if achievement:
                    await db.user_achievements.insert_one({
                        "user_id": user_id,
                        "achievement_id": ach["id"],
                        "date_obtenu": datetime.now(timezone.utc).isoformat()
                    })
                    
                    await db.users.update_one(
                        {"id": user_id},
                        {"$inc": {"points": achievement["points"]}}
                    )

@api_router.post("/test-email")
async def test_email(email: str):
    """Endpoint de teste para enviar email"""
    await send_email_async(
        email,
        "🧪 Teste de Email - TCS de Suzini",
        f"""
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #FF6B35; text-align: center;">✅ Email de Teste</h1>
            <p>Este é um email de teste do sistema TCS de Suzini.</p>
            <p>Se você recebeu este email, o sistema de email está funcionando corretamente!</p>
            <p style="color: #999; margin-top: 30px; font-size: 12px;">Enviado em: {datetime.now(timezone.utc).strftime('%d/%m/%Y %H:%M:%S')}</p>
        </div>
        """
    )
    return {"message": f"Email de teste enviado para {email}"}

@api_router.post("/seed-data")
async def seed_data():
    achievements_count = await db.achievements.count_documents({})
    if achievements_count == 0:
        achievements = [
            {
                "id": "membre_fidele",
                "nom": "Membre Fidèle",
                "description": "Participer à 10 événements du club",
                "icone": "🏐",
                "points": 100
            },
            {
                "id": "toujours_present",
                "nom": "Toujours Présent",
                "description": "Participer à 20 événements du club",
                "icone": "⭐",
                "points": 250
            },
            {
                "id": "veteran",
                "nom": "Vétéran",
                "description": "Participer à 50 événements du club",
                "icone": "👑",
                "points": 500
            },
            {
                "id": "premier_tournoi",
                "nom": "Premier Tournoi",
                "description": "S'inscrire à son premier tournoi",
                "icone": "🎯",
                "points": 50
            },
            {
                "id": "champion",
                "nom": "Champion du Club",
                "description": "Gagner 3 tournois",
                "icone": "🏆",
                "points": 1000
            }
        ]
        await db.achievements.insert_many(achievements)
    
    training_count = await db.training_schedule.count_documents({})
    if training_count == 0:
        schedules = [
            {
                "id": "lundi_entrainement",
                "jour": "Lundi",
                "heure_debut": "18:00",
                "heure_fin": "20:00",
                "type": "Entraînement",
                "licence_requise": "competition",
                "description": "Entraînement dirigé pour les licenciés Compétition"
            },
            {
                "id": "lundi_jeu_libre",
                "jour": "Lundi",
                "heure_debut": "20:00",
                "heure_fin": "22:00",
                "type": "Jeu Libre",
                "licence_requise": "tous",
                "description": "Jeu libre ouvert à tous les licenciés"
            },
            {
                "id": "mercredi_entrainement",
                "jour": "Mercredi",
                "heure_debut": "18:00",
                "heure_fin": "20:00",
                "type": "Entraînement",
                "licence_requise": "competition",
                "description": "Entraînement dirigé pour les licenciés Compétition"
            },
            {
                "id": "mercredi_jeu_libre",
                "jour": "Mercredi",
                "heure_debut": "20:00",
                "heure_fin": "22:00",
                "type": "Jeu Libre",
                "licence_requise": "tous",
                "description": "Jeu libre ouvert à tous les licenciés"
            },
            {
                "id": "vendredi_jeu_libre",
                "jour": "Vendredi",
                "heure_debut": "18:00",
                "heure_fin": "22:00",
                "type": "Jeu Libre",
                "licence_requise": "tous",
                "description": "Jeu libre ouvert à tous les licenciés"
            }
        ]
        await db.training_schedule.insert_many(schedules)
    
    referent_exists = await db.users.find_one({"role": "referent"})
    if not referent_exists:
        import uuid
        referent_id = str(uuid.uuid4())
        referent_doc = {
            "id": referent_id,
            "email": "referent@tcssuzini.fr",
            "password_hash": pwd_context.hash("referent123"),
            "nom": "Référent",
            "prenom": "Directeur",
            "type_licence": "competition",
            "est_licencie": True,
            "role": "referent",
            "points": 0,
            "participations": 0,
            "date_creation": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(referent_doc)
    
    admin_exists = await db.users.find_one({"role": "admin"})
    if not admin_exists:
        import uuid
        admin_id = str(uuid.uuid4())
        admin_doc = {
            "id": admin_id,
            "email": "admin@tcssuzini.fr",
            "password_hash": pwd_context.hash("admin123"),
            "nom": "Admin",
            "prenom": "TCS",
            "type_licence": "competition",
            "est_licencie": True,
            "role": "admin",
            "points": 0,
            "participations": 0,
            "date_creation": datetime.now(timezone.utc).isoformat()
        }
        await db.users.insert_one(admin_doc)
    
    return {"message": "Données initiales créées avec succès"}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:8000",
        "https://tcs-de-suzini.vercel.app",
        "https://tcs-de-suzini-*.vercel.app",
        "http://192.168.1.27:3000",
    ] if os.environ.get('CORS_ORIGINS') is None else os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.on_event("startup")
async def startup_db_seed():
    """Initialize database with seed data on startup"""
    try:
        achievements_count = await db.achievements.count_documents({})
        if achievements_count == 0:
            achievements = [
                {
                    "id": "membre_fidele",
                    "nom": "Membre Fidèle",
                    "description": "Participer à 10 événements du club",
                    "icone": "🏐",
                    "points": 100
                },
                {
                    "id": "toujours_present",
                    "nom": "Toujours Présent",
                    "description": "Participer à 20 événements du club",
                    "icone": "⭐",
                    "points": 250
                },
                {
                    "id": "veteran",
                    "nom": "Vétéran",
                    "description": "Participer à 50 événements du club",
                    "icone": "👑",
                    "points": 500
                },
                {
                    "id": "premier_tournoi",
                    "nom": "Premier Tournoi",
                    "description": "S'inscrire à son premier tournoi",
                    "icone": "🎯",
                    "points": 50
                },
                {
                    "id": "champion",
                    "nom": "Champion du Club",
                    "description": "Gagner 3 tournois",
                    "icone": "🏆",
                    "points": 1000
                }
            ]
            await db.achievements.insert_many(achievements)
        
        training_count = await db.training_schedule.count_documents({})
        if training_count == 0:
            schedules = [
                {
                    "id": "lundi_entrainement",
                    "jour": "Lundi",
                    "heure_debut": "18:00",
                    "heure_fin": "20:00",
                    "type": "Entraînement",
                    "licence_requise": "competition",
                    "description": "Entraînement dirigé pour les licenciés Compétition"
                },
                {
                    "id": "lundi_jeu_livre",
                    "jour": "Lundi",
                    "heure_debut": "20:00",
                    "heure_fin": "22:00",
                    "type": "Jeu Libre",
                    "licence_requise": "tous",
                    "description": "Jeu libre ouvert à tous les licenciés"
                },
                {
                    "id": "mercredi_entrainement",
                    "jour": "Mercredi",
                    "heure_debut": "18:00",
                    "heure_fin": "20:00",
                    "type": "Entraînement",
                    "licence_requise": "competition",
                    "description": "Entraînement dirigé pour les licenciés Compétition"
                },
                {
                    "id": "mercredi_jeu_livre",
                    "jour": "Mercredi",
                    "heure_debut": "20:00",
                    "heure_fin": "22:00",
                    "type": "Jeu Libre",
                    "licence_requise": "tous",
                    "description": "Jeu libre ouvert à tous les licenciés"
                },
                {
                    "id": "vendredi_jeu_livre",
                    "jour": "Vendredi",
                    "heure_debut": "18:00",
                    "heure_fin": "22:00",
                    "type": "Jeu Livre",
                    "licence_requise": "tous",
                    "description": "Jeu libre ouvert à tous les licenciés"
                }
            ]
            await db.training_schedule.insert_many(schedules)
        
        logger.info("✓ Database seed completed successfully")
    except Exception as e:
        logger.error(f"Error during startup seed: {e}")

@app.on_event("shutdown")
async def shutdown_db_client():
    if client is not None:
        client.close()
