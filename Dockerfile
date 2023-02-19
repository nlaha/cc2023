FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# generated prisma files
COPY prisma ./prisma/
COPY . .
RUN npm install --production --silent && mv node_modules ../
RUN npx prisma generate
WORKDIR /usr/src/app/client
RUN npm install --production --silent && npm run build
WORKDIR /usr/src/app
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
