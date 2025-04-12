#!/bin/bash

echo "🚀 Iniciando despliegue..."

# Ruta donde está tu proyecto
cd /home/ec2-user/supermercado-back

# 1. Obtener últimos cambios desde GitHub
echo "🔄 Haciendo pull de la última versión desde GitHub..."
git pull origin main

# 2. Detener contenedores actuales
echo "🛑 Deteniendo contenedor actual..."
docker-compose down

# 3. Reconstruir y levantar contenedor
echo "🧱 Reconstruyendo y levantando con Docker..."
docker-compose up -d --build

echo "✅ ¡Despliegue completo!"
