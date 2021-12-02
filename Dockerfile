##
## digiserve/ab-api-sails:develop
##
## This is our microservice for handling all our incoming AB
## api requests.
##
## Docker Commands:
## ---------------
## $ docker build -t digiserve/ab-api-sails:develop .
## $ docker push digiserve/ab-api-sails:develop
##

FROM digiserve/service-cli:develop

COPY . /app

WORKDIR /app

RUN npm install

CMD ["node", "--inspect=0.0.0.0:9229", "app_waitMysql.js"]
