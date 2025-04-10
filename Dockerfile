# --- Etapa de construcción ---
FROM node:20.16-alpine3.19 AS builder

WORKDIR /build
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile && yarn cache clean
COPY . .
RUN yarn build

# --- Etapa de producción ---
FROM node:20.16-alpine3.19

WORKDIR /app
# Copia solo lo necesario desde la etapa de construcción
COPY --from=builder /build/package.json /build/yarn.lock ./
COPY --from=builder /build/node_modules ./node_modules
COPY --from=builder /build/dist ./dist

# Variables de entorno (se sobrescribirán en ECS)
# ENV DB_DATABASE="" \
#     DB_USER="" \
#     DB_PASSWORD="" \
#     DB_HOST="" \
#     JWT_SECRET="" \
#     NODE_ENV="production"


ENV DB_DATABASE=process.env.DB_DATABASE
ENV DB_USER=process.env.DB_USER
ENV DB_PASSWORD=process.env.DB_PASSWORD,
ENV DB_HOST=process.env.DB_HOST,
ENV JWT_SECRET=process.env.JWT_SECRET


EXPOSE 8000
CMD ["node", "dist/index.js"]