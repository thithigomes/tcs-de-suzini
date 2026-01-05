#!/usr/bin/env python3
"""
Solução definitiva: Use MongoDB em Docker via Online MongoDB (free tier)
ou crie uma conta real no MongoDB Atlas
"""

import requests

print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║                   🔧 SOLUÇÃO DEFINITIVA PARA LOGIN 🔧                     ║
║                                                                            ║
║              O problema: MongoDB não está disponível em produção          ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

❌ PROBLEMA:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  Backend não pode conectar ao MongoDB:
  • MongoDB localhost não funciona em Railway (não existe lá)
  • MongoDB Atlas URL estava inválida (demo/demo@cluster0 não existe)
  
  Resultado: Login e Registro retornam erro 500 (conexão não funciona)

✅ SOLUÇÕES (escolha 1):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OPÇÃO 1: MongoDB Atlas FREE (Recomendado - Rápido)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Tempo: 3 minutos

1. Vá para: https://www.mongodb.com/cloud/atlas
2. Clique "Sign Up Free"
3. Crie conta com Google (mais rápido)
4. Após login, clique "Create a Deployment"
5. Escolha "Shared" (gratuito)
6. Selecione região (qualquer uma)
7. Clique "Create"
8. Clique "Network Access" → "Add IP Address" → "Allow All" (0.0.0.0/0)
9. Clique "Database Access" → "Add Database User"
   - Username: admin
   - Password: qualquer senha segura
10. Clique "Connect" → Copie a MongoDB Connection String
    Será algo como: mongodb+srv://admin:SuaSenha@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority

OPÇÃO 2: MongoDB Local + Serviço Online
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Tempo: 5 minutos

Use MongoDBOnline.com ou MongoDB Compass local


OPÇÃO 3: MongoDB em Docker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️  Tempo: 2 minutos

docker run -d -p 27017:27017 mongo

═════════════════════════════════════════════════════════════════════════════

Recomendação: OPÇÃO 1 (MongoDB Atlas) - é mais rápido e funciona com Railway

Após obter a connection string, cole aqui:

═════════════════════════════════════════════════════════════════════════════
""")

connection_string = input("\n🔗 Cole sua MongoDB Atlas connection string aqui:\n>>> ").strip()

if not connection_string:
    print("\n❌ Nenhuma connection string fornecida. Abortando.")
    exit(1)

print(f"\n✅ Configurando com: {connection_string[:50]}...")

# Atualizar .env
import os
env_file = "/home/ermak/tcs-voleyball/backend/.env"

with open(env_file, 'r') as f:
    lines = f.readlines()

new_lines = []
for line in lines:
    if line.startswith('MONGO_URL='):
        new_lines.append(f'MONGO_URL={connection_string}\n')
    else:
        new_lines.append(line)

with open(env_file, 'w') as f:
    f.writelines(new_lines)

print(f"✅ Arquivo .env atualizado!")
print(f"\nPróximos passos:")
print(f"1. Commit e push no GitHub")
print(f"2. Vercel fará novo deploy automático (ou redeploy manual)")
print(f"3. Aguarde 2-3 minutos")
print(f"4. Teste login em https://tcs-de-suzini.vercel.app")
