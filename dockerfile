# ==========================================
# Stage 1: Builder (Compiles the TypeScript)
# ==========================================
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files and install ALL dependencies (including devDependencies)
COPY package*.json ./
RUN npm ci

# Copy the rest of the source code and build it
COPY . .
RUN npm run build


# ==========================================
# Stage 2: Runner (The final, tiny image)
# ==========================================
FROM node:22-alpine AS runner

WORKDIR /app

# Tell Node.js we are running in production mode
ENV NODE_ENV=production

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy ONLY the compiled javascript from the 'builder' stage
COPY --from=builder /app/dist ./dist

# Start the CLI
CMD ["node", "dist/index.js"]