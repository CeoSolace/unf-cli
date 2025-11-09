FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy the entire project into the container
COPY . .

# Install pnpm globally and install dependencies
RUN npm install -g pnpm && pnpm install

# Specify the default command to run the server
CMD ["pnpm", "start"]