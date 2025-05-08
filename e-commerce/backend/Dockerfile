FROM python:3.14.0a7-slim

WORKDIR /app

# Copiar los archivos de requirements y luego instalar las dependencias
COPY ../../requirements.txt .
RUN pip install -r requirements.txt

# Copiar el resto del código del backend
COPY . .

# Establecer variables de entorno (puedes ajustarlas)
ENV DJANGO_SETTINGS_MODULE=e-commerce.settings
ENV PYTHONUNBUFFERED=1

# Exponer el puerto en el que corre Django
EXPOSE 8000

# Comando para ejecutar el servidor de desarrollo de Django
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]