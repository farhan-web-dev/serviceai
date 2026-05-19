# Use the official Node.js 18 Alpine image for a small footprint
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json first to leverage Docker cache
COPY package*.json ./

# Install only production dependencies
RUN npm install --production

# Copy the rest of the application source code
COPY . .

# Google Cloud Run injects the PORT environment variable (default 8080)
# Our server.js already uses process.env.PORT || 5000, which will adapt perfectly.
ENV PORT=8080
EXPOSE 8080

# Start the Node.js Express server
CMD ["node", "server.js"]
