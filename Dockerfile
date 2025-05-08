# Imagen base estable de Python
FROM python:3.11-slim

# Establece el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copia el archivo de requerimientos e instala dependencias del sistema necesarias para mysqlclient
COPY requirements.txt .

# Instalar dependencias necesarias para compilar mysqlclient y otras dependencias del sistema
RUN apt-get update && apt-get install -y \
    pkg-config \
    libmariadb-dev \
    build-essential \
    python3-dev \
    && apt-get clean

# Actualizar pip antes de instalar las dependencias de Python
RUN pip install --upgrade pip

# Instalar las dependencias de Python desde requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo el contenido del proyecto (asegúrate de tener .dockerignore para evitar copiar carpetas como venv)
COPY . .

# Variables de entorno
ENV DJANGO_SETTINGS_MODULE=udeneyv1.settings
ENV PYTHONUNBUFFERED=1

# Expone el puerto del servidor de desarrollo de Django
EXPOSE 8000

# Comando por defecto al iniciar el contenedor
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

