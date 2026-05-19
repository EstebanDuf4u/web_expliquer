# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 1 — Build (Node.js)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de dépendances en premier (optimise le cache Docker)
COPY package.json package-lock.json* ./

RUN npm ci --no-audit --no-fund

# Copie du code source
COPY . .

# Build de production (génère /app/dist)
RUN npm run build

# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 2 — Serve (Nginx)
# ─────────────────────────────────────────────────────────────────────────────
FROM nginx:1.27-alpine AS production

# Copie du build depuis l'étape précédente
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie de la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
