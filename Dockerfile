FROM node:lts

WORKDIR /app

ADD . /app/

EXPOSE 8080

RUN npm install http-server -g

#RUN npm install && npm run build
RUN npm install && bash build.sh

CMD http-server ./dist
