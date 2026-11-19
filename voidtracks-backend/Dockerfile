FROM node:22-alpine

WORKDIR /app

RUN apk add --no-cache ffmpeg python3 py3-pip \
    && python3 -m venv /opt/yt-dlp
ARG YT_DLP_VERSION=2026.10.26
RUN /opt/yt-dlp/bin/pip install --no-cache-dir "yt-dlp[default]==${YT_DLP_VERSION}"
ENV PATH="/opt/yt-dlp/bin:${PATH}"

COPY package*.json ./
RUN npm ci --include=dev

COPY . .

# Rendi eseguibile lo script di entrypoint
RUN npm run build && chmod +x ./entrypoint.sh

# Espone la porta del backend (3000)
EXPOSE 3000

# Imposta l'entrypoint personalizzato
ENTRYPOINT ["./entrypoint.sh"]
