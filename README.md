# 🧠 Udeney v1 – E-commerce Educativo

Udeney es una plataforma de **e-commerce educativo** orientada a promover la reutilización de artículos escolares y tecnológicos. Permite a los usuarios **comprar y vender** útiles, uniformes, herramientas y libros, con el objetivo de fomentar una economía circular que beneficie a estudiantes, docentes y familias.

## 👥 Equipo de Desarrollo

- **Julieth Funez** – Estudiante de Análisis y Desarrollo de Software (SENA)
- **Jairo Cardenas** – Estudiante de Análisis y Desarrollo de Software (SENA)
- **Mario Márquez** – Estudiante de Análisis y Desarrollo de Software (SENA)

---

````markdown
## 📚 Contenido

- Objetivos
- Tecnologías Usadas
- Estructura del Proyecto
- Configuración del Entorno
- 🐳 Despliegue con Docker (opcional)
- 📄 Licencia
- 🤝 Autor
- 🚧 Estado del Proyecto
- Calidad del código

## Objetivo principal

Promover la reutilización de recursos, apoyar a estudiantes con recursos limitados y contribuir al cuidado del medio ambiente

## 🎯 Objetivos especificos

- Ofrecer una solución digital que facilite el acceso a artículos escolares a bajo costo o gratuito.
- Incentivar la reutilización de productos educativos.
- Brindar una plataforma intuitiva, rápida y segura, con enfoque social y educativo.

## Problemática

En muchas comunidades, los estudiantes enfrentan dificultades para acceder a materiales escolares debido a restricciones económicas. Al mismo tiempo, existen numerosos artículos en buen estado que no se utilizan. Udeney busca conectar a quienes tienen estos recursos disponibles con quienes los necesitan, fomentando una economía circular en el ámbito educativo.

---

## 🛠 Tecnologías Usadas

### 🔧 Backend

- Python 3.x
- Django 5.1
- Django REST Framework
- MySQL
- Pillow
- Django CORS Headers
- Simple JWT

### 💻 Frontend

- React
- Vite
- Axios
- Material UI

---

## 📁 Estructura del Proyecto

Udeney-v1/
├── ecommerce-backend/ # Backend en Django
│ ├── eduneyv1/ # App principal de Django
│ ├── manage.py
│ ├── requirements.txt
│ └── .env # Variables de entorno (NO subir al repo)
├── client/ # Frontend en React + Vite
│ ├── src/
│ ├── vite.config.js
│ └── ...
└── README.md

---

## ⚙️ Configuración del Entorno

### 📦 Requisitos Previos

- Python 3.10+
- Node.js 18+
- MySQL 8.x
- Git

### 🔧 Clonación del Proyecto

```bash
git clone https://github.com/Mamm1201/Udeney-v1.git
cd Udeney-v1

🔙 Configurar y Ejecutar el Backend ( Django)
Crear entorno virtual:

bash
Copiar
Editar
python -m venv env
source env/bin/activate  # En Windows: env\Scripts\activate
Instalar dependencias:

bash
Copiar
Editar
pip install -r requirements.txt

Crear archivo .env junto a manage.py:
ini
Copiar
Editar
DB_NAME=db_ecommerce
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=3306
DEBUG=True
SECRET_KEY=tu_clave_secreta

Crear base de datos en MySQL:
sql
Copiar
Editar
CREATE DATABASE db_ecommerce CHARACTER SET UTF8MB4 COLLATE utf8mb4_general_ci;

Migrar modelos:
bash
Copiar
Editar
python manage.py makemigrations
python manage.py migrate

Crear superusuario:
bash
Copiar
Editar
python manage.py createsuperuser

Iniciar servidor:
bash
Copiar
Editar
python manage.py runserver

🧩 Configurar y Ejecutar el Frontend ( React + Vite)
Ir a la carpeta client/:
bash
Copiar
Editar
cd client

Instalar dependencias:
bash
Copiar
Editar
npm install

Ejecutar la aplicación:
bash
Copiar
Editar
npm run dev

📂 Archivo .gitignore
Tu archivo .gitignore debe cubrir:

Backend:

bash
Copiar
Editar
env/
__pycache__/
 *.pyc
 *.sqlite3
.env
Frontend:

bash
Copiar
Editar
node_modules/
dist/
.env
```

## 🐳 Despliegue con Docker (opcional)

Este proyecto también incluye configuración para ejecutar todo el stack usando Docker y Docker Compose. Se levantan tres servicios:

- 🛢️ **db**: MySQL 5.7 con volumen persistente.
- 🐍 **backend**: Django REST Framework (modo desarrollo).
- ⚛️ **frontend**: React + Vite (modo desarrollo).

### ⚙️ Requisitos Previos

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)

### ▶️ Levantar los Contenedores

Desde la raíz del proyecto (`Udeney-v1/`), ejecuta:

```bash
docker-compose up --build
Esto realizará lo siguiente:

Construirá las imágenes de backend y frontend.

Creará la base de datos db en el contenedor de MySQL.

Montará el código local para permitir desarrollo con recarga en caliente (hot reload).

Expondrá los siguientes puertos:

Backend Django: http://localhost:8000

Frontend Vite: http://localhost:5173

MySQL: localhost:3307

⚠️ Asegúrate de que las variables de entorno en tu archivo .env coincidan con las utilizadas en docker-compose.yml.

🛑 Detener los Contenedores
bash
Copiar
Editar
docker-compose down
Esto detiene los contenedores, pero conserva los volúmenes de datos (base de datos persistente).
```
````

markdown

## 🧼 CALIDAD DEL CÓDIGO

Este proyecto mantiene altos estándares de calidad en el código fuente tanto para el backend (Python) como para el frontend (React).

### 🐍 Backend (Python)

- **flake8**: Se usa para detectar errores de estilo y mantener el código limpio.
  - Configuración ubicada en `.flake8`.
  - Comando para ejecutar: `flake8 .`

```bash
# .flake8
[flake8]
exclude = migrations,venv,node_modules,__pycache__
max-line-length = 88

```

### ⚛️ Frontend (JavaScript/React)

ESLint: Verificador de buenas prácticas y errores comunes en JS/JSX.

Stylelint: Verificador para estilos CSS/SCSS.

Prettier (opcional pero recomendado): Formateador automático de código.

```bash

bash
Copiar
Editar

# Ejecutar ESLint

npx eslint "**/*.{js,jsx}"

# Ejecutar Stylelint

npx stylelint "**/*.{css,scss}"

# Ejecutar Prettier (requiere .prettierrc)

npx prettier --write .
Archivo .prettierrc sugerido ( colócalo en client/):
json
Copiar
Editar
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2
}
🤖 CI - Integración Continua
El proyecto incluye un flujo de trabajo automatizado en .github/workflows/linters.yml que ejecuta:

ESLint para JS/React

Stylelint para CSS/SCSS

Verificación de que node_modules/ no se haya subido por error

```

### 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT. Consulta el archivo LICENSE para más detalles.

### 🤝 Autor

- Desarrollado por Mario Márquez
- Estudiante de Análisis y Desarrollo de Software – SENA

### 🚧 Estado del Proyecto

🔨 En desarrollo activo – nuevas funcionalidades y mejoras están en curso.
