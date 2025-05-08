# Stage 1: Build the React application
FROM node:24.0-slim

WORKDIR /app

# Copiar los archivos de package.json y package-lock.json (o yarn.lock)
COPY package*.json ./

# Instalar las dependencias del frontend
RUN npm install

# Copiar el resto del código del frontend
COPY . .

# Construir la aplicación React con Vite
RUN npm run build

# Stage 2: Serve the built application with Nginx
FROM nginx:alpine

# Copiar los archivos de build de la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar la configuración de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer el puerto 80 para Nginx
EXPOSE 80

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]