<<<<<<< HEAD
FROM node:20.16-alpine3.19

WORKDIR /app

# Copiamos los archivos
COPY package*.json ./
RUN npm install

COPY . .

# Compilamos si usás TypeScript
RUN npm run build

# Usamos dotenv en el entrypoint (el código debe usarlo)
# npm i dotenv si no lo tenés

EXPOSE 3000

CMD ["node", "dist/index.js"]

=======


FROM node:20.16-alpine3.19

WORKDIR /app

# Copiamos los archivos
COPY package*.json ./
RUN npm install

COPY . .

# Compilamos si usás TypeScript
RUN npm run build

# Usamos dotenv en el entrypoint (el código debe usarlo)
# npm i dotenv si no lo tenés

EXPOSE 3000

CMD ["node", "dist/index.js"]
>>>>>>> df15d4bd34c57f3e212ddc94a87f8ef8447401b7
