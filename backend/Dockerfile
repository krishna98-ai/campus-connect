FROM node:20-alpine

WORKDIR /app

# Install dependencies first (layer caching)
COPY package*.json ./
RUN npm ci --only=production

# Copy source
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S campus -u 1001
USER campus

EXPOSE 5000

CMD ["node", "server.js"]
