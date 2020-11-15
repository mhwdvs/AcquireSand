FROM node:14.13-alpine3.12

WORKDIR /var/local/api

COPY package.json .
COPY package-lock.json .

RUN ls
RUN npm install

CMD ["npm", "run", "dev"]