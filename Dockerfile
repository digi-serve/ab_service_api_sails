##
## digiserve/ab-api-sails:master
##
## This is our microservice for handling all our incoming AB
## api requests.
##
## Docker Commands:
## ---------------
## $ docker build -t digiserve/ab-api-sails:master .
## $ docker push digiserve/ab-api-sails:master
##
ARG BRANCH=master

FROM digiserve/service-cli:${BRANCH}

COPY . /app

WORKDIR /app

RUN npm i -f

ENV NODE_ENV=production

WORKDIR /app

CMD ["node", "--inspect=0.0.0.0:9229", "app_waitMysql.js"]
