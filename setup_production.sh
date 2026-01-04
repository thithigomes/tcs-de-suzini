#!/bin/bash

# Script para configurar a produção automaticamente
# Atualiza REACT_APP_BACKEND_URL no Vercel e faz redeploy

set -e

echo "╔════════════════════════════════════════════════════════════╗"
echo "║    🚀 TCS VOLLEYBALL - SETUP AUTOMÁTICO DE PRODUÇÃO        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# URL do Railway
RAILWAY_URL="https://tcs-de-suzini-api-production-xxxx.railway.app"

echo "ℹ️  URL do Railway detectada: $RAILWAY_URL"
echo ""
echo "Para atualizar o Vercel automaticamente, preciso do seu token."
echo ""
echo "📝 Para obter o token Vercel:"
echo "   1. Vá para: https://vercel.com/account/tokens"
echo "   2. Crie um novo token (ou use um existente)"
echo "   3. Copie o token completo"
echo ""

read -p "Cole seu VERCEL_TOKEN aqui: " VERCEL_TOKEN

if [ -z "$VERCEL_TOKEN" ]; then
    echo "❌ Token não fornecido. Abortando..."
    exit 1
fi

echo ""
echo "Obtendo ID do projeto Vercel..."
echo ""

# Obter informações do projeto
PROJECT_INFO=$(curl -s -H "Authorization: Bearer $VERCEL_TOKEN" \
  "https://api.vercel.com/v9/projects" | grep -A 5 "tcs-de-suzini" | head -20)

if [ -z "$PROJECT_INFO" ]; then
    echo "❌ Projeto 'tcs-de-suzini' não encontrado."
    echo "   Verifique se o token é válido e o projeto existe."
    exit 1
fi

# Extrair ID do projeto
PROJECT_ID=$(echo "$PROJECT_INFO" | grep '"id"' | head -1 | cut -d'"' -f4)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Não foi possível obter o ID do projeto."
    exit 1
fi

echo "✅ Projeto encontrado: ID = $PROJECT_ID"
echo ""

# Atualizar variável de ambiente
echo "Atualizando variável REACT_APP_BACKEND_URL no Vercel..."
echo ""

# Deletar variável existente se houver
curl -s -X DELETE \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
  -d '{"key":"REACT_APP_BACKEND_URL"}' 2>/dev/null || true

sleep 1

# Criar nova variável
UPDATE_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v9/projects/$PROJECT_ID/env" \
  -d "{
    \"key\": \"REACT_APP_BACKEND_URL\",
    \"value\": \"$RAILWAY_URL\",
    \"type\": \"plain\",
    \"target\": [\"production\", \"preview\", \"development\"]
  }")

if echo "$UPDATE_RESPONSE" | grep -q "error"; then
    echo "❌ Erro ao atualizar variável:"
    echo "$UPDATE_RESPONSE"
    exit 1
fi

echo "✅ Variável REACT_APP_BACKEND_URL atualizada com sucesso!"
echo ""

# Triggerar novo deployment
echo "Acionando novo deployment no Vercel..."
echo ""

REDEPLOY_RESPONSE=$(curl -s -X POST \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  "https://api.vercel.com/v13/deployments" \
  -d "{
    \"projectId\": \"$PROJECT_ID\",
    \"gitMetadata\": {
      \"commitRef\": \"main\"
    }
  }")

DEPLOYMENT_ID=$(echo "$REDEPLOY_RESPONSE" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)

if [ -n "$DEPLOYMENT_ID" ]; then
    echo "✅ Novo deployment iniciado!"
    echo "   ID: $DEPLOYMENT_ID"
    echo ""
    echo "🔍 Você pode monitorar em:"
    echo "   https://vercel.com/dashboard/tcs-de-suzini/deployments"
    echo ""
else
    echo "⚠️  Deployment pode ter sido acionado, mas não consegui obter o ID."
fi

echo ""
echo "✅ CONFIGURAÇÃO COMPLETA!"
echo ""
echo "Próximos passos:"
echo "1. Aguarde ~2-3 minutos pelo deployment no Vercel"
echo "2. Vá para: https://tcs-de-suzini.vercel.app"
echo "3. Teste o login"
echo ""
echo "Se tudo funcionar, seu sistema estará 100% em produção! 🎉"
