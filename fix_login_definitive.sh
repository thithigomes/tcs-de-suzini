#!/bin/bash

# Script para corrigir o problema de MongoDB e deployar definitivamente

echo "╔════════════════════════════════════════════════════════════╗"
echo "║      CORREÇÃO DEFINITIVA - PROBLEMA DE LOGIN              ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

echo "⚠️  PROBLEMA ENCONTRADO:"
echo "  MongoDB está configurado para localhost (NÃO funciona em produção)"
echo "  CORS_ORIGINS pode estar errado"
echo ""

echo "✅ SOLUÇÃO:"
echo ""
echo "Você tem 2 opções:"
echo ""
echo "OPÇÃO 1: Usar MongoDB Atlas (Recomendado - GRATUITO)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "1. Vá para: https://www.mongodb.com/cloud/atlas"
echo "2. Crie uma conta GRATUITA"
echo "3. Crie um cluster gratuito"
echo "4. Obtenha a connection string (será algo como):"
echo "   mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/volleyball_db"
echo ""
echo "OPÇÃO 2: Usar local (Apenas para testes, NÃO para produção)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Para testes locais apenas."
echo ""

read -p "Você quer usar MongoDB Atlas? (S/n): " use_atlas

if [[ "$use_atlas" == "s" || "$use_atlas" == "S" || "$use_atlas" == "" ]]; then
    read -p "Cole sua MongoDB Atlas connection string: " MONGO_URL
    
    if [ -z "$MONGO_URL" ]; then
        echo "❌ Connection string não fornecida. Abortando."
        exit 1
    fi
    
    echo ""
    echo "Atualizando .env com MongoDB Atlas..."
    
    # Atualizar no backend/.env
    sed -i "s|MONGO_URL=.*|MONGO_URL=$MONGO_URL|g" /home/ermak/tcs-voleyball/backend/.env
    sed -i "s|MONGO_URL=.*|MONGO_URL=$MONGO_URL|g" /home/ermak/tcs-voleyball/.env
    
    echo "✅ Arquivos .env atualizados!"
    echo ""
    
    # Fazer commit
    cd /home/ermak/tcs-voleyball
    git add .env backend/.env diagnose_login.py
    git commit -m "Fix: Update MongoDB URL to Atlas production database"
    git push
    
    echo "✅ Atualizado e pusheado no GitHub"
    echo ""
    echo "🚀 PRÓXIMOS PASSOS:"
    echo "1. Vá para Railway Dashboard"
    echo "2. Atualize a variável MONGO_URL com a connection string"
    echo "3. Redeploy o backend"
    echo "4. Teste o login em https://tcs-de-suzini.vercel.app"
    
else
    echo "Usando configuração local (teste apenas)"
fi
