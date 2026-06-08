# syntax=docker/dockerfile:1.10

FROM node:24-alpine AS base
LABEL maintainer="finxol <contact@finxol.io>"
LABEL repository="https://github.com/fare-asso/fare-website"

RUN apk update
RUN apk add --no-cache libc6-compat curl

ENV NEXT_TELEMETRY_DISABLED=1
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

# Copy package files first for better caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Generate Prisma client (schema only, no DB connection needed)
RUN pnpm exec prisma generate --no-hints

# Public (NEXT_PUBLIC_*) vars are baked into the client bundle — fine as ARG/ENV
ARG NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL

ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL

ARG NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY
ENV NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY=$NEXT_PUBLIC_FRIENDLY_CAPTCHA_SITE_KEY

ARG NEXT_PUBLIC_SENTRY_DSN
ENV NEXT_PUBLIC_SENTRY_DSN=$NEXT_PUBLIC_SENTRY_DSN

# Non-sensitive SMTP config (host/port/etc.) — kept as ARG so values flow through
ARG SMTP_PORT
ENV SMTP_PORT=$SMTP_PORT

ARG SMTP_SECURE
ENV SMTP_SECURE=$SMTP_SECURE

# Migrate + seed permissions + build with secrets exposed only for this RUN via BuildKit env-mounted secrets.
# `prisma db seed` makes the codebase the source of truth for permissions
# (upserts the canonical set and prunes any that were removed from the code).
RUN --mount=type=secret,id=SUPABASE_POSTGRES_PRISMA_URL,env=SUPABASE_POSTGRES_PRISMA_URL \
    --mount=type=secret,id=SUPABASE_POSTGRES_PRISMA_DIRECT_URL,env=SUPABASE_POSTGRES_PRISMA_DIRECT_URL \
    --mount=type=secret,id=SUPABASE_SERVICE_ROLE_KEY,env=SUPABASE_SERVICE_ROLE_KEY \
    --mount=type=secret,id=FRIENDLY_CAPTCHA_API_KEY,env=FRIENDLY_CAPTCHA_API_KEY \
    --mount=type=secret,id=SMTP_HOST,env=SMTP_HOST \
    --mount=type=secret,id=SMTP_USER,env=SMTP_USER \
    --mount=type=secret,id=SMTP_PASS,env=SMTP_PASS \
    --mount=type=secret,id=SMTP_FROM_EMAIL,env=SMTP_FROM_EMAIL \
    pnpm exec prisma migrate deploy && pnpm exec prisma db seed && pnpm run build

####################
### RUNNER STAGE ###
####################
FROM base AS runner

# Don't run production as root
RUN addgroup --system --gid 1001 runner
RUN adduser --system --uid 1001 runner

# Copy public assets
COPY --from=builder --chown=runner:runner /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown runner:runner .next

# Copy standalone build output
COPY --from=builder --chown=runner:runner /app/.next/standalone ./
COPY --from=builder --chown=runner:runner /app/.next/static ./.next/static

# Copy Prisma files for runtime migrations
COPY --from=builder --chown=runner:runner /app/prisma ./prisma

USER runner

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
