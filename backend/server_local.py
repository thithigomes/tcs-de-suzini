"""
🚀 Complete Local Backend for TCS Volleyball - Full Functionality
All features working with in-memory data
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
import os
from typing import Optional, List

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "votre-cle-secrete-super-securisee-changez-moi")
JWT_ALGORITHM = "HS256"

# In-memory databases
USERS_DB = {}
TOURNAMENTS_DB = {}
MATCHES_DB = {}
RANKINGS_DB = {}
TRAINING_DB = {}
NEWS_DB = {}

# Pydantic Models
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    email: str
    password: str
    nom: str
    prenom: str
    type_licence: str = "competition"
    est_licencie: bool = True

class UserResponse(BaseModel):
    id: str
    email: str
    nom: str
    prenom: str
    type_licence: str
    role: str = "user"
    points: int = 0
    participations: int = 0

class TokenResponse(BaseModel):
    token: str
    user: UserResponse
    message: str

class Tournament(BaseModel):
    id: str
    nom: str
    date_debut: str
    date_fin: str
    statut: str = "inscriptions_ouvertes"
    participants_max: int = 16
    participants_actuels: int = 0

class Match(BaseModel):
    id: str
    nom: str
    date: str
    heure: str
    lieu: str
    equipe1: str
    equipe2: str
    resultat: str = "À venir"
    statut: str = "prévu"

class News(BaseModel):
    id: str
    titre: str
    contenu: str
    date: str
    auteur: str

class Training(BaseModel):
    id: str
    jour: str
    heure: str
    lieu: str
    entraineur: str
    niveau: str

# FastAPI App
app = FastAPI(title="TCS Volleyball Backend - Local")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def create_token(email: str, user_id: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": email,
        "user_id": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

def verify_token(token: str) -> dict:
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

def init_sample_data():
    """Initialize with sample data"""
    # Sample tournaments
    TOURNAMENTS_DB["t1"] = {
        "id": "t1",
        "nom": "Torneio TCS 2026",
        "date_debut": "2026-02-01",
        "date_fin": "2026-02-15",
        "statut": "inscriptions_ouvertes",
        "participants_max": 16,
        "participants_actuels": 8
    }
    TOURNAMENTS_DB["t2"] = {
        "id": "t2",
        "nom": "Campeonato Regional",
        "date_debut": "2026-03-01",
        "date_fin": "2026-03-20",
        "statut": "inscriptions_ouvertes",
        "participants_max": 12,
        "participants_actuels": 5
    }

    # Sample matches
    MATCHES_DB["m1"] = {
        "id": "m1",
        "nom": "TCS vs Rivais",
        "date": "2026-01-10",
        "heure": "19:00",
        "lieu": "Ginásio Central",
        "equipe1": "TCS Volleyball",
        "equipe2": "Rivais FC",
        "resultat": "2-1",
        "statut": "finalizado"
    }
    MATCHES_DB["m2"] = {
        "id": "m2",
        "nom": "Amistoso",
        "date": "2026-01-15",
        "heure": "20:00",
        "lieu": "Ginásio Centro",
        "equipe1": "TCS Volleyball",
        "equipe2": "Convidados",
        "resultat": "À venir",
        "statut": "prévu"
    }

    # Sample news
    NEWS_DB["n1"] = {
        "id": "n1",
        "titre": "Vitória na Final!",
        "contenu": "TCS conquistou o título do torneio regional com uma excelente performance.",
        "date": "2026-01-05",
        "auteur": "Admin"
    }
    NEWS_DB["n2"] = {
        "id": "n2",
        "titre": "Novo Técnico",
        "contenu": "Bem-vindo ao novo técnico de voleibol feminino.",
        "date": "2026-01-03",
        "auteur": "Admin"
    }

    # Sample training
    TRAINING_DB["tr1"] = {
        "id": "tr1",
        "dia": "Segunda",
        "heure": "19:00",
        "lieu": "Ginásio Principal",
        "entraineur": "Coach João",
        "niveau": "Iniciante"
    }
    TRAINING_DB["tr2"] = {
        "id": "tr2",
        "dia": "Quarta",
        "heure": "20:00",
        "lieu": "Ginásio Principal",
        "entraineur": "Coach Maria",
        "niveau": "Avançado"
    }

# Initialize data on startup
init_sample_data()

# Routes
@app.get("/api/health")
async def health():
    """Health check"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login endpoint"""
    email = request.email.lower()
    
    if email in USERS_DB:
        user = USERS_DB[email]
        token = create_token(email, user["id"])
        return TokenResponse(
            token=token,
            user=UserResponse(**user),
            message="Connexion réussie!"
        )
    else:
        # Auto-create on first login
        user_id = f"user_{len(USERS_DB) + 1}"
        user = {
            "id": user_id,
            "email": email,
            "nom": email.split("@")[0],
            "prenom": "User",
            "type_licence": "competition",
            "role": "user",
            "points": 0,
            "participations": 0
        }
        USERS_DB[email] = user
        token = create_token(email, user_id)
        return TokenResponse(
            token=token,
            user=UserResponse(**user),
            message="Connexion réussie!"
        )

