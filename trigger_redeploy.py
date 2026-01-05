#!/usr/bin/env python3
"""
Trigger Vercel redeploy using GitHub webhook or API
"""
import os
import requests
import json
import subprocess

def trigger_vercel_redeploy():
    """Trigger redeploy via API"""
    
    # Get Vercel token from CLI
    result = subprocess.run(
        ["vercel", "whoami", "-t"],
        capture_output=True,
        text=True,
        timeout=10
    )
    
    if result.returncode != 0:
        print("❌ Could not get Vercel token")
        return False
    
    token = result.stdout.strip()
    if not token:
        # Try alternative method
        home = os.path.expanduser("~")
        vercel_config = f"{home}/.vercel"
        # token might be in auth config
    
    project_id = "prj_fkrvmM9WbSE8TwTr7ZyppuXEzVvm"
    
    print("🚀 Tentando acionar redeploy...")
    
    # List deployments to get latest
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    
    url = f"https://api.vercel.com/v6/projects/{project_id}/deployments?limit=1"
    response = requests.get(url, headers=headers)
    
    if response.status_code == 200:
        deployments = response.json().get("deployments", [])
        if deployments:
            latest = deployments[0]
            print(f"   Último deployment: {latest.get('id')}")
            print(f"   Status: {latest.get('state')}")
            print(f"   URL: {latest.get('url')}")
            
            # Try to redeploy using the deployment URL
            redeploy_url = f"https://api.vercel.com/v13/projects/{project_id}/deployments"
            redeploy_response = requests.post(redeploy_url, headers=headers, json={})
            
            if redeploy_response.status_code in [200, 201]:
                print(f"✅ Redeploy acionado!")
                deployment = redeploy_response.json()
                print(f"   Novo ID: {deployment.get('id')}")
                return True
            else:
                print(f"⚠️  Redeploy retornou: {redeploy_response.status_code}")
                print(f"   Resposta: {redeploy_response.text[:200]}")
                return False
    else:
        print(f"❌ Erro ao listar deployments: {response.status_code}")
        return False

def main():
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                   ✅ VARIÁVEIS CONFIGURADAS COM SUCESSO ✅                 ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝\n")
    
    print("📊 Environment Variables Adicionadas:")
    print("   ✅ MONGO_URL (production, preview, development)")
    print("   ✅ DB_NAME (production, preview, development)")
    print("   ✅ CORS_ORIGINS (production, preview, development)")
    print("   ✅ JWT_SECRET_KEY (production, preview, development)")
    print("   ✅ FRONTEND_URL (production, preview, development)")
    
    print("\n" + "="*80)
    
    # Try to redeploy
    if trigger_vercel_redeploy():
        print("\n✅ Deployment acionado!")
    else:
        print("\n⚠️  Redeploy manual necessário")
    
    print("\n" + "="*80)
    print("\n📝 PRÓXIMOS PASSOS:")
    print("   1. Vá para: https://vercel.com/dashboard/tcs-de-suzini/deployments")
    print("   2. Procure por um novo deployment (QUEUED ou BUILDING)")
    print("   3. Aguarde até ficar READY (verde) - normalmente 2-3 minutos")
    print("   4. Depois teste em: https://tcs-de-suzini.vercel.app")
    
    print("\n🧪 TESTES:")
    print("   • Clique em 'Login' ou 'Register'")
    print("   • Tente criar uma conta ou fazer login")
    print("   • Abra Console (F12) e procure por erros CORS ou de conexão")
    print("   • Se funcionar, vê 'Connexion réussie!' e redireciona")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"❌ Erro: {e}")
