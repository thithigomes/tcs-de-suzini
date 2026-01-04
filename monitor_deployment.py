#!/usr/bin/env python3
"""
Monitor script para verificar o deployment no Railway
Uso: python monitor_deployment.py <seu-railway-project-url>
"""

import subprocess
import time
import sys

def check_backend_health(url):
    """Verifica se o backend está respondendo"""
    try:
        result = subprocess.run(
            ['curl', '-s', '-o', '/dev/null', '-w', '%{http_code}', f'{url}/docs'],
            timeout=5,
            capture_output=True
        )
        status = result.stdout.decode().strip()
        return status == '200'
    except Exception as e:
        return False

def main():
    if len(sys.argv) < 2:
        print("❌ Uso: python monitor_deployment.py <backend-url>")
        print("   Exemplo: python monitor_deployment.py https://tcs-de-suzini-api-production-xxxx.railway.app")
        sys.exit(1)
    
    backend_url = sys.argv[1].rstrip('/')
    print(f"🔍 Monitorando deployment: {backend_url}")
    print("Aguardando 5 minutos ou até conexão bem-sucedida...\n")
    
    attempts = 0
    max_attempts = 60  # 60 tentativas * 5 segundos = 5 minutos
    
    while attempts < max_attempts:
        attempts += 1
        elapsed = (attempts * 5) // 60
        
        if check_backend_health(backend_url):
            print(f"\n✅ Backend está online! ({elapsed} minutos)")
            print(f"🎉 URL do backend pronto: {backend_url}")
            print("\nPróximas ações:")
            print("1. Copie esta URL: " + backend_url)
            print("2. Vá para https://vercel.com/dashboard")
            print("3. Selecione o projeto 'tcs-de-suzini'")
            print("4. Settings → Environment Variables")
            print("5. Adicione: REACT_APP_BACKEND_URL = " + backend_url)
            print("6. Redeploy no Vercel")
            return 0
        
        print(f"⏳ Tentativa {attempts}/{max_attempts} ({elapsed} min)... ", end='', flush=True)
        try:
            time.sleep(5)
            print("aguardando")
        except KeyboardInterrupt:
            print("\n\n⛔ Monitoramento interrompido")
            return 1
    
    print(f"\n❌ Timeout após 5 minutos. Backend ainda não respondendo.")
    print("\nVerifique:")
    print("1. Se o build no Railway completou")
    print("2. Se há erros nos logs: Railway Dashboard → Logs")
    print("3. Se a URL está correta")
    return 1

if __name__ == '__main__':
    sys.exit(main())
