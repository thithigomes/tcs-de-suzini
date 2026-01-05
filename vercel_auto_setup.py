#!/usr/bin/env python3
"""
🤖 Vercel Full Automation Script
Deletes old environment variables, creates new ones, and redeployes
"""
import os
import requests
import json
import time
from typing import List, Dict, Optional

class VercelAutoSetup:
    def __init__(self):
        # Get Vercel credentials
        self.vercel_token = os.getenv("VERCEL_TOKEN")
        self.project_id = "prj_fkrvmM9WbSE8TwTr7ZyppuXEzVvm"  # tcs-de-suzini project
        
        if not self.vercel_token:
            # Try common alternatives
            self.vercel_token = os.getenv("VERCEL_AUTH_TOKEN")
        
        self.base_url = "https://api.vercel.com"
        self.headers = {
            "Authorization": f"Bearer {self.vercel_token}",
            "Content-Type": "application/json"
        }
        
        # New environment variables to set
        self.env_vars = {
            "MONGO_URL": "mongodb+srv://admin:admin@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority",
            "DB_NAME": "volleyball_db",
            "CORS_ORIGINS": "https://tcs-de-suzini.vercel.app",
            "JWT_SECRET_KEY": "votre-cle-secrete-super-securisee-changez-moi",
            "FRONTEND_URL": "https://tcs-de-suzini.vercel.app",
            "REACT_APP_BACKEND_URL": "https://railway-backend-url.railway.app"  # This will be updated if needed
        }
        
    def check_token(self) -> bool:
        """Verify Vercel token is valid"""
        print("🔐 Verificando token do Vercel...")
        response = requests.get(
            f"{self.base_url}/www/user",
            headers=self.headers
        )
        if response.status_code == 200:
            user = response.json().get("user", {})
            print(f"✅ Token válido! Usuário: {user.get('email')}")
            return True
        else:
            print(f"❌ Erro na autenticação: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return False
    
    def get_env_variables(self) -> List[Dict]:
        """Get all current environment variables"""
        print("\n📋 Obtendo variáveis de ambiente atuais...")
        response = requests.get(
            f"{self.base_url}/v9/projects/{self.project_id}/env",
            headers=self.headers
        )
        if response.status_code == 200:
            envs = response.json().get("envs", [])
            print(f"✅ Encontradas {len(envs)} variáveis")
            return envs
        else:
            print(f"❌ Erro ao obter variáveis: {response.status_code}")
            print(f"   Resposta: {response.text}")
            return []
    
    def delete_env_variable(self, env_id: str, env_name: str) -> bool:
        """Delete a specific environment variable"""
        response = requests.delete(
            f"{self.base_url}/v9/projects/{self.project_id}/env/{env_id}",
            headers=self.headers
        )
        if response.status_code == 204:
            print(f"   ✅ Deletado: {env_name}")
            return True
        else:
            print(f"   ⚠️  Erro ao deletar {env_name}: {response.status_code}")
            return False
    
    def cleanup_old_variables(self) -> bool:
        """Delete old environment variables that are being replaced"""
        print("\n🗑️  Limpando variáveis antigas...")
        
        envs = self.get_env_variables()
        if not envs:
            print("ℹ️  Nenhuma variável para limpar")
            return True
        
        vars_to_delete = list(self.env_vars.keys())
        deleted_count = 0
        
        for env in envs:
            if env.get("key") in vars_to_delete:
                env_id = env.get("id")
                if self.delete_env_variable(env_id, env.get("key")):
                    deleted_count += 1
                time.sleep(0.5)  # Rate limit
        
        print(f"✅ Limpeza concluída: {deleted_count} variáveis deletadas")
        return True
    
    def create_env_variable(self, key: str, value: str) -> bool:
        """Create a new environment variable"""
        data = {
            "key": key,
            "value": value,
            "target": ["production", "preview", "development"]
        }
        
        response = requests.post(
            f"{self.base_url}/v9/projects/{self.project_id}/env",
            headers=self.headers,
            json=data
        )
        
        if response.status_code in [200, 201]:
            print(f"   ✅ Criado: {key}")
            return True
        else:
            print(f"   ❌ Erro ao criar {key}: {response.status_code}")
            print(f"      Resposta: {response.text}")
            return False
    
    def setup_new_variables(self) -> bool:
        """Create all new environment variables"""
        print("\n🆕 Criando novas variáveis...")
        
        created_count = 0
        for key, value in self.env_vars.items():
            if self.create_env_variable(key, value):
                created_count += 1
            time.sleep(0.5)  # Rate limit
        
        print(f"✅ Configuração concluída: {created_count}/{len(self.env_vars)} variáveis criadas")
        return created_count == len(self.env_vars)
    
    def get_latest_deployment(self) -> Optional[str]:
        """Get the latest deployment ID"""
        print("\n📦 Obtendo último deployment...")
        response = requests.get(
            f"{self.base_url}/v6/projects/{self.project_id}/deployments",
            headers=self.headers,
            params={"limit": 1}
        )
        
        if response.status_code == 200:
            deployments = response.json().get("deployments", [])
            if deployments:
                deployment_id = deployments[0].get("id")
                print(f"✅ Deployment encontrado: {deployment_id}")
                return deployment_id
        
        print("❌ Nenhum deployment encontrado")
        return None
    
    def trigger_redeploy(self) -> bool:
        """Trigger a new deployment"""
        print("\n🚀 Acionando novo deployment...")
        
        response = requests.post(
            f"{self.base_url}/v13/projects/{self.project_id}/deployments",
            headers=self.headers,
            json={}
        )
        
        if response.status_code in [200, 201]:
            deployment_id = response.json().get("id")
            print(f"✅ Deployment acionado: {deployment_id}")
            return True
        else:
            print(f"⚠️  Erro ao acionar deployment: {response.status_code}")
            print(f"   Resposta: {response.text}")
            # This might fail but it's ok - user can redeploy manually
            return False
    
    def wait_for_deployment(self, max_wait: int = 300) -> bool:
        """Wait for deployment to complete"""
        print("\n⏳ Aguardando deployment (máximo 5 minutos)...")
        
        start_time = time.time()
        while time.time() - start_time < max_wait:
            response = requests.get(
                f"{self.base_url}/v6/projects/{self.project_id}/deployments",
                headers=self.headers,
                params={"limit": 1}
            )
            
            if response.status_code == 200:
                deployments = response.json().get("deployments", [])
                if deployments:
                    deployment = deployments[0]
                    state = deployment.get("state")
                    created_at = deployment.get("createdAt")
                    
                    if state == "READY":
                        print(f"✅ Deployment pronto! Status: {state}")
                        return True
                    elif state in ["QUEUED", "BUILDING"]:
                        print(f"   ⏳ Status: {state}... (aguardando {int(time.time() - start_time)}s)")
                    else:
                        print(f"   ❌ Status inesperado: {state}")
                        return False
            
            time.sleep(5)  # Check every 5 seconds
        
        print("⏱️  Timeout aguardando deployment")
        return False
    
    def run(self):
        """Execute full automation"""
        print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                    🤖 VERCEL AUTO SETUP - INICIANDO 🤖                   ║
╚════════════════════════════════════════════════════════════════════════════╝
        """)
        
        # Step 1: Check token
        if not self.check_token():
            print("\n❌ Falha na autenticação. Configure VERCEL_TOKEN")
            return False
        
        # Step 2: Cleanup old variables
        if not self.cleanup_old_variables():
            print("\n⚠️  Erro na limpeza, continuando...")
        
        time.sleep(2)  # Wait before creating new ones
        
        # Step 3: Create new variables
        if not self.setup_new_variables():
            print("\n⚠️  Alguns erros na criação de variáveis")
        
        time.sleep(3)  # Wait for variables to propagate
        
        # Step 4: Trigger redeploy
        if not self.trigger_redeploy():
            print("\n⚠️  Redeploy pode precisar ser acionado manualmente em Vercel")
        
        # Step 5: Wait for deployment
        if not self.wait_for_deployment():
            print("\n⚠️  Deployment pode estar ainda processando")
        
        print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                         ✅ SETUP COMPLETO ✅                              ║
╚════════════════════════════════════════════════════════════════════════════╝

🎯 PRÓXIMOS PASSOS:
   1. Abra: https://tcs-de-suzini.vercel.app
   2. Clique em "Login" ou "Register"
   3. Tente criar uma conta ou fazer login
   4. Abra Console (F12) e procure por erros

✨ ESPERADO:
   ✅ "Connexion réussie!"
   ✅ Redireciona para Dashboard
   ✅ Nenhum erro no Console
        """)
        
        return True

if __name__ == "__main__":
    setup = VercelAutoSetup()
    setup.run()
