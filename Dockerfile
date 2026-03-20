FROM node:20
WORKDIR /app
COPY package*.json ./
RUN npm ci
RUN npx playwright install --with-deps
COPY . .
CMD ["npx", "playwright", "test", "--project=chromium"]
