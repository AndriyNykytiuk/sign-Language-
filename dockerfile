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
# Without production mode the server uses a temporary in-memory DB
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev
COPY . .

# Copy built frontend from builder stage
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Create tables and default data if missing (safe to rerun), then start the server
CMD ["sh", "-c", "node seed.js && node server.js"]
