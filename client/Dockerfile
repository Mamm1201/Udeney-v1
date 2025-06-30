# Usamos imagen ligera de Node
FROM node:18-alpine

# Establecemos directorio de trabajo
WORKDIR /app

# Copiamos los archivos necesarios para instalar dependencias
COPY package.json package-lock.json* ./

# Instalamos dependencias
RUN npm install

# Copiamos el resto del código
COPY . .

# Exponemos el puerto de desarrollo
EXPOSE 5173

RUN rm -rf node_modules/.vite

# Comando por defecto
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
