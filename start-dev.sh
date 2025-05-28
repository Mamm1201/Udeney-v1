
# Script para iniciar los servicios de backend y frontend con Docker Compose

echo "Iniciando servicios de Udeney-v1 (backend y frontend)..."

# Construye las imágenes si es necesario y levanta los contenedores
# Elige una de las siguientes líneas según prefieras:

# Para ejecutar en segundo plano (detached mode):
# docker-compose up --build -d

# Para ejecutar en primer plano y ver los logs directamente en la terminal:
docker-compose up --build

echo "Servicios iniciados."
echo "El backend debería estar accesible en http://localhost:8000"
echo "El frontend debería estar accesible en http://localhost:5173"
