
FROM node:20.16-alpine3.19

WORKDIR /app


COPY package*.json ./
RUN npm install

COPY .env .env
COPY . .


RUN npm run build



EXPOSE 3000

CMD ["node", "dist/src/index.js"]

