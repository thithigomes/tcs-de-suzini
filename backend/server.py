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

class UserRegister(BaseModel):
    email: EmailStr
    password: str
    nom: str
    prenom: str
    type_licence: str  # "competition" ou "jeu_libre"
    est_licencie: bool

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

class TournamentCreate(BaseModel):
    nom: str
    description: str
    date_debut: str
    date_fin: str
    max_participants: int = 16

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
    if current_user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Accès non autorisé")
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
    
    token = create_access_token({"sub": user_id})
    return {"token": token, "user": User(**{k: v for k, v in user_doc.items() if k != "password_hash"})}

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user or not pwd_context.verify(credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")
    
    token = create_access_token({"sub": user["id"]})
    return {"token": token, "user": User(**{k: v for k, v in user.items() if k != "password_hash"})}

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

@api_router.get("/achievements", response_model=List[Achievement])
async def get_achievements():
    achievements = await db.achievements.find({}, {"_id": 0}).to_list(100)
    return achievements

@api_router.get("/tournaments", response_model=List[Tournament])
async def get_tournaments():
    tournaments = await db.tournaments.find({}, {"_id": 0}).sort("date_debut", -1).to_list(100)
    return tournaments

@api_router.post("/tournaments", response_model=Tournament)
async def create_tournament(tournament_data: TournamentCreate, current_user: dict = Depends(get_current_admin)):
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
        "max_participants": tournament_data.max_participants
    }
    
    await db.tournaments.insert_one(tournament_doc)
    return Tournament(**tournament_doc)

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
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()