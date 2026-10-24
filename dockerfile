# Stage 1: Build the React frontend
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Setup the Node.js backend
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Start server
CMD ["node", "server.js"]
