# Development stage
FROM node:20-alpine AS development

WORKDIR /app

# Clear npm cache
RUN npm cache clean --force

COPY package*.json ./
COPY .npmrc ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "dev"]

# Builder stage - compiles TypeScript
FROM node:20-alpine AS builder

WORKDIR /app

RUN npm cache clean --force

COPY package*.json ./
COPY .npmrc ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage
FROM node:20-alpine AS production

WORKDIR /app

RUN npm cache clean --force

COPY package*.json ./
COPY .npmrc ./

RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

EXPOSE 5000

CMD ["npm", "start"]
