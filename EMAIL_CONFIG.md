# Configurar Email Real - TCS de Suzini

## 🎯 Opção 1: Gmail + App Password (RECOMENDADO)

### Passo 1: Criar App Password no Gmail

1. Vá para [myaccount.google.com/security](https://myaccount.google.com/security)
2. Ative **Autenticação em 2 etapas**
3. Volte para Segurança
4. Procure por **"Senhas de app"**
5. Selecione app "Mail" e dispositivo "Windows/Mac/Linux"
6. Copie a senha gerada (16 caracteres)

### Passo 2: Configurar .env

Edite `/home/ermak/tcs-voleyball/backend/.env`:

```env
# SMTP Configuration (Gmail)
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=seu_email@gmail.com
SMTP_PASSWORD=sua_app_password_16_caracteres
```

**Exemplo:**
```env
SMTP_EMAIL=tcs.suzini@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
```

### Passo 3: Testar

```bash
curl -X POST "http://localhost:8000/api/test-email?email=seu_email@test.com"
```

---

## 🎯 Opção 2: Resend API (Premium)

1. Vá para [resend.com](https://resend.com)
2. Crie conta e verifique domínio
3. Copie API key
4. Configure em `.env`:

```env
RESEND_API_KEY=re_sua_chave_aqui
```

---

## 🎯 Opção 3: Mailtrap (Testing - Gratuito)

1. Vá para [mailtrap.io](https://mailtrap.io)
2. Crie conta
3. Configure SMTP credentials:

```env
SMTP_SERVER=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_EMAIL=seu_email_mailtrap
SMTP_PASSWORD=sua_senha_mailtrap
```

---

## ✅ Verificar se Email Está Funcionando

### Teste 1: Verificar logs
```bash
tail -f /tmp/backend.log | grep "Email sent"
```

### Teste 2: Registrar referent
Ir para Login → "Devenir Référent"
- Email: seu_email@test.com
- Senha: Teste123!
- Nome: Silva
- Sobrenome: João
- Código: TCS-REF-2026

Deveria receber email com código de 6 dígitos.

### Teste 3: Teste direto
```bash
curl -X POST "http://localhost:8000/api/test-email?email=seu_email@test.com"
```

---

## 🔍 Debug

### Ver logs do backend
```bash
tail -50 /tmp/backend.log
```

### Verificar se email foi enviado
```bash
grep -i "email sent" /tmp/backend.log
```

### Testar conexão SMTP
```python
python3 << 'EOF'
import smtplib
SMTP_SERVER = "smtp.gmail.com"
SMTP_PORT = 587
SMTP_EMAIL = "seu_email@gmail.com"
SMTP_PASSWORD = "app_password"

try:
    server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
    server.starttls()
    server.login(SMTP_EMAIL, SMTP_PASSWORD)
    print("✅ Conexão OK!")
    server.quit()
except Exception as e:
    print(f"❌ Erro: {e}")
EOF
```

---

## 📧 Emails Enviados Automaticamente

Após configurar, esses emails serão enviados:

1. **Registro de Referent** → Código de verificação (6 dígitos)
2. **Esqueci Senha** → Link para resetar senha
3. **Admin Notification** (futuro) → Notificar admin de eventos

---

## ⚠️ Importantes

- **Nunca commite credenciais no git** (`.env` já está no `.gitignore`)
- **App passwords do Gmail** são específicas e seguras
- **Teste antes de usar em produção**
- **Verificar spam** se não receber emails

---

## 🎉 Pronto!

Com email configurado:
- ✅ Referents recebem código
- ✅ Usuários recuperam senhas
- ✅ Admin recebe notificações

