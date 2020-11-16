FROM node:14.13-alpine3.12

WORKDIR /var/local/api

COPY . . 

RUN npm install

# args must be passed via entrypoint in docker-compose
CMD ["npm", "run", "dev"]