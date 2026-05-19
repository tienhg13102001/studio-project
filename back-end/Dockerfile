FROM node:22-alpine

WORKDIR /app

# Install dependencies (includes devDeps for tsx runner)
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# Copy source
COPY . .

EXPOSE 4000

CMD ["yarn", "start"]
