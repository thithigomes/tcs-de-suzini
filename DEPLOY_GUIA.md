# 🚀 DEPLOY GRATUITO - TCS DE SUZINI

## ✨ Seu site vai ficar online 100% GRÁTIS em 15 minutos!

---

## **PASSO 1: Conectar GitHub (2 minutos)**

Se não tem GitHub:
1. Acesse https://github.com/join
2. Crie sua conta
3. Escolha username: `seu-usuario`

---

## **PASSO 2: Upload do Código para GitHub (3 minutos)**

```bash
cd /home/ermak/tcs-voleyball

# Inicializar git
git init
git add .
git commit -m "Deploy inicial TCS de Suzini"

# Adicionar remote (copie a URL do seu repo GitHub)
git remote add origin https://github.com/SEU_USERNAME/tcs-voleyball.git
git branch -M main
git push -u origin main
```

---

## **PASSO 3: Deploy Frontend no Vercel (5 minutos)**

1. Acesse: **https://vercel.com/new**
2. Clique em "Continue with GitHub"
3. Escolha o repo: `tcs-voleyball`
4. Configurações:
   - Framework Preset: `Create React App`
   - Root Directory: `./frontend`
   - Build Command: `npm run build`
   - Output Directory: `build`

5. **Environment Variables:**
   - Nome: `REACT_APP_BACKEND_URL`
   - Valor: Você copiará depois (do Railway)

6. Clique **Deploy** ✅

**Resultado:** `https://tcs-de-suzini.vercel.app`

---

## **PASSO 4: Deploy Backend no Railway (5 minutos)**

1. Acesse: **https://railway.app**
2. Clique "Start a New Project"
3. Escolha "Deploy from GitHub Repo"
4. Selecione: `tcs-voleyball`
5. Configure:
   - Service: Backend
   - Root Directory: `./backend`

6. **Environment Variables** (Railway vai pedir):

```
MONGO_URL=mongodb+srv://USER:PASS@cluster.mongodb.net/tcs_voleyball
DB_NAME=tcs_voleyball
JWT_SECRET_KEY=seu-jwt-secreto-super-seguro-2026
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=thiago.gomes97300@gmail.com
SMTP_PASSWORD=ghqdlqybvcxcchnb
FRONTEND_URL=https://tcs-de-suzini.vercel.app
ENVIRONMENT=production
DEBUG=false
```

7. Clique **Deploy** ✅

**Resultado:** Railway vai gerar uma URL tipo `https://backend-xyz.railway.app`

---

## **PASSO 5: Conectar Frontend com Backend (2 minutos)**

1. Volta no **Vercel**
2. Clique no seu projeto
3. Vá em **Settings** → **Environment Variables**
4. Atualize:
   - `REACT_APP_BACKEND_URL` = `https://backend-xyz.railway.app` (da Railway)
5. Clique **Redeploy**

---

## ✅ **PRONTO! Seu site está online:**

- 🌐 Frontend: `https://tcs-de-suzini.vercel.app`
- 🔗 Backend: `https://backend-xyz.railway.app`
- 📧 Email: `thiago.gomes97300@gmail.com`

---

## 🆘 **MongoDB Cloud (GRÁTIS)**

Se precisar banco de dados online:

1. Acesse: https://www.mongodb.com/cloud/atlas
2. Crie conta (free tier)
3. Crie um cluster
4. Copy a connection string
5. Cole no `MONGO_URL` do Railway

---

## 📞 **Suporte**

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app
- MongoDB: https://docs.mongodb.com

---

**Tudo 100% GRÁTIS! Nenhum cartão necessário! 🎉**
