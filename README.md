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

````bash
Udeney-v1/
├── ecommerce-backend/         # Backend en Django
│   ├── eduneyv1/              # App principal de Django
│   ├── manage.py
│   ├── requirements.txt
│   └── .env                   # Variables de entorno (NO subir al repo)
├── client/                    # Frontend en React + Vite
│   ├── src/
│   ├── vite.config.js
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
````

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

Se recomienda mantener `managed = True` en los modelos para que Django pueda crear y actualizar automáticamente las tablas en la base de datos mediante migraciones.

---

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

````md
## 🐳 Despliegue con Docker (Local o Servidor)

### Requisitos

- Docker
- Docker Compose

### Servicios en Docker

| Servicio    | Imagen         | Puerto |
| ----------- | -------------- | ------ |
| MySQL       | mysql:5.7      | 3307   |
| Backend API | python:3.10    | 8000   |
| Frontend    | node:18-alpine | 5173   |

### Levantar entorno con Docker

```bash
docker-compose up --build
```
````

Esto:

Instala dependencias

Usa wait-for-it.sh para esperar que MySQL esté listo

Ejecuta Django y React (modo desarrollo)

Frontend queda en <http://localhost:5173/>.
Para exponerlo a la red, se usa:
command: npm run dev -- --host 0.0.0.0

Para detener:

```bash
docker-compose down
```

Esto:

Instala dependencias

Usa wait-for-it.sh para esperar que MySQL esté listo

Ejecuta Django y React en modo desarrollo

Frontend disponible en: <http://localhost:5173>

Para exponer a red local:

```bash
Para exponer a red local:
npm run dev -- --host 0.0.0.0

Para detener:
docker-compose down
```

`````md
## 🔁 CI/CD Automático con GitHub Actions

### ✔️ CI – `.github/workflows/ci.yml`

Se ejecuta en cada `push`:

- `black`, `flake8` para backend
- `eslint`, `prettier` para frontend
- Pruebas automáticas
- Cache de dependencias

### 🚀 CD – `.github/workflows/deploy.yml`

Cada `push` a `develop` o `main`:

- Se conecta a la VM en Azure (vía SSH)
- Ejecuta `git pull`
- Reinicia contenedores con Docker

### 🔐 Secrets usados

````env
VM_HOST=IP pública de la VM
VM_USER=azureuser
SSH_PRIVATE_KEY=clave SSH privada
### 🔁 CI/CD Automático con GitHub Actions

## 🧼 Calidad del Código

🐍 Backend (Python)

- `flake8`: verificador de estilo
- `black`: formateador automático

```ini
# .flake8
[flake8]
exclude = migrations,venv,node_modules,__pycache__
max-line-length = 88
````
`````

```bash
# Ejecutar validaciones
flake8 .
black  .
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

🤝 Cómo Contribuir
¡Gracias por tu interés en contribuir a Udeney!

Sigue estos pasos para colaborar:

Haz un fork del repositorio.

Crea una nueva rama con tu funcionalidad o corrección:

bash
Copiar
Editar
git checkout -b nombre-de-tu-rama
Realiza tus cambios, asegurándote de seguir las normas de estilo del código.

Haz commit de tus cambios:

bash
Copiar
Editar
git commit -m "Agrega nueva funcionalidad"
Haz push a tu rama:

bash
Copiar
Editar
git push origin nombre-de-tu-rama
Abre un pull request desde tu fork hacia la rama develop.

📄 Para más detalles, consulta CONTRIBUTING.md

## 📄 Licencia

MIT License

```md
## 🤝 Autoría

Desarrollado por el equipo **Udeney**:

- **Mario Márquez**
- **Julieth Funez**
- **Jairo Cardenas**

Estudiantes de Análisis y Desarrollo de Software – SENA

## 🚧 Estado del Proyecto

🔨 En desarrollo activo – nuevas funcionalidades y mejoras están en curso
```
