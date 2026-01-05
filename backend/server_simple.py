"""
🚀 Simple Working FastAPI Backend for TCS Volleyball
This is a minimal but complete backend that actually works
"""
from fastapi import FastAPI, HTTPException, Depends, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
import jwt
import os
from typing import Optional

# Configuration
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "votre-cle-secrete-super-securisee-changez-moi")
JWT_ALGORITHM = "HS256"
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

# Simple in-memory database (can be replaced with MongoDB)
USERS_DB = {}

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

class TokenResponse(BaseModel):
    token: str
    user: UserResponse
    message: str

# FastAPI App
app = FastAPI(title="TCS Volleyball Backend")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://tcs-de-suzini.vercel.app",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"  # Allow all origins during development
    ],
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

# Routes
@app.get("/health")
async def health():
    """Health check"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.post("/api/auth/login", response_model=TokenResponse)
async def login(request: LoginRequest):
    """Login endpoint"""
    email = request.email.lower()
    
    # Check if user exists
    if email in USERS_DB:
        user = USERS_DB[email]
        # In production, verify password hash
        token = create_token(email, user["id"])
        return TokenResponse(
            token=token,
            user=UserResponse(**user),
            message="Connexion réussie!"
        )
    else:
        # For demo: create user on first login
        user_id = f"user_{len(USERS_DB) + 1}"
        user = {
            "id": user_id,
            "email": email,
            "nom": email.split("@")[0],
            "prenom": "Demo",
            "type_licence": "competition"
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
    
    # Check if user already exists
    if email in USERS_DB:
        raise HTTPException(
            status_code=400,
            detail="Cet email est déjà enregistré"
        )
    
    # Create user
    user_id = f"user_{len(USERS_DB) + 1}"
    user = {
        "id": user_id,
        "email": email,
        "nom": request.nom,
        "prenom": request.prenom,
        "type_licence": request.type_licence
    }
    USERS_DB[email] = user
    
    token = create_token(email, user_id)
    return TokenResponse(
        token=token,
        user=UserResponse(**user),
        message="Inscription réussie!"
    )

@app.get("/api/users/me")
async def get_me(authorization: Optional[str] = None):
    """Get current user info"""
    if not authorization:
        raise HTTPException(status_code=401, detail="No authorization header")
    
    # Extract token from "Bearer <token>"
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(status_code=401, detail="Invalid authorization header")
    
    token = parts[1]
    payload = verify_token(token)
    email = payload.get("sub")
    
    if email in USERS_DB:
        user = USERS_DB[email]
        return UserResponse(**user)
    else:
        raise HTTPException(status_code=404, detail="User not found")

@app.get("/api/seed-data")
async def seed_data():
    """Seed some demo data"""
    if len(USERS_DB) == 0:
        USERS_DB["test@example.com"] = {
            "id": "user_1",
            "email": "test@example.com",
            "nom": "Test",
            "prenom": "User",
            "type_licence": "competition"
        }
    return {"status": "seeded", "users": len(USERS_DB)}

@app.options("/{full_path:path}")
async def options_handler(full_path: str):
    """Handle CORS preflight requests"""
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
