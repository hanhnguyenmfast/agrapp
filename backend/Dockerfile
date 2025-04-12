FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 8000 8080 8081 8082 8083

CMD ["node", "api-gateway.js"]