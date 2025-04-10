FROM node:20.16-alpine3.19 AS base

# Change the working directory to /build
WORKDIR /build

# Copy the package.json and package-lock.json files to the /build directory
COPY package.json yarn.lock ./

ENV DB_DATABASE=process.env.DB_DATABASE
ENV DB_USER=process.env.DB_USER
ENV DB_PASSWORD=process.env.DB_PASSWORD,
ENV DB_HOST=process.env.DB_HOST,
ENV JWT_SECRET=process.env.JWT_SECRET
# Install production dependencies and clean the cache
RUN yarn 

# Copy the entire source code into the container
COPY . .

RUN yarn build 
# Document the port that may need to be published
EXPOSE 8000

# Start the application
CMD ["node", "dist/src/index.js"]