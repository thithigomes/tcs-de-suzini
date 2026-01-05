#!/usr/bin/env python3
"""
Script para atualizar Railway com as variáveis de ambiente corrigidas
"""

import requests
import json

# Configurações
VERCEL_TOKEN = "HwizDaTz8j3c1hgjJFtnW6be"
PROJECT_ID = "prj_f0IgkZ2x1qRygWMdLJBpQiRRp3Rl"

# Variáveis a serem atualizadas
ENV_VARS = {
    "MONGO_URL": "mongodb+srv://demo:demo@cluster0.mongodb.net/volleyball_db",
    "DB_NAME": "volleyball_db",
    "JWT_SECRET_KEY": "votre-cle-secrete-super-securisee-changez-moi",
    "FRONTEND_URL": "https://tcs-de-suzini.vercel.app",
    "SMTP_SERVER": "smtp.gmail.com",
    "SMTP_PORT": "587",
    "SMTP_EMAIL": "thiago.gomes97300@gmail.com",
    "SMTP_PASSWORD": "adrm sgkf ujle bfla",
    "CORS_ORIGINS": "https://tcs-de-suzini.vercel.app,http://localhost:3000",
    "REACT_APP_BACKEND_URL": "https://tcs-de-suzini-api-production-xxxx.railway.app"
}

def update_vercel_env():
    """Atualiza variáveis de ambiente no Vercel"""
    
    print("╔════════════════════════════════════════════════════════════╗")
    print("║  🚀 ATUALIZAR RAILWAY COM CONFIGURAÇÕES CORRIGIDAS        ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print()
    
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }
    
    print("📝 Atualizando variáveis de ambiente em Vercel...")
    print()
    
    for key, value in ENV_VARS.items():
        # Criar nova variável
        env_data = {
            "key": key,
            "value": value,
            "type": "plain",
            "target": ["production", "preview", "development"]
        }
        
        response = requests.post(
            f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env",
            headers=headers,
            json=env_data
        )
        
        if response.status_code in [200, 201]:
            if len(value) > 40:
                print(f"✅ {key}: {value[:40]}...")
            else:
                print(f"✅ {key}: {value}")
        else:
            print(f"⚠️  {key}: Status {response.status_code}")
    
    print()
    print("═" * 64)
    print("✅ ATUALIZAÇÃO COMPLETA!")
    print("═" * 64)
    print()
    print("📊 Próximos passos:")
    print("   1. Vá para: https://vercel.com/dashboard/tcs-de-suzini")
    print("   2. Você verá um aviso sobre redeploy")
    print("   3. Clique em 'Redeploy' para aplicar as mudanças")
    print("   4. Aguarde 2-3 minutos")
    print("   5. Teste em: https://tcs-de-suzini.vercel.app")
    print()
    print("⚠️  IMPORTANTE:")
    print("   - MONGO_URL usando demo/demo é apenas para TESTE")
    print("   - Para produção real: criar conta em MongoDB Atlas")
    print("   - Atualizar MONGO_URL com suas credenciais reais")
    print()

if __name__ == "__main__":
    update_vercel_env()
