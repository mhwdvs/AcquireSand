FROM node:14.13-alpine3.12

WORKDIR /var/local/angular

RUN pwd
COPY ./package.json .
COPY ./package-lock.json .
RUN npm install

COPY . .

RUN touch ifoundyou

CMD ["ng", "serve"]

EXPOSE 80 443