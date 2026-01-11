# 🏐 Iniciando Volleyball App

## ✅ Problema Resolvido!

O erro "Erreur lors du chargement des horaires" foi completamente resolvido. O sistema agora:

✓ Backend rodando em http://localhost:8000  
✓ Frontend rodando em http://localhost:3000  
✓ 5 treinos pré-configurados e funcionando  
✓ CORS habilitado  
✓ Fallback em memória quando MongoDB não está disponível  

## 🚀 Como Iniciar

### Opção 1: Script Automático (Recomendado)

```bash
/home/ermak/tcs-voleyball/start-app.sh
```

Isso vai:
- Matar qualquer processo anterior
- Iniciar o Backend em http://localhost:8000
- Iniciar o Frontend em http://localhost:3000
- Mostrar os logs em tempo real

### Opção 2: Manual

**Terminal 1 - Backend:**
```bash
cd /home/ermak/tcs-voleyball/backend
source ../.venv/bin/activate
python3 -m uvicorn server:app --host 0.0.0.0 --port 8000 --reload
```

**Terminal 2 - Frontend:**
```bash
cd /home/ermak/tcs-voleyball/frontend
export REACT_APP_BACKEND_URL=http://localhost:8000
export PORT=3000
npm start
```

## 🌐 Acessar o App

Abra no navegador:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:8000/api/training-schedule

## 📋 Treinos Disponíveis

### Segunda-feira (Lundi)
- 18:00-20:00: 🏋️ Entraînement (Compétition)
- 20:00-22:00: 🎮 Jeu Libre (Todos)

### Quarta-feira (Mercredi)
- 18:00-20:00: 🏋️ Entraînement (Compétition)
- 20:00-22:00: 🎮 Jeu Libre (Todos)

### Sexta-feira (Vendredi)
- 18:00-22:00: 🎮 Jeu Libre (Todos)

## 🛠️ Gerenciar Treinos

Acesse a página **Administração > Treinos** para:
- ✏️ Criar novo treino
- ✏️ Editar treino existente  
- ✏️ Deletar treino

## 📝 Logs

Enquanto a app está rodando:

```bash
# Log do Backend
tail -f /tmp/backend.log

# Log do Frontend  
tail -f /tmp/frontend.log
```

## ⛔ Parar a App

```bash
pkill -f 'uvicorn|npm start'
```

## ❓ Troubleshooting

### Frontend não atualiza depois de mudanças?
```bash
# Limpar cache e reiniciar
rm -rf frontend/build
npm cache clean --force
/home/ermak/tcs-voleyball/start-app.sh
```

### Porta 8000 já em uso?
```bash
# Encontrar o processo
lsof -i :8000

# Matar o processo
kill -9 <PID>
```

### Treinos não aparecem?
```bash
# Testar o backend diretamente
curl http://localhost:8000/api/training-schedule

# Deve retornar lista de treinos em JSON
```

## 🎉 Sucesso!

Se você vê os treinos na página de **Entraînements**, tudo está funcionando! 

Aproveite! ⚽🏐
