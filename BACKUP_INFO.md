# 🔐 Backup Automático - TCS de Suzini

## ✅ Backup Configurado com Sucesso!

O seu projeto agora tem backup automático ativado a cada **2 horas**.

### 📁 Pastas de Backup
- **Local**: `/home/ermak/tcs-voleyball/backups/`
- **Formato**: `backup_YYYY-MM-DD_HH-MM-SS/`

### 🛠️ Operações Manuais

#### Fazer backup manual agora:
```bash
bash backup.sh
```

#### Ver log de backups:
```bash
cat backup.log
```

#### Listar todos os backups:
```bash
ls -la backups/
```

### ⏰ Cronograma Atual
- **Frequência**: A cada 2 horas (0, 2, 4, 6... horas do dia)
- **Retenção**: Últimos 10 backups mantidos automaticamente

### 🔄 Mudar Frequência de Backup

Execute `crontab -e` e procure pela linha do tcs-voleyball:

**Para backup diário às 22:00:**
```
0 22 * * * cd /home/ermak/tcs-voleyball && bash backup.sh >> /home/ermak/tcs-voleyball/backup.log 2>&1
```

**Para backup a cada 6 horas:**
```
0 */6 * * * cd /home/ermak/tcs-voleyball && bash backup.sh >> /home/ermak/tcs-voleyball/backup.log 2>&1
```

**Para backup a cada 30 minutos:**
```
*/30 * * * * cd /home/ermak/tcs-voleyball && bash backup.sh >> /home/ermak/tcs-voleyball/backup.log 2>&1
```

### 📝 O que é feito backup?
✅ Todos os arquivos do projeto
✅ HTML, CSS, JavaScript
✅ Configurações

❌ Não são feitos backup:
- Pasta `backups/` (para não duplicar)
- `node_modules/`
- `.git/`

### 🆘 Restaurar um Backup Anterior

1. Verifique os backups disponíveis:
   ```bash
   ls -la backups/
   ```

2. Copie os arquivos do backup desejado:
   ```bash
   cp -r backups/backup_2026-01-02_00-22-46/* .
   ```

### 📊 Monitorar Backups

Ver últimas operações de backup:
```bash
tail -20 backup.log
```

---

💾 **Seus dados estão seguros!** Seu projeto é salvo automaticamente a cada 2 horas.