@app.post("/api/auth/register", response_model=TokenResponse)
async def register(request: RegisterRequest):
    """Register endpoint"""
    email = request.email.lower()
    
    if email in USERS_DB:
        raise HTTPException(status_code=400, detail="Cet email est déjà enregistré")
    
    user_id = f"user_{len(USERS_DB) + 1}"
    user = {
        "id": user_id,
        "email": email,
        "nom": request.nom,
        "prenom": request.prenom,
        "type_licence": request.type_licence,
        "role": "user",
        "points": 0,
        "participations": 0
    }
    USERS_DB[email] = user
    
    token = create_token(email, user_id)
    return TokenResponse(
        token=token,
        user=UserResponse(**user),
        message="Inscription réussie!"
    )

@app.get("/api/users/me")
async def get_current_user(authorization: Optional[str] = None):
    """Get current user profile"""
    if not authorization:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    try:
        token = authorization.replace("Bearer ", "")
        payload = verify_token(token)
        email = payload.get("sub")
        if email in USERS_DB:
            return USERS_DB[email]
    except:
        pass
    
    raise HTTPException(status_code=401, detail="Invalid token")

@app.get("/api/tournaments", response_model=List[Tournament])
async def get_tournaments():
    """Get all tournaments"""
    return list(TOURNAMENTS_DB.values())

@app.get("/api/tournaments/{tournament_id}", response_model=Tournament)
async def get_tournament(tournament_id: str):
    """Get specific tournament"""
    if tournament_id not in TOURNAMENTS_DB:
        raise HTTPException(status_code=404, detail="Tournament not found")
    return TOURNAMENTS_DB[tournament_id]

@app.post("/api/tournaments/{tournament_id}/register")
async def register_tournament(tournament_id: str, authorization: Optional[str] = None):
    """Register for tournament"""
    if tournament_id not in TOURNAMENTS_DB:
        raise HTTPException(status_code=404, detail="Tournament not found")
    
    tournament = TOURNAMENTS_DB[tournament_id]
    if tournament["participants_actuels"] < tournament["participants_max"]:
        tournament["participants_actuels"] += 1
        return {"message": "Registered successfully"}
    
    raise HTTPException(status_code=400, detail="Tournament is full")

@app.get("/api/matches", response_model=List[Match])
async def get_matches():
    """Get all matches"""
    return list(MATCHES_DB.values())

@app.get("/api/matches/{match_id}", response_model=Match)
async def get_match(match_id: str):
    """Get specific match"""
    if match_id not in MATCHES_DB:
        raise HTTPException(status_code=404, detail="Match not found")
    return MATCHES_DB[match_id]

@app.get("/api/news", response_model=List[News])
async def get_news():
    """Get all news"""
    return list(NEWS_DB.values())

@app.get("/api/news/{news_id}", response_model=News)
async def get_news_detail(news_id: str):
    """Get specific news"""
    if news_id not in NEWS_DB:
        raise HTTPException(status_code=404, detail="News not found")
    return NEWS_DB[news_id]

@app.get("/api/training", response_model=List[Training])
async def get_training():
    """Get all training sessions"""
    return list(TRAINING_DB.values())

@app.get("/api/rankings")
async def get_rankings():
    """Get player rankings"""
    # Return sample rankings
    return [
        {"position": 1, "nome": "João Silva", "pontos": 2500, "participacoes": 15},
        {"position": 2, "nome": "Maria Santos", "pontos": 2200, "participacoes": 12},
        {"position": 3, "nome": "Pedro Costa", "pontos": 1900, "participacoes": 10},
        {"position": 4, "nome": "Ana Oliveira", "pontos": 1700, "participacoes": 9},
        {"position": 5, "nome": "Lucas Ferreira", "pontos": 1500, "participacoes": 8},
    ]

@app.get("/api/seed-data")
async def seed_data():
    """Initialize sample data"""
    init_sample_data()
    return {"message": "Data seeded successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
