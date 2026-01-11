#!/bin/bash

echo "🚀 Iniciando Volleyball App..."

# Matar processos antigos
pkill -f "uvicorn\|npm start\|craco start" || true
sleep 2

# Iniciar backend
echo "📍 Iniciando Backend na porta 8000..."
cd /home/ermak/tcs-voleyball/backend
source ../.venv/bin/activate
nohup python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "✓ Backend PID: $BACKEND_PID"

sleep 3

# Verificar se backend iniciou
if curl -s http://localhost:8000/api/training-schedule > /dev/null 2>&1; then
    echo "✓ Backend respondendo!"
else
    echo "✗ Backend não respondeu"
    tail -20 /tmp/backend.log
    exit 1
fi

# Iniciar frontend
echo "📍 Iniciando Frontend na porta 3000..."
cd /home/ermak/tcs-voleyball/frontend
export REACT_APP_BACKEND_URL="http://localhost:8000"
export PORT=3000
nohup npm start > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✓ Frontend PID: $FRONTEND_PID"

sleep 10

echo ""
echo "✅ APP INICIADO COM SUCESSO!"
echo ""
echo "Backend:  http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo "📝 Logs:"
echo "  Backend:  tail -f /tmp/backend.log"
echo "  Frontend: tail -f /tmp/frontend.log"
echo ""
echo "Para parar tudo: pkill -f 'uvicorn\|npm start'"
