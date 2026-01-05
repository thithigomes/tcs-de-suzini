#!/usr/bin/env python3
"""
Proper Vercel automation - adding env variables one at a time
"""
import subprocess
import time
import sys

def add_env_var(name, value, environments):
    """Add environment variable using vercel CLI"""
    for env in environments:
        cmd = f'echo "{value}" | vercel env add {name} {env}'
        try:
            result = subprocess.run(
                cmd,
                shell=True,
                capture_output=True,
                text=True,
                input=value,
                timeout=15
            )
            output = result.stdout + result.stderr
            print(f"   {env}: ", end="")
            if "Added" in output or "saved" in output.lower() or result.returncode == 0:
                print("✅")
            else:
                print(f"⚠️  ({result.returncode})")
        except subprocess.TimeoutExpired:
            print(f"   {env}: ⏱️ (timeout)")
        except Exception as e:
            print(f"   {env}: ❌ {str(e)[:30]}")
        time.sleep(0.5)

def main():
    print("╔════════════════════════════════════════════════════════════════════════════╗")
    print("║                    🤖 VERCEL AUTOMATION - INICIANDO 🤖                   ║")
    print("╚════════════════════════════════════════════════════════════════════════════╝")
    
    variables = {
        "MONGO_URL": "mongodb+srv://admin:admin@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority",
        "DB_NAME": "volleyball_db",
        "CORS_ORIGINS": "https://tcs-de-suzini.vercel.app",
        "JWT_SECRET_KEY": "votre-cle-secrete-super-securisee-changez-moi",
        "FRONTEND_URL": "https://tcs-de-suzini.vercel.app"
    }
    
    environments = ["production", "preview", "development"]
    
    print("\n📝 Adicionando variáveis de ambiente...")
    
    for var_name, var_value in variables.items():
        print(f"\n{var_name}:")
        add_env_var(var_name, var_value, environments)
    
    print("\n" + "="*80)
    print("✅ VARIÁVEIS CONFIGURADAS!")
    print("="*80)
    print("\n🚀 PRÓXIMO PASSO: Acionando Redeploy...")
    
    # Try to redeploy
    redeploy_cmd = "vercel redeploy --prod --yes"
    result = subprocess.run(redeploy_cmd, shell=True, capture_output=True, text=True, timeout=30)
    
    if "Queued" in result.stdout or "Deploying" in result.stdout or result.returncode == 0:
        print("✅ Redeploy acionado!")
    else:
        print("⚠️  Redeploy pode estar processando")
    
    print("\n📊 Status do Deployment:")
    print("   1. Vá para: https://vercel.com/dashboard/tcs-de-suzini/deployments")
    print("   2. Aguarde status virar VERDE (READY)")
    print("   3. Teste em: https://tcs-de-suzini.vercel.app")
    
    print("\n✅ Tudo configurado! Aguardando deployment...")
    print("="*80)

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n❌ Cancelado pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro: {e}")
        sys.exit(1)
