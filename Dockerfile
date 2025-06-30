# Usa una imagen base de Python
FROM python:3.10-slim

# Establece variables de entorno para Python
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Establece el directorio de trabajo
WORKDIR /app

# Copia requirements primero para aprovechar cache de Docker
COPY requirements.txt .

# Instala dependencias del sistema
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

# Instala dependencias de Python
RUN pip install --no-cache-dir -r requirements.txt

# Copia el resto del proyecto
COPY . .

# Da permisos al script
RUN chmod +x ./wait-for-it.sh

# Comando para iniciar
CMD ["./wait-for-it.sh", "db:3306", "--", "python", "manage.py", "runserver", "0.0.0.0:8000"]