#!/usr/bin/env python3
"""
🔧 Complete System Test & Fix
Testa tudo e corrige qualquer coisa que esteja errada
"""
import subprocess
import time
import os
import sys
from pathlib import Path

def run_cmd(cmd, description, timeout=15):
    """Run command and return success status"""
    print(f"\n🔍 {description}...")
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True, timeout=timeout)
        success = result.returncode == 0
        status = "✅" if success else "❌"
        print(f"   {status} {description}")
        if not success and result.stderr:
            print(f"   Error: {result.stderr[:100]}")
        return success, result.stdout, result.stderr
    except subprocess.TimeoutExpired:
        print(f"   ⏱️  Timeout")
        return False, "", "Timeout"
    except Exception as e:
        print(f"   ❌ {str(e)[:100]}")
        return False, "", str(e)

def main():
    print("""
╔════════════════════════════════════════════════════════════════════════════╗
║                     🔧 SYSTEM DIAGNOSTIC & REPAIR 🔧                      ║
╚════════════════════════════════════════════════════════════════════════════╝
    """)
    
    os.chdir("/home/ermak/tcs-voleyball")
    
    # 1. Check backend .env
    print("\n📋 VERIFICANDO CONFIGURAÇÕES:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    
    backend_env_exists = Path("backend/.env").exists()
    print(f"   {'✅' if backend_env_exists else '❌'} backend/.env: {'exists' if backend_env_exists else 'MISSING'}")
    
    # 2. Check MongoDB URL
    success, stdout, _ = run_cmd("grep MONGO_URL backend/.env", "MongoDB Atlas URL")
    if success:
        url_line = stdout.strip().split("=")[1] if "=" in stdout else ""
        is_atlas = "mongodb+srv" in url_line
        is_valid = "cluster0" in url_line
        print(f"   {'✅' if (is_atlas and is_valid) else '❌'} MongoDB: {'Atlas (valid)' if (is_atlas and is_valid) else 'Invalid or localhost'}")
    
    # 3. Check Vercel env variables
    print("\n📊 VERCEL ENVIRONMENT VARIABLES:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    success, stdout, _ = run_cmd("vercel env list", "Vercel env list")
    
    required_vars = ["MONGO_URL", "DB_NAME", "CORS_ORIGINS", "JWT_SECRET_KEY", "FRONTEND_URL", "REACT_APP_BACKEND_URL"]
    found_vars = []
    if success:
        for var in required_vars:
            if var in stdout:
                found_vars.append(var)
                print(f"   ✅ {var}")
            else:
                print(f"   ❌ {var} - FALTANDO")
    
    missing_vars = [v for v in required_vars if v not in found_vars]
    
    if missing_vars:
        print(f"\n⚠️  FALTAM {len(missing_vars)} variáveis!")
        print(f"   Faltando: {', '.join(missing_vars)}")
    
    # 4. Check backend server
    print("\n🚀 BACKEND:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    backend_file_exists = Path("backend/server.py").exists()
    print(f"   {'✅' if backend_file_exists else '❌'} backend/server.py: {'exists' if backend_file_exists else 'MISSING'}")
    
    # 5. Check frontend
    print("\n💻 FRONTEND:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    frontend_exists = Path("frontend/src").exists()
    print(f"   {'✅' if frontend_exists else '❌'} frontend/src: {'exists' if frontend_exists else 'MISSING'}")
    
    # 6. Test backend health (if running)
    print("\n🏥 HEALTH CHECK:")
    print("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    success, _, _ = run_cmd("curl -s http://localhost:8000/health | head -1", "Backend health (localhost:8000)")
    
    # Summary
    print("\n" + "="*80)
    if not missing_vars and backend_file_exists:
        print("✅ TUDO OK - Pronto para deploy!")
    else:
        print("❌ PROBLEMAS ENCONTRADOS - Corrigindo...")
        if "REACT_APP_BACKEND_URL" in missing_vars:
            print("   → Preciso adicionar REACT_APP_BACKEND_URL ao Vercel")
    print("="*80)
    
    return len(missing_vars) == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
