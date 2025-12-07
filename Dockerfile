FROM node:24-alpine AS base
LABEL maintainer="finxol <contact@finxol.io>"
LABEL repository="https://github.com/fare-asso/fare-website"

RUN apk update
RUN apk add --no-cache libc6-compat

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
COPY schema.prisma ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of the application
COPY . .

# Build-time arguments needed for Next.js static generation
# Database connection
ARG SUPABASE_POSTGRES_PRISMA_URL
ENV SUPABASE_POSTGRES_PRISMA_URL=$SUPABASE_POSTGRES_PRISMA_URL

# Supabase client configuration (NEXT_PUBLIC_ vars are embedded at build time)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY

# Generate Prisma client
RUN pnpm exec prisma generate --no-hints

# Run database migrations
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
COPY --from=builder /app/public ./public

# Set correct permissions for prerender cache
RUN mkdir .next
RUN chown runner:runner .next

# Copy standalone build output
COPY --from=builder --chown=runner:runner /app/.next/standalone ./
COPY --from=builder --chown=runner:runner /app/.next/static ./.next/static

USER runner

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
