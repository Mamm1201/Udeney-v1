# Usa una imagen base oficial de Python ligera
FROM python:3.10-slim

# -------------------------------------------
# Configuraciones de entorno para mejorar el comportamiento de Python
# -------------------------------------------

# Evita que Python cree archivos .pyc
ENV PYTHONDONTWRITEBYTECODE=1

# Muestra los logs directamente en la salida estándar
ENV PYTHONUNBUFFERED=1

# -------------------------------------------
# Establece el directorio de trabajo dentro del contenedor
# -------------------------------------------
WORKDIR /app

# -------------------------------------------
# Copia el archivo de dependencias antes que el resto del código
# para aprovechar la cache de Docker si no ha cambiado
# -------------------------------------------
COPY requirements.txt .

# -------------------------------------------
# Instala dependencias del sistema necesarias para compilar y conectar con MySQL
# -------------------------------------------
RUN apt-get update && apt-get install -y \
    # Para esperar a que MySQL esté listo (wait-for-it)
    netcat-openbsd \ 
    # Para compilar algunos paquetes de Python                        
    gcc \         
    # Librerías de desarrollo de MySQL                           
    default-libmysqlclient-dev \ 
    # Necesario para la instalación de mysqlclient            
    pkg-config \  
    # Limpieza para reducir tamaño del contenedor                           
    && rm -rf /var/lib/apt/lists/*           

# -------------------------------------------
# Instala las dependencias de Python especificadas en requirements.txt
# -------------------------------------------
RUN pip install --no-cache-dir -r requirements.txt

# -------------------------------------------
# Copia el resto del proyecto al contenedor
# -------------------------------------------
COPY . .

# -------------------------------------------
# Da permisos de ejecución al script que espera que MySQL esté listo
# -------------------------------------------
RUN chmod +x ./wait-for-it.sh

# -------------------------------------------
# Comando por defecto: espera que MySQL esté disponible y luego inicia Django
# -------------------------------------------
CMD ["./wait-for-it.sh", "db:3306", "--", "python", "manage.py", "runserver", "0.0.0.0:8000"]
