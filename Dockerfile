FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
# generated prisma files
COPY prisma ./prisma/
# COPY ENV variable
COPY .env ./
COPY . .
RUN npm install --production --silent && mv node_modules ../
RUN npx prisma generate
RUN chown -R node /usr/src/node_modules/.prisma
WORKDIR /usr/src/app/client
ENV REACT_APP_API_URL=https://crimsonlms.nlaha.com
RUN npm install --production --silent && npm run build
WORKDIR /usr/src/app
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]
