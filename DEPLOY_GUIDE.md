# 🚀 Guia Completo de Deployment - TCS Volleyball

## ✅ Status Local (PRONTO PARA DEPLOY)

- ✅ Frontend: Build compilado com sucesso (141.1 kB JS + 11.63 kB CSS)
- ✅ Backend: Dockerfile criado e pronto
- ✅ Variáveis de ambiente: Configuradas  
- ✅ Repositório Git: Tudo commitado
- ✅ Railway: Arquivos de configuração prontos

---

## 📋 Passos para Fazer o Deployment

### Passo 1: Acessar Railway
1. Vá para **https://railway.app**
2. Clique em **"Sign in"** e faça login com GitHub ou email
3. Clique em **"New Project"** ou **"Create a New Project"**

### Passo 2: Conectar Repositório GitHub
1. Selecione **"Deploy from GitHub"**
2. Autorize Railway a acessar sua conta GitHub
3. Selecione o repositório: **tcs-voleyball**
4. Clique em **"Deploy"**

**Railway irá:**
- Detectar o Dockerfile
- Fazer o build automaticamente
- Fazer o deploy do backend
- Gerar uma URL como: `https://tcs-de-suzini-api-production-xxxx.railway.app`

### Passo 3: Configurar Variáveis de Ambiente no Railway
No dashboard do Railway:

1. Vá para **Variables**
2. Adicione estas variáveis (copie dos valores abaixo):

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=volleyball_db
JWT_SECRET_KEY=votre-cle-secrete-super-securisee-changez-moi
FRONTEND_URL=https://tcs-de-suzini.vercel.app
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=thiago.gomes97300@gmail.com
SMTP_PASSWORD=adrm sgkf ujle bfla
ADMIN_NOTIFICATION_EMAIL=thiago.gomes97300@gmail.com
CORS_ORIGINS=https://tcs-de-suzini.vercel.app
PORT=8000
```

3. Clique em **"Deploy"** para redeploying com as variáveis

### Passo 4: Obter a URL do Railway
1. No dashboard do Railway, procure por **"Domain"** ou **"URL"**
2. Você verá algo como: `https://tcs-de-suzini-api-production-xxxx.railway.app`
3. **Copie essa URL** (você vai precisar no próximo passo)

### Passo 5: Configurar Vercel
1. Vá para **https://vercel.com/dashboard**
2. Selecione o projeto **tcs-de-suzini** 
3. Vá para **Settings** → **Environment Variables**
4. Clique em **"Add New"** e adicione:

```
Name: REACT_APP_BACKEND_URL
Value: https://tcs-de-suzini-api-production-xxxx.railway.app
```
(Use a URL que você copiou do Railway no Passo 4)

5. Selecione: **Production**, **Preview**, **Development**
6. Clique em **"Save"**
7. Vá para **Deployments** e clique em **"Redeploy"** para o seu commit mais recente

### Passo 6: Testar em Produção
1. Vá para **https://tcs-de-suzini.vercel.app**
2. Tente fazer login com as credenciais de teste
3. Verifique:
   - ✅ Conexão com sucesso
   - ✅ Redireciona para a página principal
   - ✅ Sem erros de CORS no console

---

## 🔍 Checklist Final

- [ ] Railway CLI instalado
- [ ] GitHub conectado no Railway
- [ ] tcs-voleyball repositório selecionado
- [ ] Backend em build/deploy no Railway
- [ ] URL do Railway copiada
- [ ] REACT_APP_BACKEND_URL adicionado no Vercel
- [ ] Vercel redeployado
- [ ] Login funcionando em produção

---

## 🆘 Troubleshooting

### Erro: "Cannot connect to backend"
- Verifique se CORS_ORIGINS no Railway inclui a URL do Vercel
- Verifique se a URL do Railway está correta no Vercel

### Erro: "MongoDB connection failed"
- Railway precisa de uma URL de MongoDB válida
- Você pode usar MongoDB Atlas (gratuito): https://www.mongodb.com/cloud/atlas

### Erro: "SMTP email not working"
- Verifique as credenciais do Gmail
- Você pode precisar de uma "App Password" específica

### Deploy não inicia
- Verifique os logs no Railway: Dashboard → Logs
- Procure por erros de Python ou módulos faltando

---

## 📞 Links Importantes

- Railway: https://railway.app
- Vercel: https://vercel.com/dashboard
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Railway Docs: https://docs.railway.app

---

**Autor**: GitHub Copilot  
**Data**: 4 de Janeiro de 2026  
**Status**: 🟢 PRONTO PARA DEPLOY
