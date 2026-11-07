# Estágio de build: o TypeScript e os tipos são devDependencies, que não vão para a imagem final.
FROM node:22.23.4-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Estágio final: só o JavaScript compilado e as dependências de produção.
FROM node:22.23.4-alpine
# Em production, o Express não devolve o stack trace nas respostas de erro.
ENV NODE_ENV=production
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/server.js"]
