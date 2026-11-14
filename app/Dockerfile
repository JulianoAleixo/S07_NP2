# Estágio de build: gera o site estático do Astro em /app/dist.
FROM node:22.23.4-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# As variáveis PUBLIC_* são embutidas no JavaScript durante o build, por isso entram como ARG.
# Os valores reais nunca ficam na imagem: o compose passa valores falsos, e o Cypress intercepta o EmailJS.
ARG PUBLIC_EMAILJS_SERVICE_ID
ARG PUBLIC_EMAILJS_TEMPLATE_ID
ARG PUBLIC_EMAILJS_PUBLIC_KEY
RUN npm run build

# Estágio final: só o nginx com os arquivos prontos, sem Node.
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
