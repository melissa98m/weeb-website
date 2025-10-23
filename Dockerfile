# Image de dev React (Vite)
FROM node:20-bookworm

WORKDIR /app

# Installe vite si besoin + dépendances (rapide si lock présent)
COPY package*.json ./
RUN npm ci || true

# Copie (utile si tu build sans volume)
COPY . .

# Vite écoute sur 5173
EXPOSE 5173

# File watching fiable dans Docker
ENV CHOKIDAR_USEPOLLING=true
ENV WATCHPACK_POLLING=true

# Lance le serveur Vite en exposant toutes les interfaces
CMD ["bash", "-lc", "npm install && npm run dev -- --host 0.0.0.0 --port 5173"]
