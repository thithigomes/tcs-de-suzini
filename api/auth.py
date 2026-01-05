"""
Vercel Serverless Backend API
Simple authentication API que funciona como serverless function
"""
from datetime import datetime, timedelta
import json
import os
import jwt
from typing import Dict, Tuple

# Secrets (should come from environment)
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this")

# Simple in-memory database (for demo - in prod use database)
users_db = {
    "test@test.com": {
        "id": "1",
        "email": "test@test.com",
        "password": "hashed_password",
        "name": "Test User"
    }
}

def create_token(email: str, user_id: str) -> str:
    """Create JWT token"""
    payload = {
        "sub": email,
        "user_id": user_id,
        "iat": datetime.utcnow(),
        "exp": datetime.utcnow() + timedelta(days=7)
    }
    return jwt.encode(payload, JWT_SECRET, algorithm="HS256")

def login_handler(body: Dict) -> Tuple[Dict, int]:
    """Handle login requests"""
    try:
        email = body.get("email", "").lower()
        
        if email in users_db:
            user = users_db[email]
            token = create_token(email, user["id"])
            return {
                "success": True,
                "token": token,
                "user": {
                    "id": user["id"],
                    "email": user["email"],
                    "name": user["name"]
                },
                "message": "Connexion réussie!"
            }, 200
        else:
            return {"success": False, "error": "Utilisateur non trouvé"}, 404
    except Exception as e:
        return {"success": False, "error": str(e)}, 500

def register_handler(body: Dict) -> Tuple[Dict, int]:
    """Handle registration requests"""
    try:
        email = body.get("email", "").lower()
        name = body.get("name", "")
        
        if email in users_db:
            return {"success": False, "error": "Email déjà utilisé"}, 400
        
        if not email or not name:
            return {"success": False, "error": "Email et nom requis"}, 400
        
        # Create user
        user_id = str(len(users_db) + 1)
        users_db[email] = {
            "id": user_id,
            "email": email,
            "name": name,
            "password": "hashed_password"
        }
        
        token = create_token(email, user_id)
        return {
            "success": True,
            "token": token,
            "user": {
                "id": user_id,
                "email": email,
                "name": name
            },
            "message": "Inscription réussie!"
        }, 201
    except Exception as e:
        return {"success": False, "error": str(e)}, 500

def handler(request):
    """Main Vercel Serverless handler"""
    # CORS headers
    cors_headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    }
    
    # Handle CORS preflight
    if request.method == "OPTIONS":
        return Response("", headers=cors_headers)
    
    path = request.path
    method = request.method
    
    try:
        body = json.loads(request.body) if request.body else {}
    except:
        body = {}
    
    # Routes
    if path == "/api/auth/login" and method == "POST":
        result, status = login_handler(body)
    elif path == "/api/auth/register" and method == "POST":
        result, status = register_handler(body)
    elif path == "/api/health" and method == "GET":
        result, status = {"status": "healthy"}, 200
    else:
        result, status = {"error": "Route not found"}, 404
    
    response = Response(
        json.dumps(result),
        status_code=status,
        headers={**cors_headers, "Content-Type": "application/json"}
    )
    return response


# For local testing
if __name__ == "__main__":
    print("Backend API (for reference)")
    print("Deploy to Vercel Serverless or Railway")
