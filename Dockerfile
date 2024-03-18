FROM node:21-slim

RUN npm install --global @google/clasp

RUN apt-get update && apt-get install -y curl \
    && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["sh"]