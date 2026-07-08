# syntax=docker/dockerfile:1.10

FROM node:24-alpine AS base
LABEL maintainer="finxol <contact@finxol.io>"
LABEL repository="https://github.com/fare-asso/fare-website"

RUN apk add --no-cache libc6-compat curl

ENV HUSKY=0
ENV NODE_ENV=production

WORKDIR /app

#####################
### BUILDER STAGE ###
#####################
FROM base AS builder

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN npm install -g corepack@latest
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm exec prisma generate --no-hints

ARG PUBLIC_SUPABASE_URL
ENV PUBLIC_SUPABASE_URL=$PUBLIC_SUPABASE_URL

ARG PUBLIC_SUPABASE_ANON_KEY
ENV PUBLIC_SUPABASE_ANON_KEY=$PUBLIC_SUPABASE_ANON_KEY

ARG PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY
ENV PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY=$PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY

ARG PUBLIC_SENTRY_DSN
ENV PUBLIC_SENTRY_DSN=$PUBLIC_SENTRY_DSN

# Mock values to pass build-time validation; real values are injected at runtime.
ENV SUPABASE_POSTGRES_PRISMA_URL="build" \
    SUPABASE_SERVICE_ROLE_KEY="build" \
    FRIENDLY_CAPTCHA_API_KEY="build" \
    SMTP_HOST="build" \
    SMTP_USER="build" \
    SMTP_PASS="build" \
    SMTP_FROM_EMAIL="build@example.com"

RUN --mount=type=secret,id=SUPABASE_POSTGRES_PRISMA_DIRECT_URL,env=SUPABASE_POSTGRES_PRISMA_DIRECT_URL \
    --mount=type=secret,id=SENTRY_AUTH_TOKEN,env=SENTRY_AUTH_TOKEN \
    pnpm exec prisma migrate deploy && pnpm exec prisma db seed && pnpm run build

RUN pnpm prune --prod

####################
### RUNNER STAGE ###
####################
FROM base AS runner

# Don't run production as root
RUN addgroup --system --gid 1001 runner
RUN adduser --system --uid 1001 runner

COPY --from=builder --chown=runner:runner /app/node_modules ./node_modules
COPY --from=builder --chown=runner:runner /app/dist ./dist
COPY --from=builder --chown=runner:runner /app/public ./public
COPY --from=builder --chown=runner:runner /app/package.json ./package.json

USER runner

EXPOSE 3000

ENV HOST="0.0.0.0"
ENV PORT=3000

CMD ["node", "./dist/server/entry.mjs"]
