FROM node:14.13.1-buster

WORKDIR /var/local/angular

COPY ./package.json .
#COPY ./package-lock.json .
RUN npm install

COPY *.json ./
COPY browserslist .
COPY README.md .

CMD ["npm", "run-script", "build", "--watch"]

EXPOSE 4200