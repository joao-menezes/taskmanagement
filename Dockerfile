FROM node:18
LABEL authors="João"

WORKDIR /src

COPY package*.json ./
RUN npm install

COPY . .
 
EXPOSE 3000

CMD ["npm", "start"]
