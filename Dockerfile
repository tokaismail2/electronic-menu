FROM node:20-alpine


WORKDIR /app

# Install build tools for native deps
RUN apk add --no-cache \
    tzdata \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Copy only package files (cache-friendly)
COPY package*.json ./

# Install ALL dependencies (dev + prod)
RUN npm ci

# Copy source code
COPY . .

# Expose dev port
EXPOSE 5000

# Run with hot reload
CMD ["npm", "run", "dev"]
