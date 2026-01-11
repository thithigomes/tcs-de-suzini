#!/usr/bin/env python3
"""
🚀 Deploy Backend to Railway
"""
import subprocess
import json
import os
import time

def run(cmd, desc=""):
    """Run command"""
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=30)
        if desc:
            status = "✅" if result.returncode == 0 else "⚠️"
            print(f"   {status} {desc}")
        return result.returncode == 0, result.stdout, result.stderr
    except Exception as e:
        if desc:
            print(f"   ❌ {desc}: {str(e)[:50]}")
        return False, "", str(e)

print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                   🚀 DEPLOY BACKEND TO RAILWAY 🚀                         ║
╚════════════════════════════════════════════════════════════════════════════╝
    """)

print("\n📝 PASSO 1: Verificar Railway CLI")
print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")

success, _, _ = run("which railway", "Railway CLI")
if not success:
    print("\n❌ Railway CLI não instalado")
    print("\nDEPLOY MANUAL NO RAILWAY:")
    print("1. Abra: https://railway.app/dashboard")
    print("2. Clique: New Project → Deploy from GitHub")
    print("3. Selecione: thithigomes/tcs-de-suzini")
    print("4. Configure:")
    print("   - Build Command: (deixar vazio)")
    print("   - Start Command: python -m uvicorn backend.server_simple:app --host 0.0.0.0 --port $PORT")
    print("   - Root Directory: .")
    print("5. Aguarde deploy completar")
    print("6. Copie a URL gerada (ex: https://xxx.railway.app)")
    print("7. Execute:")
    print("   vercel env update REACT_APP_BACKEND_URL production")
    print("   (e cole a URL do Railway)")
    print("\n8. Faça redeploy no Vercel")
else:
    print("   Railway CLI disponível, fazendo deploy...")
    print("\n📝 PASSO 2: Deploy")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    os.chdir("/home/ermak/tcs-voleyball")
    
    # Try to deploy
    success, out, err = run("railway deploy --no-cache", "Deployando backend")
    
    if success or "Deployment" in out:
        print("\n✅ Backend deployado!")
        print("\n🔗 PRÓXIMOS PASSOS:")
        print("   1. Abra: https://railway.app/dashboard")
        print("   2. Procure seu projeto")
        print("   3. Copie a URL de deployment (ex: https://xxx.railway.app)")
        print("   4. Execute: vercel env update REACT_APP_BACKEND_URL production")
        print("   5. Cole a URL do Railway")
        print("   6. Faça redeploy no Vercel")
    else:
        print("\n⚠️  Erro no deploy:")
        print(out[:200] if out else "")
        print(err[:200] if err else "")
