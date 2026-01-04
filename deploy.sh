#!/bin/bash

echo "🚀 Iniciando deploy de TCS de Suzini..."

# Frontend Deploy
echo "📱 Deployando Frontend no Vercel..."
cd /home/ermak/tcs-voleyball/frontend
export VERCEL_PROJECT_NAME="tcs-de-suzini"

# Fazer build
npm run build

# Criar arquivo de instrução
echo "✅ Build do frontend concluído!"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo ""
echo "1️⃣  FRONTEND (Vercel) - GRÁTIS"
echo "   Acesse: https://vercel.com"
echo "   Faça login com GitHub"
echo "   Clique 'Add New' → 'Project'"
echo "   Selecione o repo 'tcs-voleyball'"
echo "   Deploy automático!"
echo ""
echo "2️⃣  BACKEND (Railway) - GRÁTIS"
echo "   Acesse: https://railway.app"
echo "   Faça login com GitHub"
echo "   Clique 'New Project' → 'Deploy from GitHub'"
echo "   Selecione 'tcs-voleyball'"
echo "   Aponte para pasta 'backend'"
echo ""
echo "3️⃣  CONFIGURAR VARIÁVEIS"
echo "   No Railway, em 'Variables':"
echo "   - MONGO_URL"
echo "   - JWT_SECRET_KEY"
echo "   - SMTP_EMAIL: thiago.gomes97300@gmail.com"
echo "   - SMTP_PASSWORD: ghqdlqybvcxcchnb"
echo "   - FRONTEND_URL: (sua URL Vercel)"
echo ""
echo "✨ Pronto! Seus sites estarão online!"
