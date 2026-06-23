# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files and install all dependencies
COPY package*.json ./
RUN npm ci

# Copy the rest of the application files
COPY . .

# Set environment variables for build time (e.g. backend API url)
ENV NEXT_PUBLIC_API_URL=http://localhost:5000/api
ENV BACKEND_URL=http://server:5000
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

ENV PORT=3000
ENV NODE_ENV=production
ENV HOSTNAME="0.0.0.0"

# Copy built standalone app and assets from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
