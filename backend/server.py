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
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
security = HTTPBearer()

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'votre-cle-secrete-super-securisee-changez-moi')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 43200

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_NOTIFICATION_EMAIL', 'thiago.gomes97300@gmail.com')
REFERENT_SECRET_CODE = "TCS-REF-2025"

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

logger = logging.getLogger(__name__)

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

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

async def send_email_async(to_email: str, subject: str, html_content: str):
    if not RESEND_API_KEY or RESEND_API_KEY == 're_123456789':
        logger.warning(f"Email not sent (no API key): {subject} to {to_email}")
        return
    
    params = {
        "from": SENDER_EMAIL,
        "to": [to_email],
        "subject": subject,
        "html": html_content
    }
    
    try:
        await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent: {subject} to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")

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
    
    reset_link = f"https://tcsvolley.preview.emergentagent.com/reset-password?token={reset_token}"
    
    await send_email_async(
        request.email,
        "Réinitialisation de votre mot de passe - TCS Suzini",
        f"""
        <h2>Réinitialisation de mot de passe</h2>
        <p>Bonjour {user['prenom']},</p>
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:</p>
        <p><a href="{reset_link}" style="background: #FF6B35; color: white; padding: 12px 24px; text-decoration: none; border-radius: 25px; display: inline-block;">Réinitialiser mon mot de passe</a></p>
        <p>Ce lien expirera dans 30 jours.</p>
        <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
        """
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

@api_router.get("/referent/users", response_model=List[User])
async def get_all_users(current_user: dict = Depends(get_current_referent)):
    users = await db.users.find({}, {"_id": 0, "password_hash": 0}).to_list(1000)
    return [User(**user) for user in users]

@api_router.delete("/referent/users/{user_id}")
async def delete_user(user_id: str, current_user: dict = Depends(get_current_referent)):
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
async def create_match(match_data: MatchCreate, current_user: dict = Depends(get_current_admin)):
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
async def create_news(news_data: NewsCreate, current_user: dict = Depends(get_current_admin)):
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
    schedules = await db.training_schedule.find({}, {"_id": 0}).to_list(100)
    return schedules

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
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
