# 🚀 Deployment Guide - TCS de Suzini

## 1️⃣ Deploy Backend em Railway

### Passo 1: Criar conta no Railway
1. Vá para https://railway.app
2. Clique em "Sign up" 
3. Conecte com GitHub (use sua conta thithigomes)

### Passo 2: Deploy do Backend
1. No Railway dashboard, clique em "+ New Project"
2. Selecione "Deploy from GitHub"
3. Authorize Railway em seu GitHub
4. Selecione o repositório: `tcs-de-suzini`
5. Configure o Dockerfile:
   - Railway deve detectar automaticamente o `Dockerfile` na raiz
   - Se não, especifique: `Dockerfile`

### Passo 3: Configurar Variáveis de Ambiente
1. No projeto Railway, vá para "Variables"
2. Adicione as seguintes variáveis (do seu `.env`):
   ```
   MONGO_URL=mongodb://localhost:27017
   DB_NAME=volleyball_db
   JWT_SECRET_KEY=sua-chave-secreta
   SMTP_SERVER=smtp.gmail.com
   SMTP_PORT=587
   SMTP_EMAIL=thiago.gomes97300@gmail.com
   SMTP_PASSWORD=seu-app-password
   FRONTEND_URL=https://tcs-de-suzini.vercel.app
   CORS_ORIGINS=https://tcs-de-suzini.vercel.app
   ```

### Passo 4: Copiar URL do Backend
1. Após deploy bem-sucedido, Railway fornecerá uma URL (ex: `https://tcs-de-suzini-api.railway.app`)
2. **Copie esta URL!** Você precisará dela no próximo passo

---

## 2️⃣ Configurar Frontend no Vercel

### Passo 1: Adicionar Environment Variable
1. Vá para https://vercel.com/dashboard
2. Selecione o projeto `tcs-de-suzini`
3. Clique em "Settings" → "Environment Variables"
4. Clique em "Add New"
   - **Name:** `REACT_APP_BACKEND_URL`
   - **Value:** Cole a URL do Railway (ex: `https://tcs-de-suzini-api.railway.app`)
   - **Select Environments:** Production, Preview, Development
5. Clique "Save"

### Passo 2: Forçar Redeploy
1. Vercel fará rebuild automaticamente
2. Ou: Clique em "Deployments" → últimas deploy → "Redeploy"
3. Aguarde 2-3 minutos

### Passo 3: Testar
1. Vá para https://tcs-de-suzini.vercel.app
2. Tente fazer login
3. Deve funcionar agora! ✅

---

## 🔗 Links Importantes

- **Frontend Local:** http://localhost:3000
- **Frontend Produção:** https://tcs-de-suzini.vercel.app
- **Backend Local:** http://localhost:8000
- **Railway Dashboard:** https://railway.app/dashboard

---

## ❓ Troubleshooting

### Se o login não funciona em produção:
1. Abra browser console (F12)
2. Vá para a aba "Network"
3. Tente fazer login e procure por erros de CORS
4. Se vir `CORS error`, volte ao Railway e verifique `CORS_ORIGINS` na variável de ambiente

### Se o Railway não faz deploy:
1. Verifique se o Dockerfile foi commitado
2. Verifique se requirements.txt está correto
3. Veja os logs do Railway para mais detalhes

