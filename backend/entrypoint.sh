#!/bin/sh
# Executa a coleta de arquivos estáticos (ignora se der erro por falta de var de ambiente)
python manage.py collectstatic --noinput

# Executa as migrações do banco de dados
python manage.py migrate

# Inicia o Gunicorn com a porta definida pelo Render (ou 8000 como padrão)
gunicorn config.wsgi:application --bind 0.0.0.0:${PORT:-8000}
