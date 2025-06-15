FROM node:20
WORKDIR /app

COPY package*.json prisma/ ./
COPY .env.docker .env

RUN npm install
COPY . .

RUN npx prisma generate
RUN npm run build

EXPOSE 3000

# Ejecutar migraciones y luego iniciar app
CMD npx prisma migrate deploy && npm run start:prod
