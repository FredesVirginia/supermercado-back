FROM node:20.16-alpine3.19 AS base

# Change the working directory to /build
WORKDIR /build

# Copy the package.json and package-lock.json files to the /build directory
COPY package.json yarn.lock ./

ENV DB_DATABASE="supermercado"
ENV DB_USER="postgres"
ENV DB_PASSWORD="jarry"
ENV DB_HOST="host.docker.internal"
ENV JWT_SECRET=IFALLELSE1998
# Install production dependencies and clean the cache
RUN yarn 

# Copy the entire source code into the container
COPY . .

RUN yarn build 
# Document the port that may need to be published
EXPOSE 8000

# Start the application
CMD ["node", "dist/src/index.js"]