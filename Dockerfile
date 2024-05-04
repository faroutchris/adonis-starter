# syntax=docker/dockerfile:1

# stage one
FROM node:20-alpine3.18 AS base
RUN apk --no-cache add dumb-init
# Create our user home dir and set owner
RUN mkdir -p /home/node/app && chown node:node /home/node/app
WORKDIR /home/node/app
USER node
RUN mkdir tmp

# stage two
FROM base AS dependencies
COPY --chown=node:node ./package*.json ./
RUN npm ci 
COPY --chown=node:node . .

# stage three
FROM dependencies AS build
RUN npm run build

# stage four
FROM base AS production
ENV NODE_ENV=production
ENV PORT=$PORT
ENV HOST=0.0.0.0
COPY --chown=node:node ./package*.json ./
RUN npm ci --omit="dev"
COPY --chown=node:node --from=build /home/node/app/build .
CMD [ "dumb-init", "node", "bin/server.js" ]
EXPOSE $PORT