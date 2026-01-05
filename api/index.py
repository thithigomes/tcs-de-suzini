"""
Vercel Serverless Functions - Authentication API
This backend runs on Vercel and provides auth endpoints
"""
import json
import jwt
from datetime import datetime, timedelta
import os

JWT_SECRET = os.getenv("JWT_SECRET_KEY", "votre-cle-secrete-super-securisee-changez-moi")

# Global in-memory database
USERS_DB = {}

def create_token(email: str, user_id: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": email,
        "user_id": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=30)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def handler(request):
    """Main Vercel Functions handler"""
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Content-Type": "application/json"
    }
    
    if request.method == "OPTIONS":
        return {"statusCode": 200, "headers": cors_headers, "body": ""}
    
    path = request.path
    method = request.method
    
    try:
        body = json.loads(request.body) if request.body else {}
    except:
        body = {}
    
    # LOGIN
    if path == "/api/auth/login" and method == "POST":
        email = body.get("email", "").lower()
        if not email:
            return {"statusCode": 400, "headers": cors_headers, 
                   "body": json.dumps({"error": "Email required"})}
        
        if email not in USERS_DB:
            USERS_DB[email] = {
                "id": f"u{len(USERS_DB)+1}",
                "email": email,
                "nom": email.split("@")[0],
                "prenom": "User"
            }
        
        user = USERS_DB[email]
        token = create_token(email, user["id"])
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({
                "token": token,
                "user": user,
                "message": "Connexion réussie!"
            })
        }
    
    # REGISTER
    elif path == "/api/auth/register" and method == "POST":
        email = body.get("email", "").lower()
        nom = body.get("nom", "")
        prenom = body.get("prenom", "")
        
        if not email or not nom or not prenom:
            return {"statusCode": 400, "headers": cors_headers,
                   "body": json.dumps({"error": "Missing fields"})}
        
        if email in USERS_DB:
            return {"statusCode": 409, "headers": cors_headers,
                   "body": json.dumps({"error": "Email exists"})}
        
        user = {
            "id": f"u{len(USERS_DB)+1}",
            "email": email,
            "nom": nom,
            "prenom": prenom
        }
        USERS_DB[email] = user
        token = create_token(email, user["id"])
        return {
            "statusCode": 201,
            "headers": cors_headers,
            "body": json.dumps({
                "token": token,
                "user": user,
                "message": "Inscription réussie!"
            })
        }
    
    # HEALTH
    elif path == "/api/health":
        return {
            "statusCode": 200,
            "headers": cors_headers,
            "body": json.dumps({"status": "ok"})
        }
    
    return {
        "statusCode": 404,
        "headers": cors_headers,
        "body": json.dumps({"error": "Not found"})
    }
