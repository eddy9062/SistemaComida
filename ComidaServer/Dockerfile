FROM node:18-alpine
ENV DB_HOST="localhost"
ENV DB_LOCAL_PORT=5432
ENV DB_DOCKER_PORT=5432
ENV DB_USER=admin
ENV DB_PASSWORD=Atilas123*
ENV DB_DATABASE=postgres-db
WORKDIR /Server
COPY package.json . 

RUN npm install

COPY . .

EXPOSE 3000
CMD npm start
