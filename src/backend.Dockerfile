FROM node:lts-alpine
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN npm install -g npm@latest

COPY common /home/node/common
WORKDIR /home/node/common
RUN npm i

COPY backend /home/node/app
WORKDIR /home/node/app
RUN npm i

EXPOSE 8000
ENTRYPOINT ["/usr/bin/env", "npm"]
CMD ["start"]
