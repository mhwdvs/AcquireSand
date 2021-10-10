FROM node:14

WORKDIR /var/local/angular

COPY ./package.json .
#COPY ./package-lock.json .
RUN npm install

COPY *.json ./
COPY browserslist .
COPY README.md .

CMD ["npm", "run-script", "buildwatch"]

EXPOSE 4200
