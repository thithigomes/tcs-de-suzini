#!/usr/bin/env python3
"""
Script para diagnosticar e corrigir problemas de login
"""

import requests
import os
from pathlib import Path

def test_backend(url):
    """Testa se o backend está respondendo"""
    print(f"🔍 Testando backend: {url}")
    print("=" * 70)
    
    # Test 1: Health check
    try:
        response = requests.get(f"{url}/api/health", timeout=5)
        print(f"✅ Health check: {response.status_code}")
    except Exception as e:
        print(f"❌ Health check falhou: {e}")
    
    # Test 2: Docs
    try:
        response = requests.get(f"{url}/docs", timeout=5)
        print(f"✅ Docs: {response.status_code}")
    except Exception as e:
        print(f"❌ Docs falhou: {e}")
    
    # Test 3: CORS preflight
    try:
        response = requests.options(
            f"{url}/api/auth/login",
            headers={
                "Origin": "https://tcs-de-suzini.vercel.app",
                "Access-Control-Request-Method": "POST",
                "Access-Control-Request-Headers": "content-type"
            },
            timeout=5
        )
        print(f"✅ CORS preflight: {response.status_code}")
        if "access-control-allow-origin" in response.headers:
            print(f"   Allowed-Origin: {response.headers.get('access-control-allow-origin')}")
    except Exception as e:
        print(f"❌ CORS preflight falhou: {e}")
    
    # Test 4: Login endpoint
    try:
        response = requests.post(
            f"{url}/api/auth/login",
            json={
                "email": "test@example.com",
                "password": "test123"
            },
            timeout=5
        )
        print(f"✅ Login endpoint: {response.status_code} (esperado 401)")
    except Exception as e:
        print(f"❌ Login endpoint falhou: {e}")
    
    print()

def check_env_file():
    """Verifica arquivo .env do backend"""
    print("🔍 Verificando configurações de ambiente")
    print("=" * 70)
    
    env_path = Path("/home/ermak/tcs-voleyball/backend/.env")
    if env_path.exists():
        with open(env_path) as f:
            lines = f.readlines()
        
        for line in lines:
            if "=" in line and not line.strip().startswith("#"):
                key = line.split("=")[0]
                value = line.split("=", 1)[1].strip()
                
                if key in ["MONGO_URL", "DB_NAME", "FRONTEND_URL", "JWT_SECRET_KEY", "CORS_ORIGINS"]:
                    if len(value) > 40:
                        print(f"✅ {key}: {value[:40]}...")
                    else:
                        print(f"✅ {key}: {value}")
    print()

if __name__ == "__main__":
    print("\n")
    print("╔" + "=" * 68 + "╗")
    print("║" + " " * 15 + "DIAGNÓSTICO DE PROBLEMAS DE LOGIN" + " " * 20 + "║")
    print("╚" + "=" * 68 + "╝")
    print()
    
    # Testar localhost (para desenvolvimento)
    test_backend("http://localhost:8000")
    
    # Verificar configurações
    check_env_file()
    
    print("💡 SOLUÇÃO:")
    print("=" * 70)
    print("1. Se o backend local está respondendo:")
    print("   - Seu código está certo")
    print("   - Você precisa deployar corretamente no Railway")
    print("")
    print("2. Se o backend não está respondendo:")
    print("   - Inicie com: cd backend && source ../venv/bin/activate")
    print("   - Depois: uvicorn server:app --host 0.0.0.0 --port 8000")
    print("")
    print("3. Para Railway:")
    print("   - Certifique-se que CORS_ORIGINS está configurado corretamente")
    print("   - MongoDB URL precisa ser uma URL válida (não localhost)")
    print("")
