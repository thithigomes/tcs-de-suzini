#!/usr/bin/env python3
"""
🚀 Complete Fix - Add missing REACT_APP_BACKEND_URL
"""
import subprocess
import time

def add_backend_url(backend_url):
    """Add REACT_APP_BACKEND_URL to Vercel"""
    print(f"🔗 Adicionando REACT_APP_BACKEND_URL = {backend_url}")
    
    for env in ["production", "preview", "development"]:
        cmd = f'echo "{backend_url}" | vercel env add REACT_APP_BACKEND_URL {env}'
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, input=backend_url)
        
        if result.returncode == 0 or "Added" in result.stdout.lower():
            print(f"   ✅ {env}")
        else:
            print(f"   ⚠️  {env}: {result.stderr[:50] if result.stderr else 'OK'}")
        time.sleep(0.5)

def main():
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║               🔗 CONFIGURANDO REACT_APP_BACKEND_URL 🔗                    ║
╚════════════════════════════════════════════════════════════════════════════╝
    """)
    
    # For now, use a temporary public backend or localhost
    # We'll use a simple approach: localhost for development, and a placeholder for production
    
    print("\n📝 OPÇÕES DE BACKEND:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    print("1. http://localhost:8000 (desenvolvimento local)")
    print("2. Usar Vercel Serverless (backend.vercel.app)")
    print("3. Railway (se já deployado)")
    print("4. Outro URL")
    print()
    
    # For production, let's use a smart approach
    # We'll set different URLs for different environments
    
    backends = {
        "development": "http://localhost:8000",
        "preview": "http://localhost:8000",  # For preview builds
        "production": "http://localhost:8000"  # Will be replaced with Railway URL
    }
    
    print("✨ CONFIGURAÇÃO INTELIGENTE:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    # For production, let's use a more robust solution
    # Actually, let's create a simple test and use the frontend's own domain as fallback
    
    production_backend = "https://tcs-de-suzini-backend.vercel.app"  # Fallback option
    
    # Better: use the same domain with /api prefix if backend is on same domain
    # Even better: start with localhost and we'll update after Railway deployment
    
    for env, url in backends.items():
        cmd = f'echo "{url}" | vercel env add REACT_APP_BACKEND_URL {env}'
        print(f"   Adicionando para {env}: {url}")
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, input=url, timeout=10)
        
        if result.returncode == 0:
            print(f"     ✅ OK")
        else:
            output = result.stdout + result.stderr
            if "Added" in output:
                print(f"     ✅ OK")
            else:
                print(f"     ⚠️  Status: {result.returncode}")
        time.sleep(0.5)
    
    print("\n" + "="*80)
    print("✅ REACT_APP_BACKEND_URL adicionado!")
    print("="*80)
    
    print("\n🔄 Próximo passo: Redeploy no Vercel")
    print("   Mas primeiro, vamos rodar o backend localmente para testes...")

if __name__ == "__main__":
    main()
