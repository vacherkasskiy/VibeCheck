# Multi-stage build
# Stage 1: Build the application
FROM node:20-alpine as builder

WORKDIR /app
ARG API_URL=http://localhost:8080
ENV API_URL=$API_URL
# Stage 1: Install dependencies and build
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with nginx
FROM nginx:alpine
ARG NGINX_CONF=nginx.conf
COPY --from=builder /app/build /usr/share/nginx/html
COPY ${NGINX_CONF} /etc/nginx/conf.d/default.conf

# Start nginx
CMD ["nginx", "-g", "daemon off;"]
