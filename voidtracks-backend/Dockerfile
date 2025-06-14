FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Espone la porta del backend (3000)
EXPOSE 3000

CMD ["npm", "run", "dev"]