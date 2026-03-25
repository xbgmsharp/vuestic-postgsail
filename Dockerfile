FROM node:lts AS builder

ARG VITE_PGSAIL_URL
ARG VITE_GRAFANA_URL
ARG VITE_APP_TITLE

WORKDIR /app

COPY . /app/

#RUN npm install && npm run build
RUN npm install && bash build.sh

# Stage 2: Runtime
FROM node:lts

RUN npm install http-server -g

# Copy built frontend into the server static directory
COPY --from=builder /app/dist dist/

CMD ["http-server", "dist", "-p", "8080"]

EXPOSE 8080

# Configuration Parameters
LABEL maintainer="PostgSail - https://github.com/xbgmsharp/vuestic-postgsail"
LABEL org.opencontainers.image.description="PostgSail - An open source PostgreSQL-based marine vessel tracking and monitoring platform."
LABEL org.opencontainers.image.source="https://github.com/xbgmsharp/vuestic-postgsail"
LABEL org.opencontainers.image.licenses="Apache-2.0"
LABEL org.opencontainers.image.title="PostgSail"
LABEL org.opencontainers.image.url="https://github.com/xbgmsharp/vuestic-postgsail"
LABEL org.opencontainers.image.vendor="Francois Lacroix"
LABEL org.opencontainers.image.version="latest"
