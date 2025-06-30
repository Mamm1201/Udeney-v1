# Usamos una imagen de Node.js versión 20
FROM node:20-alpine

# Establecemos el directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos los archivos necesarios para instalar las dependencias
COPY package.json package-lock.json* ./

# Instalamos las dependencias
RUN npm install

# Copiamos el resto del código fuente
COPY . .

# Exponemos el puerto utilizado por Vite
EXPOSE 5173

# Eliminamos caché de Vite si existiera (opcional)
RUN rm -rf node_modules/.vite

# Comando por defecto para iniciar la app en modo desarrollo
CMD ["npm", "run", "dev"]
