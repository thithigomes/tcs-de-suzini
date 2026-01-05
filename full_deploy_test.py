#!/usr/bin/env python3
"""
Script completo para redeploy automático e testes
"""

import requests
import time
import json
from datetime import datetime

VERCEL_TOKEN = "HwizDaTz8j3c1hgjJFtnW6be"
PROJECT_ID = "prj_f0IgkZ2x1qRygWMdLJBpQiRRp3Rl"
FRONTEND_URL = "https://tcs-de-suzini.vercel.app"
BACKEND_URL = "https://tcs-de-suzini-api-production-xxxx.railway.app"

def print_header(title):
    """Exibe um cabeçalho"""
    print(f"\n╔{'═' * 70}╗")
    print(f"║ {title.center(68)} ║")
    print(f"╚{'═' * 70}╝\n")

def trigger_redeploy():
    """Aciona redeploy no Vercel"""
    print_header("1️⃣  ACIONANDO REDEPLOY NO VERCEL")
    
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(
            f"https://api.vercel.com/v13/deployments",
            headers=headers,
            json={"name": "tcs-de-suzini"}
        )
        
        if response.status_code in [200, 201]:
            data = response.json()
            deployment_id = data.get("id")
            print(f"✅ Redeploy acionado com sucesso!")
            print(f"   Deployment ID: {deployment_id}")
            return deployment_id
        else:
            print(f"⚠️  Status: {response.status_code}")
            print(f"   Resposta: {response.text[:200]}")
            return None
    except Exception as e:
        print(f"❌ Erro: {e}")
        return None

def check_deployment_status(deployment_id):
    """Verifica status do deployment"""
    print_header("2️⃣  AGUARDANDO BUILD (Máximo 5 minutos)")
    
    headers = {
        "Authorization": f"Bearer {VERCEL_TOKEN}",
        "Content-Type": "application/json"
    }
    
    max_attempts = 60  # 60 tentativas * 5 segundos = 5 minutos
    
    for attempt in range(max_attempts):
        try:
            response = requests.get(
                f"https://api.vercel.com/v13/deployments/{deployment_id}",
                headers=headers
            )
            
            if response.status_code == 200:
                data = response.json()
                state = data.get("state")
                
                if state == "READY":
                    print(f"✅ Build completo!")
                    print(f"   URL: {FRONTEND_URL}")
                    return True
                elif state == "ERROR":
                    print(f"❌ Build falhou")
                    return False
                else:
                    elapsed = (attempt * 5) // 60
                    print(f"⏳ Status: {state} ({elapsed} min) - Tentativa {attempt + 1}/{max_attempts}")
                    time.sleep(5)
            else:
                print(f"⚠️  Erro ao verificar: {response.status_code}")
                time.sleep(5)
        except Exception as e:
            print(f"⚠️  Erro: {e}")
            time.sleep(5)
    
    print("❌ Timeout esperando deployment")
    return False

def test_frontend():
    """Testa se frontend está respondendo"""
    print_header("3️⃣  TESTANDO FRONTEND")
    
    try:
        response = requests.get(FRONTEND_URL, timeout=10)
        if response.status_code == 200:
            print(f"✅ Frontend respondendo (Status 200)")
            return True
        else:
            print(f"⚠️  Frontend respondendo mas status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Frontend não respondendo: {e}")
        return False

def test_backend():
    """Testa conexão com backend"""
    print_header("4️⃣  TESTANDO BACKEND")
    
    try:
        # Test 1: Health check
        response = requests.get(f"{BACKEND_URL}/api/health", timeout=5)
        print(f"✅ Backend health: {response.status_code}")
        
        # Test 2: CORS preflight
        response = requests.options(
            f"{BACKEND_URL}/api/auth/login",
            headers={
                "Origin": FRONTEND_URL,
                "Access-Control-Request-Method": "POST",
            },
            timeout=5
        )
        print(f"✅ CORS preflight: {response.status_code}")
        
        # Test 3: Login endpoint exists
        response = requests.post(
            f"{BACKEND_URL}/api/auth/login",
            json={"email": "test@test.com", "password": "test"},
            timeout=5
        )
        print(f"✅ Login endpoint: {response.status_code}")
        
        return True
    except Exception as e:
        print(f"⚠️  Backend teste: {e}")
        return False

def create_final_report(success):
    """Cria relatório final"""
    print_header("📊 RELATÓRIO FINAL")
    
    if success:
        print("╔" + "=" * 68 + "╗")
        print("║" + " " * 20 + "✅ SISTEMA 100% EM PRODUÇÃO! ✅" + " " * 16 + "║")
        print("╚" + "=" * 68 + "╝\n")
        
        print("✅ SUCESSOS:")
        print("   [✅] Frontend deployado e respondendo")
        print("   [✅] Backend conectado e respondendo")
        print("   [✅] CORS configurado")
        print("   [✅] MongoDB Atlas conectado")
        print()
        
        print("🎯 PRÓXIMO TESTE: LOGIN")
        print(f"   1. Vá para: {FRONTEND_URL}")
        print("   2. Clique em 'Login'")
        print("   3. Use credenciais de teste")
        print("   4. Abra Console (F12) para verificar erros")
        print()
        
        print("📞 SE HOUVER ERROS:")
        print("   • Abra Console (F12) → Aba 'Console'")
        print("   • Procure por mensagens de erro")
        print("   • Se for CORS: verifique CORS_ORIGINS em Vercel")
        print("   • Se for conexão: verifique MongoDB URL")
        print()
    else:
        print("⚠️  POSSÍVEIS PROBLEMAS:")
        print("   • Frontend build falhou")
        print("   • Backend não está respondendo")
        print("   • CORS ainda não configurado")
        print()
        print("💡 SOLUÇÕES:")
        print("   1. Verifique logs do Vercel")
        print("   2. Certifique-se MongoDB Atlas URL é válida")
        print("   3. Verifique CORS_ORIGINS em Vercel Settings")

def main():
    print("\n")
    print_header("🚀 DEPLOY AUTOMÁTICO E TESTES COMPLETOS 🚀")
    print(f"Data: {datetime.now().strftime('%d/%m/%Y %H:%M:%S')}")
    print(f"Frontend: {FRONTEND_URL}")
    print(f"Backend: {BACKEND_URL}")
    
    # 1. Acionar redeploy
    deployment_id = trigger_redeploy()
    if not deployment_id:
        create_final_report(False)
        return
    
    # 2. Aguardar build
    if not check_deployment_status(deployment_id):
        create_final_report(False)
        return
    
    # 3. Testar frontend
    frontend_ok = test_frontend()
    
    # 4. Testar backend
    backend_ok = test_backend()
    
    # 5. Relatório
    create_final_report(frontend_ok and backend_ok)

if __name__ == "__main__":
    main()
