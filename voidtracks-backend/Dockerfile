FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Rendi eseguibile lo script di entrypoint
RUN chmod +x ./entrypoint.sh

# Espone la porta del backend (3000)
EXPOSE 3000

# Imposta l'entrypoint personalizzato
ENTRYPOINT ["./entrypoint.sh"]