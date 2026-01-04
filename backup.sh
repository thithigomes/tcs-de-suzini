#!/bin/bash

# Script de Backup Automático - TCS de Suzini

BACKUP_DIR="$PWD/backups"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
BACKUP_PATH="$BACKUP_DIR/backup_$TIMESTAMP"

# Criar pasta de backups se não existir
mkdir -p "$BACKUP_DIR"

# Criar pasta do backup com timestamp
mkdir -p "$BACKUP_PATH"

# Copiar arquivos (excluindo node_modules e pasta backups)
echo "🔄 Iniciando backup em: $BACKUP_PATH"

cp -r . "$BACKUP_PATH" --exclude=backups --exclude=node_modules --exclude=.git 2>/dev/null

# Contar arquivos
FILE_COUNT=$(find "$BACKUP_PATH" -type f | wc -l)
echo "✅ Backup concluído! $FILE_COUNT arquivos copiados."

# Manter apenas os últimos 10 backups
echo "🧹 Limpando backups antigos..."
ls -t "$BACKUP_DIR" | tail -n +11 | xargs -r rm -rf

echo "✨ Tudo pronto! Backups salvos em: backups/"
