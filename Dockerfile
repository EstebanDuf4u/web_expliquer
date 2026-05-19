# ─────────────────────────────────────────────────────────────────────────────
# ÉTAPE 1 — Build (Node.js)
# ─────────────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --no-audit --no-fund

COPY . .

# force exécution via node (évite le binaire vite cassé)
RUN node node_modules/vite/bin/vite.js build
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
