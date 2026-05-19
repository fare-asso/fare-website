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

# Build-time arguments needed for Next.js static generation
# Database connection
ARG SUPABASE_POSTGRES_PRISMA_URL
ENV SUPABASE_POSTGRES_PRISMA_URL=$SUPABASE_POSTGRES_PRISMA_URL

ARG SUPABASE_POSTGRES_PRISMA_DIRECT_URL
ENV SUPABASE_POSTGRES_PRISMA_DIRECT_URL=$SUPABASE_POSTGRES_PRISMA_DIRECT_URL

# Generate Prisma client
RUN pnpm exec prisma generate --no-hints

########################################################################
# Pass all env vars for env validation at pre-rendering
# Server-side environment variables
ARG FRIENDLY_CAPTCHA_API_KEY
ENV FRIENDLY_CAPTCHA_API_KEY=$FRIENDLY_CAPTCHA_API_KEY

ARG SUPABASE_SERVICE_ROLE_KEY
ENV SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_ROLE_KEY

ARG SMTP_HOST
ENV SMTP_HOST=$SMTP_HOST

ARG SMTP_PORT
ENV SMTP_PORT=$SMTP_PORT

ARG SMTP_SECURE
ENV SMTP_SECURE=$SMTP_SECURE

ARG SMTP_USER
ENV SMTP_USER=$SMTP_USER

ARG SMTP_PASS
ENV SMTP_PASS=$SMTP_PASS

ARG SMTP_FROM_EMAIL
ENV SMTP_FROM_EMAIL=$SMTP_FROM_EMAIL

# Client-side environment variables
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
########################################################################

# Run Prisma migrations
RUN pnpm exec prisma migrate deploy


# Build the application
RUN pnpm run build

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
