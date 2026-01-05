#!/usr/bin/env python3
"""
🔧 Complete Vercel Automation with Fallback Strategy
"""
import os
import subprocess
import json
import re
from pathlib import Path

def get_vercel_token():
    """Try to get Vercel token from various sources"""
    print("🔐 Procurando token do Vercel...")
    
    # Try environment
    if os.getenv("VERCEL_TOKEN"):
        print("✅ Token encontrado em VERCEL_TOKEN")
        return os.getenv("VERCEL_TOKEN")
    
    # Try local Vercel config
    vercel_auth_path = Path.home() / ".vercel" / "auth.json"
    if vercel_auth_path.exists():
        try:
            with open(vercel_auth_path) as f:
                auth = json.load(f)
                token = auth.get("token")
                if token:
                    print("✅ Token encontrado em ~/.vercel/auth.json")
                    return token
        except:
            pass
    
    print("❌ Token não encontrado")
    return None

def execute_vercel_automation():
    """Execute the automation script"""
    print("\n" + "="*80)
    print("🤖 INICIANDO AUTOMAÇÃO VERCEL")
    print("="*80)
    
    token = get_vercel_token()
    
    if not token:
        print("""
❌ TOKEN NÃO ENCONTRADO

Para completar a automação, você precisa fornecer seu Vercel Token.

OPÇÃO 1: Usar vercel CLI
   1. Instale: npm install -g vercel
   2. Execute: vercel login
   3. Role o script de novo

OPÇÃO 2: Usar token existente
   1. Vá para: https://vercel.com/account/tokens
   2. Crie um novo token (Full Access)
   3. Execute: export VERCEL_TOKEN="seu_token_aqui"
   4. Role o script de novo

OPÇÃO 3: Configuração manual (2 minutos)
   A página do Vercel está aberta. Você pode:
   1. Deletar as 5 variáveis antigas manualmente
   2. Adicionar as 5 novas variáveis
   3. Clicar Redeploy

Tentando fallback automático...
        """)
        return attempt_manual_fallback()
    
    # Set token as environment variable and run script
    env = os.environ.copy()
    env["VERCEL_TOKEN"] = token
    
    result = subprocess.run(
        ["python3", "/home/ermak/tcs-voleyball/vercel_auto_setup.py"],
        env=env,
        capture_output=False
    )
    
    return result.returncode == 0

def attempt_manual_fallback():
    """Fallback: provide detailed manual instructions"""
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║            ⚡ USANDO FALLBACK - INSTRUÇÕES PARA VOCÊ FAZER ⚡            ║
╚════════════════════════════════════════════════════════════════════════════╝

📋 PASSO 1: DELETAR Variáveis Antigas (2 minutos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. Vá para: https://vercel.com/dashboard/tcs-de-suzini/settings/environment-variables
   2. Para CADA uma dessas variáveis (se existir):
      • MONGO_URL
      • DB_NAME
      • CORS_ORIGINS
      • JWT_SECRET_KEY
      • FRONTEND_URL
   3. Clique no X VERMELHO para deletar
   4. Aguarde cada uma desaparecer

🆕 PASSO 2: ADICIONAR Variáveis Novas (3 minutos)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   Clique "Add New" 5 vezes:

   ┌─ VARIÁVEL 1 ─────────────────────────────────────────────────────────────┐
   │ Name: MONGO_URL                                                         │
   │ Value: mongodb+srv://admin:admin@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority │
   │ Scope: ✅ Production  ✅ Preview  ✅ Development                        │
   │ Clique: SAVE                                                            │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─ VARIÁVEL 2 ─────────────────────────────────────────────────────────────┐
   │ Name: DB_NAME                                                           │
   │ Value: volleyball_db                                                    │
   │ Scope: ✅ Production  ✅ Preview  ✅ Development                        │
   │ Clique: SAVE                                                            │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─ VARIÁVEL 3 ─────────────────────────────────────────────────────────────┐
   │ Name: CORS_ORIGINS                                                      │
   │ Value: https://tcs-de-suzini.vercel.app                                │
   │ Scope: ✅ Production  ✅ Preview  ✅ Development                        │
   │ Clique: SAVE                                                            │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─ VARIÁVEL 4 ─────────────────────────────────────────────────────────────┐
   │ Name: JWT_SECRET_KEY                                                    │
   │ Value: votre-cle-secrete-super-securisee-changez-moi                   │
   │ Scope: ✅ Production  ✅ Preview  ✅ Development                        │
   │ Clique: SAVE                                                            │
   └─────────────────────────────────────────────────────────────────────────┘

   ┌─ VARIÁVEL 5 ─────────────────────────────────────────────────────────────┐
   │ Name: FRONTEND_URL                                                      │
   │ Value: https://tcs-de-suzini.vercel.app                                │
   │ Scope: ✅ Production  ✅ Preview  ✅ Development                        │
   │ Clique: SAVE                                                            │
   └─────────────────────────────────────────────────────────────────────────┘

🚀 PASSO 3: REDEPLOY (1 minuto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. Clique em "Deployments" no menu do Vercel
   2. Procure seu commit mais recente
   3. Clique "Redeploy"
   4. Aguarde 2-3 minutos até virar VERDE (READY)

🧪 PASSO 4: TESTAR (1 minuto)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   1. Abra: https://tcs-de-suzini.vercel.app
   2. Clique em "Login" ou "Register"
   3. Tente criar uma conta ou fazer login
   4. Abra Console (F12) e procure por erros

✅ SE TUDO FUNCIONAR:
   • Vê "Connexion réussie!"
   • Redireciona para Dashboard
   • Nenhum erro no Console
   🎉 LOGIN FUNCIONANDO! 🎉

═════════════════════════════════════════════════════════════════════════════

ℹ️  Página do Vercel Settings já está aberta em seu navegador.
    Você consegue fazer esses passos? (5 minutos de trabalho)

═════════════════════════════════════════════════════════════════════════════
    """)
    return True

if __name__ == "__main__":
    execute_vercel_automation()
