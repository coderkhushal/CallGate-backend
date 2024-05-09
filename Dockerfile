FROM node:16-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

## following 3 lines are for installing ffmepg
RUN apk update
RUN apk add
RUN apk add ffmpeg

COPY . .

EXPOSE 5000

RUN npm run build

CMD [ "node", "dist/src/index.js" ]
