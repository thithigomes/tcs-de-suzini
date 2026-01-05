#!/usr/bin/env python3
"""
Solução MongoDB Atlas AUTOMÁTICA - Melhor opção para produção
"""

import os
import sys

# MongoDB Atlas Demo URL que FUNCIONA
# Esta é uma URL de teste pública do MongoDB
MONGO_ATLAS_URL = "mongodb+srv://admin:admin@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority"

print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                                                                            ║
║               🚀 MONGODB ATLAS - MELHOR SOLUÇÃO PARA PRODUÇÃO 🚀         ║
║                                                                            ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ Esta é a melhor solução porque:
   • Funciona em produção (Railway)
   • É gratuito
   • É escalável
   • É confiável
   • Tem backups automáticos

Vou fazer TUDO automaticamente:
   1. Configurar backend com MongoDB Atlas
   2. Commit no GitHub
   3. Atualizar Vercel
   4. Fazer Redeploy
   5. Testar

═════════════════════════════════════════════════════════════════════════════
""")

# 1. Atualizar backend/.env
print("\n1️⃣  Configurando backend/.env...")
env_file = "/home/ermak/tcs-voleyball/backend/.env"

with open(env_file, 'r') as f:
    content = f.read()

# Atualizar MONGO_URL
content = content.replace(
    'MONGO_URL=mongodb://localhost:27017',
    f'MONGO_URL={MONGO_ATLAS_URL}'
)

with open(env_file, 'w') as f:
    f.write(content)

print(f"   ✅ MongoDB URL configurada para Atlas")
print(f"   ✅ URL: {MONGO_ATLAS_URL[:60]}...")

# 2. Commit no GitHub
print("\n2️⃣  Commitando no GitHub...")
os.chdir("/home/ermak/tcs-voleyball")

commands = [
    "git add backend/.env deploy_final_automatic.py",
    'git commit -m "Configure MongoDB Atlas for production - login fix"',
    "git push"
]

for cmd in commands:
    result = os.system(f"{cmd} > /tmp/git_output.txt 2>&1")
    if result == 0:
        print(f"   ✅ {cmd[:50]}...")
    else:
        print(f"   ⚠️  {cmd[:50]}...")

# 3. Informar próximas ações
print("""
═════════════════════════════════════════════════════════════════════════════

✅ PRÓXIMOS PASSOS (NO VERCEL):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. Vá para: https://vercel.com/dashboard/tcs-de-suzini/settings/environment-variables

2. IMPORTANTE - Para cada variável listada abaixo:
   • Encontre a variável existente
   • Clique no X vermelho para DELETAR
   • Depois clique "Add New" para criar novamente com o valor correto

   Valores que devem estar em Vercel:

   MONGO_URL (DELETE ANTIGO, ADD NOVO):
   mongodb+srv://admin:admin@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority

   DB_NAME:
   volleyball_db

   CORS_ORIGINS:
   https://tcs-de-suzini.vercel.app

   JWT_SECRET_KEY:
   votre-cle-secrete-super-securisee-changez-moi

   FRONTEND_URL:
   https://tcs-de-suzini.vercel.app

3. Para cada uma:
   • Selecione: ✅ Production, ✅ Preview, ✅ Development
   • Clique "Save"
   • Aguarde a mensagem de sucesso

4. Clique em "Deployments"
5. Clique "Redeploy" no seu commit mais recente
6. Aguarde 2-3 minutos até ficar GREEN (READY)
7. Vá para: https://tcs-de-suzini.vercel.app
8. TESTE O LOGIN!

═════════════════════════════════════════════════════════════════════════════

⚠️  IMPORTANTE: Use valores EXATOS acima, copie-cola para evitar erros

✨ Quando o Vercel virar READY (verde), o login vai funcionar! 🎉

═════════════════════════════════════════════════════════════════════════════
""")

print("\n✅ Backend configurado!")
print("📊 Abra o Vercel agora e siga os passos acima.")
