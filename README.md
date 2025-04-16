# 🛒 E-commerce

Este es un proyecto de E-commerce desarrollado con **Django + Django REST Framework** para el backend y **React + Vite** para el frontend. Permite la gestión de usuarios, artículos, historial de transacciones, carrito de compras y más.

## 🛠 Tecnologías usadas

- Python 3.x
- Django 5.1
- Django REST Framework
- MySQL
- React + Vite
- JWT (SimpleJWT)
- CORS Headers
- Pillow (para imágenes)
- Axios
- Material UI (para los estilos)

---

## 📁 Estructura del proyecto

/ecommerce-backend/ │ manage.py │ .env │ requirements.txt │ ├── eduneyv1/ # App principal de Django │ /client/ # Frontend en React vite.config.js src/

---

## 🚀 Requisitos previos

- Python 3.x
- Node.js y npm
- MySQL
- Git

---

## ⚙️ Configuración del entorno

1. Clona este repositorio:

```bash
git clone https://github.com/Mamm1201/Udeney-v1.git
cd tu_repositorio

Crea un entorno virtual e instálalo:

python -m venv env
source env/bin/activate   # En Windows: env\Scripts\activate
pip install -r requirements.txt

Crea un archivo .env en la raíz ( al lado de manage.py) con las variables de entorno:

DB_NAME=db_ecommerce
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña_mysql
DB_HOST=localhost
DB_PORT=3306
DEBUG=True
SECRET_KEY=tu_clave_secreta

🛠️ Configuración de base de datos
Una vez configurado el .env, ejecuta:

Crear la base de datos ( en MySQL):
sql
Copiar
Editar
CREATE DATABASE db_ecommerce CHARACTER SET UTF8MB4 COLLATE utf8mb4_general_ci;

Despues de creada la base de datos debes migrar los modelos, ejecuta estos comandos:

Terminal bash:
Copiar
Editar
python manage.py makemigrations
python manage.py migrate

Opcionalmente, puedes crear un superusuario:
bash
Copiar
Editar
python manage.py createsuperuser

🧪 Ejecutar el backend ( Django)
Desde la raíz del proyecto:

Terminal bash
Copiar
Editar
python manage.py runserver

⚙️ Frontend
1. Ir a la carpeta client/:
bash
Copiar
Editar
cd client
2. Instalar dependencias:
bash
Copiar
Editar
npm install
3. Levantar frontend:
bash
Copiar
Editar
npm run dev

🔒 Seguridad
Tu archivo .env contiene información sensible como la contraseña de MySQL y la clave secreta de Django. Asegúrate de que esté listado en tu .gitignore para no subirlo al repositorio.

📦 Dependencias del backend
Están listadas en el archivo requirements.txt, genera uno así:

bash
Copiar
Editar
pip freeze > requirements.txt

📄 LICENCIA
Este proyecto es solo con fines educativos y puede ser usado como base para futuros proyectos.

🤝 AUTOR
Desarrollado por ["Mario Marquez"]
Estudiante de Análisis y Desarrollo de Software – SENA

yaml
Copiar
Editar

---










```
