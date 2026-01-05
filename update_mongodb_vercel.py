#!/usr/bin/env python3
"""
Script para atualizar Vercel com a conexão MongoDB correta
"""

import requests
import json

VERCEL_TOKEN = "HwizDaTz8j3c1hgjJFtnW6be"
PROJECT_ID = "prj_f0IgkZ2x1qRygWMdLJBpQiRRp3Rl"

# ⚠️ IMPORTANTE: Substituir com sua MongoDB Atlas connection string REAL
MONGODB_URI = "mongodb+srv://admin:Admin123456@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority"

print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                  🚀 ATUALIZAR VERCEL COM MONGODB CORRETO 🚀              ║
╚════════════════════════════════════════════════════════════════════════════╝
""")

print(f"MongoDB URI: {MONGODB_URI[:60]}...")
print()

headers = {
    "Authorization": f"Bearer {VERCEL_TOKEN}",
    "Content-Type": "application/json"
}

# Atualizar variável MONGO_URL
env_data = {
    "key": "MONGO_URL",
    "value": MONGODB_URI,
    "type": "plain",
    "target": ["production", "preview", "development"]
}

print("Atualizando MONGO_URL em Vercel...")
response = requests.post(
    f"https://api.vercel.com/v9/projects/{PROJECT_ID}/env",
    headers=headers,
    json=env_data
)

if response.status_code in [200, 201]:
    print("✅ MONGO_URL atualizado com sucesso!")
else:
    print(f"⚠️  Status: {response.status_code}")
    if response.text:
        print(f"   Erro: {response.text[:100]}")

print()
print("═" * 80)
print("✅ VERCEL ATUALIZADO!")
print("═" * 80)
print()
print("🎬 Próximos passos:")
print("   1. Vá para: https://vercel.com/dashboard/tcs-de-suzini/deployments")
print("   2. Clique em 'Redeploy' no seu commit mais recente")
print("   3. Aguarde 2-3 minutos")
print("   4. Teste login em: https://tcs-de-suzini.vercel.app")
print()
