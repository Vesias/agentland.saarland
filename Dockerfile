# Dockerfile for agent.saarland project

# 1. Base Image
# Use an official Node.js runtime as a parent image
# Using a specific LTS version is recommended for stability (e.g., Node 20)
FROM node:20-slim AS base

# Set the working directory in the container
WORKDIR /usr/src/app

# 2. Install Dependencies
# Copy package.json and package-lock.json (or yarn.lock)
# Install dependencies before copying source code to leverage Docker cache
COPY package.json ./
COPY package-lock.json* ./
# If you have a shrinkwrap file, copy it too
# COPY npm-shrinkwrap.json ./

# Install project dependencies
# Using --legacy-peer-deps for potential peer dependency issues in complex monorepos
# For production builds, consider `npm ci --only=production` in a later stage
RUN npm install --legacy-peer-deps

# 3. Copy Source Code
# Copy the rest of the application's source code
COPY . .

# 4. Build the Application (if necessary for tests)
# This project uses Nx, so a build step might be required
# The build command is `nx run-many --target=build`
RUN npm run build

# 5. Expose Ports (if any service needs to be accessible, e.g., for API tests)
# EXPOSE 3000

# 6. Default Command to Run Tests
# The test command is `nx run-many --target=test`
CMD ["npm", "run", "test"]

# Optional: Add a healthcheck if you plan to run services
# HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
#   CMD curl -f http://localhost:3000/health || exit 1

# --- Development Stage (Optional, for faster local development iteration) ---
# FROM base AS development
# WORKDIR /usr/src/app
# COPY --from=base /usr/src/app/node_modules ./node_modules
# COPY . .
# Expose any ports needed for development (e.g., dev server, debugger)
# EXPOSE 3000 9229
# Command to run development server (adjust as needed)
# CMD ["npm", "run", "dev"]