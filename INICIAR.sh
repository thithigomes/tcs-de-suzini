#!/bin/bash

# 🚀 INICIAR VOLLEYBALL APP - VERSÃO FINAL
# Este script inicia o backend e frontend corretamente

set -e

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║       🏐 TCS VOLLEYBALL - INICIANDO APP 🏐         ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parar processos antigos
echo -e "${YELLOW}⏹  Parando processos antigos...${NC}"
pkill -9 -f "uvicorn|craco|npm start" 2>/dev/null || true
sleep 2

# Backend
echo -e "${BLUE}🔧 Backend:${NC}"
echo "   Iniciando em http://localhost:8000"
cd /home/ermak/tcs-voleyball/backend
source ../.venv/bin/activate
nohup python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "   ${GREEN}✓ PID: $BACKEND_PID${NC}"

sleep 4

# Verificar backend
if curl -s http://localhost:8000/api/training-schedule > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Backend respondendo${NC}"
else
    echo -e "   ${YELLOW}⚠ Backend pode estar iniciando ainda...${NC}"
fi

# Frontend
echo -e "${BLUE}🎨 Frontend:${NC}"
echo "   Iniciando em http://localhost:3000"
cd /home/ermak/tcs-voleyball/frontend
export GENERATE_SOURCEMAP=false
export PORT=3000
export REACT_APP_BACKEND_URL=http://localhost:8000
nohup npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "   ${GREEN}✓ PID: $FRONTEND_PID${NC}"
echo -e "   ${YELLOW}Aguardando compilação (30-40s)...${NC}"

sleep 30

# Verificar frontend
if curl -s http://localhost:3000 > /dev/null 2>&1; then
    echo -e "   ${GREEN}✓ Frontend respondendo${NC}"
fi

echo ""
echo "╔════════════════════════════════════════════════════╗"
echo "║              ✅ APP INICIADO COM SUCESSO          ║"
echo "╚════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}URLs:${NC}"
echo "   📱 Frontend:  http://localhost:3000"
echo "   🔌 Backend:   http://localhost:8000"
echo "   📡 API:       http://localhost:8000/api"
echo ""
echo -e "${GREEN}Para ver logs:${NC}"
echo "   Backend:  tail -f /tmp/backend.log"
echo "   Frontend: tail -f /tmp/frontend.log"
echo ""
echo -e "${GREEN}Para parar tudo:${NC}"
echo "   pkill -9 -f 'uvicorn|craco|npm'"
echo ""
echo "🎉 Aproveite!"
echo ""
