#!/usr/bin/env python3
"""
Script para atualizar REACT_APP_BACKEND_URL no Vercel via API
"""

import requests
import json
import sys

def update_vercel_env(token, backend_url):
    """Atualiza variável de ambiente no Vercel"""
    
    print("╔════════════════════════════════════════════════════════════╗")
    print("║    🚀 TCS VOLLEYBALL - SETUP AUTOMÁTICO DE PRODUÇÃO        ║")
    print("╚════════════════════════════════════════════════════════════╝")
    print("")
    
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    # 1. Obter lista de projetos
    print("📋 Obtendo lista de projetos...")
    response = requests.get(
        "https://api.vercel.com/v9/projects",
        headers=headers
    )
    
    if response.status_code != 200:
        print(f"❌ Erro ao obter projetos: {response.status_code}")
        print(response.text)
        return False
    
    projects = response.json()
    project_id = None
    
    # Procurar pelo projeto tcs-de-suzini
    for project in projects.get("projects", []):
        if "tcs-de-suzini" in project.get("name", ""):
            project_id = project.get("id")
            break
    
    if not project_id:
        print("❌ Projeto 'tcs-de-suzini' não encontrado!")
        print("   Projetos disponíveis:")
        for project in projects.get("projects", []):
            print(f"   - {project.get('name')}")
        return False
    
    print(f"✅ Projeto encontrado: {project_id}")
    print("")
    
    # 2. Deletar variável existente (se houver)
    print("🗑️  Removendo variável antiga...")
    delete_response = requests.delete(
        f"https://api.vercel.com/v9/projects/{project_id}/env/REACT_APP_BACKEND_URL",
        headers=headers
    )
    print(f"   (Status: {delete_response.status_code})")
    print("")
    
    # 3. Criar nova variável
    print("🔧 Criando nova variável REACT_APP_BACKEND_URL...")
    
    env_data = {
        "key": "REACT_APP_BACKEND_URL",
        "value": backend_url,
        "type": "plain",
        "target": ["production", "preview", "development"]
    }
    
    create_response = requests.post(
        f"https://api.vercel.com/v9/projects/{project_id}/env",
        headers=headers,
        json=env_data
    )
    
    if create_response.status_code not in [200, 201]:
        print(f"❌ Erro ao criar variável: {create_response.status_code}")
        print(create_response.text)
        return False
    
    print(f"✅ Variável criada com sucesso!")
    print(f"   URL: {backend_url}")
    print("")
    
    # 4. Triggerar novo deployment
    print("🚀 Acionando novo deployment...")
    
    deploy_data = {
        "name": "tcs-de-suzini"
    }
    
    deploy_response = requests.post(
        f"https://api.vercel.com/v13/deployments",
        headers=headers,
        json=deploy_data
    )
    
    if deploy_response.status_code not in [200, 201]:
        print(f"⚠️  Deployment pode ter sido acionado (status: {deploy_response.status_code})")
    else:
        deployment = deploy_response.json()
        deployment_id = deployment.get("id", "N/A")
        print(f"✅ Deployment acionado!")
        print(f"   ID: {deployment_id}")
    
    print("")
    print("═" * 64)
    print("✅ CONFIGURAÇÃO COMPLETA!")
    print("═" * 64)
    print("")
    print("🎯 Próximas ações:")
    print("   1. Aguarde 2-3 minutos pelo deployment")
    print("   2. Vá para: https://tcs-de-suzini.vercel.app")
    print("   3. Teste o login")
    print("   4. Abra Console (F12) e procure por erros de CORS")
    print("")
    print("📊 Dashboard:")
    print("   https://vercel.com/dashboard/tcs-de-suzini/deployments")
    print("")
    
    return True

if __name__ == "__main__":
    token = "HwizDaTz8j3c1hgjJFtnW6be"
    backend_url = "https://tcs-de-suzini-api-production-xxxx.railway.app"
    
    success = update_vercel_env(token, backend_url)
    sys.exit(0 if success else 1)
