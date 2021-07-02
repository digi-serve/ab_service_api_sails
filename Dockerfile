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

RUN git clone --recursive https://github.com/appdevdesigns/ab_service_api_sails.git app && cd app && git checkout develop && npm install

WORKDIR /app

CMD ["node", "--inspect=0.0.0.0:9229", "app_waitMysql.js"]
