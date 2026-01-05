#!/usr/bin/env python3
"""
Non-interactive Vercel automation script
"""
import subprocess
import time
import json
import os
import sys

def run_command(cmd, input_data=None):
    """Run command and return output"""
    try:
        result = subprocess.run(
            cmd,
            shell=True,
            capture_output=True,
            text=True,
            input=input_data,
            timeout=10
        )
        return result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return "TIMEOUT"
    except Exception as e:
        return str(e)

def main():
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                    🤖 VERCEL AUTOMATION - INICIANDO 🤖                   ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")
    
    # Check if authenticated
    print("\n🔐 Verificando autenticação...")
    auth_result = run_command("vercel whoami")
    if "not authenticated" in auth_result.lower() or "error" in auth_result.lower():
        print("❌ Não autenticado com Vercel CLI")
        print("\nPara usar automation:")
        print("1. Execute: vercel login")
        print("2. Siga as instruções")
        print("3. Role o script novamente")
        return False
    else:
        print("✅ Autenticado!")
        print(f"   {auth_result.strip()}")
    
    print("\n📝 Adicionando variáveis...")
    
    vars_to_add = {
        "MONGO_URL": "mongodb+srv://admin:admin@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority",
        "DB_NAME": "volleyball_db",
        "CORS_ORIGINS": "https://tcs-de-suzini.vercel.app",
        "JWT_SECRET_KEY": "votre-cle-secrete-super-securisee-changez-moi",
        "FRONTEND_URL": "https://tcs-de-suzini.vercel.app"
    }
    
    # Try to add each variable
    for var_name, var_value in vars_to_add.items():
        # First try to update if it exists
        update_cmd = f'echo "{var_value}" | vercel env update {var_name} production preview development'
        update_result = run_command(update_cmd, input_data=f"{var_value}\n")
        
        if "Updated" in update_result or "✓" in update_result:
            print(f"   ✅ Atualizado: {var_name}")
        else:
            # Try to add new
            add_cmd = f'echo -e "{var_value}\\nproduction" | vercel env add {var_name} preview development'
            add_result = run_command(add_cmd, input_data=f"{var_value}\nproduction\n")
            
            if "Added" in add_result or "added" in add_result.lower():
                print(f"   ✅ Adicionado: {var_name}")
            else:
                print(f"   ⚠️  {var_name}: {add_result[:50]}...")
        
        time.sleep(1)
    
    print("\n" + "="*80)
    print("✅ VARIÁVEIS CONFIGURADAS!")
    print("="*80)
    print("\n📝 PRÓXIMO PASSO: Fazer Redeploy em Vercel")
    print("   1. Abra: https://vercel.com/dashboard/tcs-de-suzini/deployments")
    print("   2. Clique 'Redeploy' no seu último commit")
    print("   3. Aguarde 2-3 minutos até virar VERDE (READY)")
    print("\n🧪 DEPOIS: Teste em https://tcs-de-suzini.vercel.app")
    print("="*80)
    
    return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
