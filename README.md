# Backend Solutions For the Node Ippon Course

## Description

This repository contains the backend solutions of the exercices proposed in the Node Ippon Course.

It illustrate the usage of TSOA library (https://tsoa-community.github.io/docs/) to automatically generate the open-api documentation of the typescript routes based on typescript type inference using decorators (same as Java annotations on a spring project)

It also illustrate the usage of Prisma to connect to mongodb and postgres databases by generating prisma clients.
Prisma shines by its simplicity of use and its typescript inference and completion features.

### How to use the respository

1. **Create a .env file from .env.example :**

   ```bash
   cp .env.example .env
   ```

2. **Generate prisma clients for Mongo and postgres databases :**

	Mongo
   ```bash
   cd database-mongo
   rm -rf prisma/generated
   npx prisma generate
   ```

   Postgres
   ```bash
   cd database-postgres
   rm -rf prisma/generated
   npx prisma generate
   ```

3. **Install dependencies :**

   ```bash
   npm i
   ```

4. **Launch Docker Mongo and Docker Postgres :**

   ```bash
   ./docker-compose/docker-compose-up.sh mongo && ./docker-compose/docker-compose-up.sh postgres
   ```

5. **Launch Project in development Mode :**

   ```bash
   npm run dev
   ```

You can also build the project and run it in production mode

1. **Launch Project in development Mode :**

   ```bash
   npm run build
   ```

2. **Launch Project in development Mode :**

   ```bash
   npm run start
   ```
