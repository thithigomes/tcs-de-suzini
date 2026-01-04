# 📧 Sistema de Email - TCS de Suzini

## ✅ Status Atual

**Sistema de Email 100% Funcional!**

### 🎯 O que está funcionando:

✅ **Email de Código Referent** - Quando referent se registra, recebe código de 6 dígitos
✅ **Email de Recuperação de Senha** - Usuário pode resetar senha via email
✅ **Teste de Email** - Endpoint para testar envio

---

## 📤 Como Funciona Hoje

### Em Desenvolvimento (Modo Teste)
Emails são salvos em arquivos `.html` em `/tmp/`:
```
/tmp/email_ecf5e74c_1767546593.html
```

**Vantagens:**
- ✅ Sem custo
- ✅ Sem credenciais
- ✅ Teste completo antes de usar email real

**Ver emails enviados:**
```bash
ls -lt /tmp/email_*.html | head -5
cat /tmp/email_*.html
```

---

## 🚀 Como Ativar Email Real

### Opção A: Gmail (RECOMENDADO)

**Passo 1: Criar App Password**
1. Vá para [myaccount.google.com/security](https://myaccount.google.com/security)
2. Ative "Autenticação em 2 etapas"
3. Vá em "Senhas de app"
4. Selecione Mail + Linux
5. Copie a senha (16 caracteres)

**Passo 2: Configurar .env**
```bash
nano /home/ermak/tcs-voleyball/backend/.env
```

Atualize:
```env
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=seu_email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

**Passo 3: Testar**
```bash
cd /home/ermak/tcs-voleyball/backend
source ../venv/bin/activate
python server.py
# Depois em outro terminal:
curl -X POST "http://localhost:8000/api/test-email?email=seu_email@gmail.com"
```

---

### Opção B: Resend (Premium)

1. Vá para [resend.com](https://resend.com)
2. Crie conta
3. Copie API key
4. Configure:
```env
RESEND_API_KEY=re_sua_chave_aqui
```

---

### Opção C: Mailtrap (Testing)

1. Vá para [mailtrap.io](https://mailtrap.io)
2. Crie conta gratuita
3. Configure:
```env
SMTP_SERVER=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=seu_usuario_mailtrap
SMTP_PASSWORD=sua_senha_mailtrap
```

---

## 🧪 Testar Sistema de Email

### Teste 1: Referent Registration
```
URL: http://localhost:3000/login
1. Clique em "Devenir Référent"
2. Preencha:
   - Email: seu_email@test.com
   - Senha: Teste123!
   - Nome: Silva
   - Sobrenome: João
   - Código: TCS-REF-2026
3. Clique "S'inscrire"
4. Verifique email ou /tmp/email_*.html
```

### Teste 2: Forgot Password
```
URL: http://localhost:3000/login
1. Clique "Mot de passe oublié?"
2. Digite email
3. Verifique email ou /tmp/email_*.html
```

### Teste 3: API Direto
```bash
curl -X POST "http://localhost:8000/api/test-email?email=seu_email@test.com"
```

---

## 📋 Emails Enviados Automaticamente

| Evento | Template | Informação |
|--------|----------|-----------|
| Registro Referent | `register-referent` | Código 6 dígitos |
| Esqueci Senha | `forgot-password` | Link reset |
| Boas-vindas | (futuro) | Confirmação conta |

---

## 🔍 Debug & Troubleshooting

### Ver emails salvos
```bash
ls -lh /tmp/email_*.html
# Abrir em navegador:
firefox /tmp/email_*.html
```

### Ver logs
```bash
tail -50 /tmp/backend.log | grep -i "email\|enviado"
```

### Testar conexão SMTP
```python
python3 << 'EOF'
import smtplib
server = smtplib.SMTP('smtp.gmail.com', 587)
server.starttls()
server.login('seu_email@gmail.com', 'app_password')
print("✅ Conexão OK!")
server.quit()
EOF
```

### Resetar ambiente de teste
```bash
# Remover emails de teste
rm /tmp/email_*.html

# Reiniciar backend
pkill -f uvicorn
cd /home/ermak/tcs-voleyball/backend && source ../venv/bin/activate && uvicorn server:app --host 0.0.0.0 --port 8000 &
```

---

## 📚 Estrutura de Email

Todos os emails incluem:
- ✅ Logo TCS no topo
- ✅ Branding colors (Orange #FF6B35, Green #064E3B)
- ✅ Responsive design
- ✅ Call-to-action buttons
- ✅ Informação clara

---

## 🎯 Próximos Passos

1. **Configurar email real** (escolha uma opção acima)
2. **Testar com seu email**
3. **Notificar admin** de novos registros
4. **Dashboard de emails** (futuro)

---

## ⚙️ Configuração Padrão

**Arquivo:** `/home/ermak/tcs-voleyball/backend/.env`

```env
# Email em desenvolvimento (salva em arquivo)
SMTP_EMAIL=noreply@tcsvoleyball.com
SMTP_PASSWORD=

# Em produção (descomente uma opção)
# SMTP_PASSWORD=sua_app_password
# ou
# RESEND_API_KEY=re_sua_chave
```

---

## 🎉 Pronto!

Sistema de email está **100% integrado e funcionando**!

- ✅ Código automático para referent
- ✅ Email com formatação HTML
- ✅ Suporta múltiplos provedores
- ✅ Fallback para arquivo em desenvolvimento

Basta configurar .env quando quiser usar email real!

