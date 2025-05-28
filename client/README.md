# Frontend - Udeney

## 📚 Tabla de Contenido

- Tabla de Contenido
- Descripción del Proyecto
- Estructura del Proyecto
- Scripts Disponibles
- Variables de Entorno
- Docker
- Integración continua
- Dependencias Principales
- Contacto

## 📖 Descripción del Proyecto

Este directorio contiene el código fuente del frontend de Udeney, una plataforma de e-commerce educativo enfocada en la reutilización de artículos escolares y tecnológicos. El frontend está desarrollado con React y utiliza Vite como bundler. Consume una API proporcionada por el backend desarrollado en Django.

## 🗂️ Estructura del Proyecto

client/
├── .github/
│ └── workflows/
│ └── linters.yml # Configuración de GitHub Actions para linters
├── public/ # Archivos públicos (favicon, index.html, etc.)
├── src/ # Código fuente principal del frontend
│ ├── assets/ # Imágenes y recursos estáticos
│ ├── components/ # Componentes reutilizables de la interfaz
│ ├── pages/ # Páginas principales de la aplicación
│ ├── services/ # Lógica para consumir la API
│ ├── hooks/ # Hooks personalizados
│ ├── contexts/ # Manejo de estados globales con Context API
│ ├── App.jsx # Componente principal
│ ├── main.jsx # Punto de entrada de la app
├── .babelrc # Configuración de Babel
├── .dockerignore # Archivos y carpetas ignorados por Docker
├── .env # Variables de entorno
├── .eslintrc.js # Configuración de ESLint
├── .gitignore # Archivos y carpetas ignorados por Git
├── Dockerfile # Configuración de Docker para el frontend
├── package.json # Scripts y dependencias
├── vite.config.js # Configuración de Vite

## ▶️ Scripts Disponibles

```bash
npm install       # Instala las dependencias
npm run dev       # Ejecuta el servidor de desarrollo
npm run build     # Genera la versión de producción
npm run preview   # Previsualiza la build de producción

```

### Variables de Entorno

- Crea un archivo .env en la raíz con:
  env
  Copiar
  Editar

- [ VITE_API_URL=http://localhost:8000/api/v1/ ]

🧩 Dependencias Principales
React
React Router DOM
Axios
Vite

## 🐳 Docker (usando docker-compose desde la raíz del proyecto)

El frontend no se ejecuta directamente con comandos docker build o docker run desde esta carpeta. En lugar de eso, todo el proyecto se orquesta desde la raíz mediante docker-compose.

✅ Pasos para levantar el proyecto completo

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

Montará el código local para permitir desarrollo con recarga en caliente ( hot reload).

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
Esto detiene los contenedores, pero conserva los volúmenes de datos ( base de datos persistente).

```

🧪 Integración Continua

El proyecto utiliza GitHub Actions para la integración continua. El flujo de trabajo se encuentra en .github/workflows/linters.yml y está configurado para ejecutar linters en cada push o pull request a la rama principal.

Ejemplo de configuración en linters.yml:

yaml
Copiar
Editar
name: Linters

```bash
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2
      - name: Install dependencies
        run: npm install
      - name: Run ESLint
        run: npm run lint

```

🧩 Dependencias Principales
React

React Router DOM

Axios

Vite

ESLint

Prettier

Babel
