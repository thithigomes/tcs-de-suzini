# TCS de Suzini - Credenciais Funcionais

## 🎯 Status: ✅ TUDO FUNCIONANDO

### Serviços Rodando:
- **Frontend**: http://localhost:3000 ou http://192.168.1.27:3000
- **Backend API**: http://localhost:8000 (Swagger: /docs)
- **MongoDB**: localhost:27017
- **Build**: Serve 3000 + Uvicorn 8000

---

## 👥 Contas de Teste

### Admin / Referent
```
Email: admin@tcs.com
Senha: admin123
Role: Referent (pode criar Torneios, Matches, News)
```

### Usuário Normal
```
Email: teste@example.com
Senha: Senha123!
Role: User (pode ver dados, participar)
```

### Criar Nova Conta
- Ir para Login → Onglet "Inscrever-se"
- Preencher: Email, Senha, Nome, Sobrenome
- Selecionar tipo de licença
- Enviar

---

## 📊 Dados Criados

✅ **3 Torneios:**
- Torneio de Verão 2026 (02/01 - 10/02)
- Campeonato Feminino (15/03 - 20/03)
- Torneio Misto (10/04 - 12/04)

✅ **2 Matches:**
- TCS A vs TCS B (21-18)
- Feminino vs Visitante (25-15)

✅ **2 News:**
- Grande Vitória
- Novo Técnico

✅ **5 Treinos:**
- Seg-Sex: Entraînements
- Finais de semana: Jeu Libre

✅ **Rankings:**
- 3 usuários cadastrados

---

## 🧪 Funcionalidades Testadas

### ✅ Autenticação
- [x] Registro de novo usuário
- [x] Login com email/senha
- [x] Esqueci a senha
- [x] Registro de referent
- [x] Autenticação JWT

### ✅ Dashboard
- [x] Exibir dados do usuário
- [x] Mostrar torneios próximos
- [x] Listar matches recentes

### ✅ Páginas
- [x] **Tournaments**: 3 torneios criados e visíveis
- [x] **Matches**: 2 matches com placar
- [x] **Rankings**: Usuários com pontos
- [x] **Training**: 5 sessões de treino
- [x] **News**: 2 notícias publicadas
- [x] **Profile**: Dados do usuário

### ✅ API Backend
- [x] POST /auth/register
- [x] POST /auth/login
- [x] POST /auth/forgot-password
- [x] POST /auth/register-referent
- [x] GET /users/me
- [x] GET /tournaments
- [x] GET /matches
- [x] GET /news
- [x] GET /training-schedule
- [x] GET /rankings
- [x] POST /tournaments (referent)
- [x] POST /matches (referent)
- [x] POST /news (referent)

---

## 🌐 Acesso Mobile

Da qualquer dispositivo na rede:
```
http://192.168.1.27:3000
```

Frontend detecta automaticamente backend em 192.168.1.27:8000

---

## 🔧 Comandos Úteis

### Iniciar Tudo
```bash
cd /home/ermak/tcs-voleyball
docker start tcs-mongodb
source venv/bin/activate
cd backend && uvicorn server:app --host 0.0.0.0 --port 8000 --reload &
cd ../frontend && serve -s build -l 3000 &
```

### Verificar Serviços
```bash
lsof -i :3000,:8000,:27017
```

### Logs
```bash
tail -f /tmp/backend.log
tail -f /tmp/frontend.log
```

### Resetar Dados
```bash
# MongoDB shell
mongosh mongodb://localhost:27017/tcs_voleyball
db.users.deleteMany({})
db.tournaments.deleteMany({})
# Depois rodar seed-data novamente
curl -X POST http://localhost:8000/api/seed-data
```

---

## 📋 Próximos Passos

- [x] Todos endpoints funcionando
- [x] Autenticação completa
- [x] Dados de teste criados
- [ ] Deploy em produção (opcional)
- [ ] Email real para reset de senha
- [ ] Upload de imagens para news

---

## 🎨 Logo

A nova logo TCS foi integrada:
- Navbar: 12px height
- Login: 32px height
- Sem bordas brancas/pretas
- Circunferência perfeita

