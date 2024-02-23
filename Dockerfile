FROM node:lts

ARG VITE_PGSAIL_URL
ARG VITE_GRAFANA_URL
ARG VITE_APP_TITLE

WORKDIR /app

ADD . /app/

EXPOSE 8080

RUN npm install http-server -g

#RUN npm install && npm run build
RUN npm install && bash build.sh

CMD http-server ./dist
