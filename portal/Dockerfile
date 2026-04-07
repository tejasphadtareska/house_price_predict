FROM node:20-alpine AS builder

WORKDIR /app

ARG NEXT_PUBLIC_JAVA_API_URL=http://localhost:8080
ARG NEXT_PUBLIC_PYTHON_API_URL=http://localhost:3001
ENV NEXT_PUBLIC_JAVA_API_URL=$NEXT_PUBLIC_JAVA_API_URL
ENV NEXT_PUBLIC_PYTHON_API_URL=$NEXT_PUBLIC_PYTHON_API_URL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

EXPOSE 3000

ENV NEXT_PUBLIC_JAVA_API_URL=http://localhost:8080
ENV NEXT_PUBLIC_PYTHON_API_URL=http://localhost:3001

CMD ["npm", "start"]
