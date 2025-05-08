# Dockerfile.dev 🧪
FROM node:18-alpine

WORKDIR /app

# Copia los archivos de dependencias primero
COPY package*.json ./

RUN npm install

# Copia el resto del código
COPY . .

# Expone el puerto usado por Vite
EXPOSE 5173

# Usa el servidor de desarrollo
CMD ["npm", "run", "dev"]




