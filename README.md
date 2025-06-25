# 🧠 Udeney v1 – E-commerce Educativo

Udeney es una plataforma de **e-commerce educativo** orientada a promover la reutilización de artículos escolares y tecnológicos. Permite a los usuarios **comprar y vender** útiles, uniformes, herramientas y libros, con el objetivo de fomentar una economía circular que beneficie a estudiantes, docentes y familias.

## 👥 Equipo de Desarrollo

- **Julieth Funez** – Estudiante de Análisis y Desarrollo de Software (SENA)
- **Jairo Cardenas** – Estudiante de Análisis y Desarrollo de Software (SENA)
- **Mario Márquez** – Estudiante de Análisis y Desarrollo de Software (SENA)

---

## 📚 Contenido

- Objetivos
- Tecnologías Usadas
- Estructura del Proyecto
- Configuración del Entorno
- 🐳 Despliegue con Docker (opcional)
- Gestión de Migraciones
- Justificación del motor de base de datos (MySQL)
- 📄 Licencia
- 🤝 Autor
- 🚧 Estado del Proyecto
- Calidad del código
- CI - Integración Continua

## Objetivo principal

Promover la reutilización de recursos, apoyar a estudiantes con recursos limitados y contribuir al cuidado del medio ambiente.

## 🎯 Objetivos específicos

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

`Udeney-v1/
├── ecommerce-backend/         # Backend en Django
│   ├── eduneyv1/              # App principal de Django
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                   # Variables de entorno (NO subir al repo)
├── client/                    # Frontend en React + Vite
│   ├── src/
│   ├── vite.config.js
└── README.md`

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
```

### 🔙 Configurar y Ejecutar el Backend (Django)

```bash
python -m venv env
source env/bin/activate  # En Windows: env\Scripts\activate
pip install -r requirements.txt
```

Crear archivo `.env` junto a `manage.py`:

```env
DB_NAME=db_ecommerce
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=3306
DEBUG=True
SECRET_KEY=tu_clave_secreta
```

Crear base de datos:

```sql
CREATE DATABASE db_ecommerce CHARACTER SET UTF8MB4 COLLATE utf8mb4_general_ci;
```

Aplicar migraciones y crear superusuario:

```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

### 🧩 Configurar y Ejecutar el Frontend (React + Vite)

```bash
cd client
npm install
npm run dev
```

## 📂 Archivo .gitignore

### Backend

`env/
__pycache__/
*.pyc
*.sqlite3
.env`

### Frontend

`node_modules/
dist/
.env`

---

## 🐳 Despliegue con Docker (opcional)

Este proyecto también incluye configuración para ejecutar todo el stack usando Docker y Docker Compose.

Servicios incluidos:

- 🛢️ MySQL 5.7
- 🐍 Django Backend (modo desarrollo)
- ⚛️ React Frontend (modo desarrollo)

### ⚙️ Requisitos Previos

- Docker
- Docker Compose

### ▶️ Levantar los Contenedores

```bash
docker-compose up --build
```

Esto:

- Construye imágenes
- Crea base de datos
- Monta código con recarga en caliente
- Expone:
  - Backend: <http://localhost:8000>
  - Frontend: <http://localhost:5173>
  - MySQL: localhost:3307

Para detener los contenedores:

```bash
docker-compose down
```

---

## 🧾 Gestión de Migraciones

Se recomienda mantener `managed = True` en los modelos para permitir a Django gestionar migraciones automáticamente.

---

## 🛢️ Justificación del motor de base de datos (MySQL)

MySQL es una opción sólida por su rendimiento, estabilidad, soporte transaccional y compatibilidad con Django.

---

## 🧼 Calidad del Código

### 🐍 Backend (Python)

- `flake8`: verificador de estilo
- `black`: formateador automático

```ini
# .flake8
[flake8]
exclude = migrations,venv,node_modules,__pycache__
max-line-length = 88
```

```bash
# Ejecutar validaciones
flake8 .
black --check .
```

### ⚛️ Frontend (JavaScript/React)

- `ESLint`, `Stylelint`, `Prettier`

```bash
# Lint y formato
npx eslint "**/*.{js,jsx}"
npx stylelint "**/*.{css,scss}"
npx prettier --write .
```

#### .prettierrc sugerido (`client/`)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "tabWidth": 2
}
```

---

## 🤖 CI - Integración Continua

El archivo `.github/workflows/ci.yml` automatiza:

- Verificación de formato con `black`
- Linter y formateo en frontend (`eslint`, `prettier`)
- Soporte para múltiples versiones de Python (`3.10`, `3.11`)
- Cache de paquetes Python y Node.js
- Generación y subida de reporte de cobertura

---

## 📄 Licencia

MIT License

## 🤝 Autor

- Desarrollado por **Mario Márquez**
- Estudiante de Análisis y Desarrollo de Software – SENA

## 🚧 Estado del Proyecto

🔨 En desarrollo activo – nuevas funcionalidades y mejoras están en curso
