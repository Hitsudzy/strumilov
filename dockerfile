FROM node:alpine
WORKDIR /usr/app/front
EXPOSE 3005
COPY ./ ./
RUN npm install
CMD ["npm", "start"]

