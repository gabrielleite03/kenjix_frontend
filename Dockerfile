# Estágio 1: Build da Aplicação
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --configuration=production

# Estágio 2: Servir a Aplicação com NGINX
FROM nginx:alpine
# Copia o build da etapa anterior para o diretório do NGINX
COPY --from=build /app/dist/app/browser /usr/share/nginx/html
# Copia uma configuração personalizada do nginx se necessário
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]