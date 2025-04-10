# # --- Etapa de construcción ---
# FROM node:20.16-alpine3.19 AS builder

# WORKDIR /build
# COPY package.json yarn.lock ./
# RUN yarn install --frozen-lockfile && yarn cache clean
# COPY . .
# RUN yarn build

# # --- Etapa de producción ---
# FROM node:20.16-alpine3.19

# WORKDIR /app
# # Copia solo lo necesario desde la etapa de construcción
# COPY --from=builder /build/package.json /build/yarn.lock ./
# COPY --from=builder /build/node_modules ./node_modules
# COPY --from=builder /build/dist ./dist

# Variables de entorno (se sobrescribirán en ECS)
# ENV DB_DATABASE="" \
#     DB_USER="" \
#     DB_PASSWORD="" \
#     DB_HOST="" \
#     JWT_SECRET="" \
#     NODE_ENV="production"


# ENV DB_DATABASE=process.env.DB_DATABASE
# ENV DB_USER=process.env.DB_USER
# ENV DB_PASSWORD=process.env.DB_PASSWORD,
# ENV DB_HOST=process.env.DB_HOST,
# ENV JWT_SECRET=process.env.JWT_SECRET


# EXPOSE 8000
# CMD ["node", "dist/index.js"]

# Stage 1: Build
FROM node:20.16-alpine3.19 AS builder

WORKDIR /build

# 1. Copia solo los archivos necesarios para instalar dependencias
COPY package.json yarn.lock ./

# 2. Instala TODAS las dependencias (incluyendo devDependencies para el build)
RUN yarn install --frozen-lockfile --production=false

# 3. Copia el resto del código y construye
COPY . .
RUN yarn build

# ---

# Stage 2: Production (imagen final ligera)
FROM node:20.16-alpine3.19

WORKDIR /app

# 4. Copia solo lo necesario desde la etapa de construcción
COPY --from=builder /build/package.json /build/yarn.lock ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist

# 5. Instala SOLO dependencias de producción (opcional, para limpieza)
RUN yarn install --frozen-lockfile --production && yarn cache clean

# 6. Variables de entorno (puedes pasarlas también via `docker run -e`)
# ENV DB_DATABASE="supermercado" \
#     DB_USER="postgres" \
#     DB_PASSWORD="jarry" \
#     DB_HOST="host.docker.internal" \
#     JWT_SECRET="IFALLELSE1998" \
#     NODE_ENV="production"

ENV DB_DATABASE="pesp-db2" \
    DB_USER="jarry" \
    DB_PASSWORD="IfAllElse1998" \
    DB_HOST="pesp-db2.cncqeaswmahq.us-east-2.rds.amazonaws.com" \
    JWT_SECRET=IFALLELSE1998 \
    EMAIL_USER="manchestercold@gmail.com" \
    EMAIL_PASS="atev hhpt vzjm wmwk" 
    EXPOSE 8000
    CMD ["node", "dist/index.js"]