FROM node:alpine As development

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY tsconfig.json tsconfig.json
COPY nest-cli.json nest-cli.json
COPY apps/reservations/package.json apps/reservations/package.json

RUN npm install -g pnpm

RUN pnpm install

COPY apps/reservations apps/reservations
COPY libs libs

RUN pnpm -w run build reservations

FROM node:alpine as production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

WORKDIR /usr/src/app

COPY package.json ./
COPY pnpm-lock.yaml ./
COPY pnpm-workspace.yaml ./
COPY apps/reservations/package.json apps/reservations/package.json

RUN npm install -g pnpm

RUN pnpm install --prod

COPY --from=development /usr/src/app/dist ./dist
COPY --from=development /usr/src/app/apps/reservations/prisma.config.ts ./apps/reservations/prisma.config.ts
COPY --from=development /usr/src/app/apps/reservations/prisma ./apps/reservations/prisma

CMD ["sh", "-c", "cd apps/reservations && pnpm prisma migrate deploy && cd ../.. && node dist/apps/reservations/main"]
