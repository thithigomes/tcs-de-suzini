#!/bin/bash
# 🤖 Complete Vercel Automation using CLI

PROJECT="tcs-de-suzini"

echo "╔════════════════════════════════════════════════════════════════════════════╗"
echo "║                    🤖 VERCEL AUTOMATION - INICIANDO 🤖                   ║"
echo "╚════════════════════════════════════════════════════════════════════════════╝"

# Step 1: Delete old environment variables
echo ""
echo "🗑️  DELETANDO variáveis antigas..."

VARS_TO_DELETE=("MONGO_URL" "DB_NAME" "CORS_ORIGINS" "JWT_SECRET_KEY" "FRONTEND_URL")

for var in "${VARS_TO_DELETE[@]}"; do
    if vercel env remove "$var" production preview development --yes 2>&1 | grep -q "Removed"; then
        echo "   ✅ Deletado: $var"
    else
        echo "   ℹ️  $var (não encontrado ou já removido)"
    fi
    sleep 1
done

echo ""
echo "🆕 ADICIONANDO novas variáveis..."

# Step 2: Add new environment variables
echo -e "mongodb+srv://admin:admin@cluster0.mongodb.net/volleyball_db?retryWrites=true&w=majority\nproduction, preview, development" | vercel env add MONGO_URL 2>/dev/null && echo "   ✅ MONGO_URL adicionado" || echo "   ⚠️  MONGO_URL (erro ao adicionar)"

echo -e "volleyball_db\nproduction, preview, development" | vercel env add DB_NAME 2>/dev/null && echo "   ✅ DB_NAME adicionado" || echo "   ⚠️  DB_NAME (erro ao adicionar)"

echo -e "https://tcs-de-suzini.vercel.app\nproduction, preview, development" | vercel env add CORS_ORIGINS 2>/dev/null && echo "   ✅ CORS_ORIGINS adicionado" || echo "   ⚠️  CORS_ORIGINS (erro ao adicionar)"

echo -e "votre-cle-secrete-super-securisee-changez-moi\nproduction, preview, development" | vercel env add JWT_SECRET_KEY 2>/dev/null && echo "   ✅ JWT_SECRET_KEY adicionado" || echo "   ⚠️  JWT_SECRET_KEY (erro ao adicionar)"

echo -e "https://tcs-de-suzini.vercel.app\nproduction, preview, development" | vercel env add FRONTEND_URL 2>/dev/null && echo "   ✅ FRONTEND_URL adicionado" || echo "   ⚠️  FRONTEND_URL (erro ao adicionar)"

echo ""
echo "✅ Variáveis configuradas!"
echo ""
echo "📝 PRÓXIMO PASSO: Redeploy"
echo "   1. Vá para: https://vercel.com/dashboard/$PROJECT/deployments"
echo "   2. Clique em 'Redeploy' no seu commit mais recente"
echo "   3. Aguarde 2-3 minutos até virar VERDE (READY)"
echo ""
echo "🧪 DEPOIS: Teste em https://tcs-de-suzini.vercel.app"
echo ""
