FROM node:18-alpine

WORKDIR /app

# copy dependency manifests first (cache)
COPY package*.json ./

# install all deps (dev + prod)
RUN npm install

# copy source
COPY . .

# build
RUN npm run build

# remove dev dependencies
RUN npm prune --production

# set environment
ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000

# run the built app
CMD ["node", "dist/main"]
