FROM node:18-bullseye

# Install Icarus Verilog (RTL simulator)
RUN apt-get update && apt-get install -y iverilog && apt-get clean

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install node dependencies
RUN npm install

# Copy rest of backend
COPY . .

# Create folders for uploads and runtime jobs
RUN mkdir -p uploads runtime_jobs

# Expose backend port
EXPOSE 3000

# Start backend
CMD ["node", "server.js"]
