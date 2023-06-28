FROM node:lts

WORKDIR /app

ADD . /app/

EXPOSE 8080

RUN npm install http-server -g

RUN echo VITE_PGSAIL_URL=https://api.openplotter.cloud > .env.production.local
RUN echo VITE_APP_INCLUDE_DEMOS=false >> .env.production.local
RUN echo VITE_APP_BUILD_VERSION=true >> .env.production.local
RUN echo VITE_APP_TITLE=PostgSail >> .env.production.local

#RUN npm install && npm run build
RUN npm install && bash build.sh

CMD http-server ./dist
