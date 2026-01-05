"""
Vercel Serverless API - Volleyball App Backend
Simple authentication endpoints for testing
"""
import json
import os
from datetime import datetime, timedelta
import base64

# Simple JWT implementation (production should use proper library)
JWT_SECRET = os.getenv("JWT_SECRET_KEY", "votre-cle-secrete-super-securisee-changez-moi")

# In-memory store (for demo)
USERS = {
    "test@example.com": {
        "id": "1",
        "name": "Test User",
        "email": "test@example.com"
    }
}

def create_response(status_code, data):
    """Create proper response"""
    return {
        "statusCode": status_code,
        "headers": {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization"
        },
        "body": json.dumps(data)
    }

def create_token(email, user_id):
    """Simple JWT token creation"""
    # For demo purposes, just use base64 encoded user info
    payload = base64.b64encode(f"{email}:{user_id}:{int(datetime.now().timestamp())}".encode()).decode()
    return f"demo_token_{payload}"

def login(body):
    """Handle login"""
    email = body.get("email", "").lower()
    password = body.get("password", "")
    
    # Demo: accept any non-empty credentials
    if not email or not password:
        return create_response(400, {
            "success": False,
            "error": "Email et mot de passe requis"
        })
    
    if email in USERS:
        user = USERS[email]
        token = create_token(email, user["id"])
        return create_response(200, {
            "success": True,
            "message": "Connexion réussie!",
            "token": token,
            "user": user
        })
    else:
        # Create test user on first login
        user_id = str(len(USERS) + 1)
        USERS[email] = {
            "id": user_id,
            "name": email.split("@")[0],
            "email": email
        }
        token = create_token(email, user_id)
        return create_response(200, {
            "success": True,
            "message": "Connexion réussie!",
            "token": token,
            "user": USERS[email]
        })

def register(body):
    """Handle registration"""
    email = body.get("email", "").lower()
    password = body.get("password", "")
    name = body.get("name", "")
    
    if not email or not password or not name:
        return create_response(400, {
            "success": False,
            "error": "Email, mot de passe et nom requis"
        })
    
    if email in USERS:
        return create_response(409, {
            "success": False,
            "error": "Cet email est déjà utilisé"
        })
    
    user_id = str(len(USERS) + 1)
    USERS[email] = {
        "id": user_id,
        "name": name,
        "email": email
    }
    
    token = create_token(email, user_id)
    return create_response(201, {
        "success": True,
        "message": "Inscription réussie!",
        "token": token,
        "user": USERS[email]
    })

def handler(request):
    """Main handler"""
    # Handle OPTIONS for CORS
    if request.method == "OPTIONS":
        return create_response(200, {"ok": True})
    
    path = request.path
    method = request.method
    
    try:
        body = json.loads(request.get("body", "{}")) if request.get("body") else {}
    except:
        body = {}
    
    # Routes
    if path == "/api/auth/login" and method == "POST":
        return login(body)
    elif path == "/api/auth/register" and method == "POST":
        return register(body)
    elif path == "/api/health":
        return create_response(200, {"status": "healthy", "timestamp": datetime.now().isoformat()})
    else:
        return create_response(404, {"error": f"Route {path} not found"})
