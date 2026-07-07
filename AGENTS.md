# AGENTS.md

Guide for AI coding agents working on the FARE Website project.

## Project Overview

A modern TanStack Start full-stack application for Fédération des Associations du Réseau Étudiant de Haute-Bretagne (FARE), a student federation network. Features include:

- Public website with project showcases (Bouge-ta-Prison, BagadAsso, Agorae)
- Admin dashboard for content, associations, events, and memberships
- Contact forms with CAPTCHA protection
- Email notifications and rich-text content editing

**Tech Stack:** pnpm, TanStack Start (file-based routes in `src/app`, `createFileRoute`), Vite 8 + Nitro build, React 19 (React Compiler enabled via `@rolldown/plugin-babel` preset), TypeScript, Tailwind CSS, Shadcn/ui, Prisma, Supabase PostgreSQL, Nodemailer, react-email

---

## Setup Commands

```bash
# Install dependencies (required - pnpm enforced)
pnpm install

# Start development server (vite dev)
pnpm run dev

# Email template development
pnpm run email:dev

# Build for production (vite build → Nitro output in .output/)
pnpm run build

# Start production server (node .output/server/index.mjs)
pnpm run start

# Type checking
pnpm run check:types

# Linting and formatting
pnpm run lint              # Fix issues
pnpm run check:lint        # Check without fixing (CI mode)
pnpm run format            # Format code

# Code quality
pnpm run knip              # Find unused code/dependencies
```

Always use `pnpm`, never use `npm`

---

## Code Style & Conventions

### Type Safety

- **TypeScript strict mode** is enforced
- All functions must have return type annotations
- No `any` types unless absolutely necessary with `// @ts-expect-error` comments
- Use Zod schemas for runtime validation of form inputs and API data
- Validate environment variables at build time via `src/env.server.ts` and `src/env/client.ts` (imported by `vite.config.ts`)

### Imports & Exports

- **Use `export type` for TypeScript types and interfaces:** `export type MyType = { ... }`
- **Use ES modules:** `import ... from "..."` (not CommonJS `require`)
- Use Node.js import protocol for standard library: `import fs from "node:fs"`
- Imports are auto-sorted by oxfmt (`sortImports`); oxlint enforces type-only imports/exports (`consistent-type-imports`, `consistent-type-exports`)
- Path aliases: `@/` for `src/` (configured in tsconfig.json)

### Formatting & Linting

- **oxlint** (linting) and **oxfmt** (formatting) are the source of truth (replace ESLint, Prettier, and Biome). Config: `oxlint.config.ts`, `oxfmt.config.ts`
- Format with `pnpm format` (oxfmt) and lint-fix with `pnpm lint` (oxlint) before committing
- **Line width:** 80 characters (oxfmt `printWidth`)
- **Indentation:** 4 spaces (oxfmt `tabWidth: 4`, `useTabs: false`)
- **No semicolons** (oxfmt `semi: false`)
- **Quote style:** Double quotes for JSX and strings (oxfmt `singleQuote: false`, `jsxSingleQuote: false`)
- **Naming:** camelCase for variables/functions, PascalCase for components/types, CONSTANT_CASE for constants
- oxlint checks accessibility (a11y) and React patterns
- Tailwind classes auto-sorted by oxfmt (`sortTailwindcss`, functions: `cn`, `twMerge`, `cva`)

### Component Patterns

- **Colocation:** Keep components near their usage, avoid global component dumps
- **Shadcn/ui:** Use existing components from `src/components/ui/` first, install using shadcn cli with pnpm if necessary
- **Tailwind CSS:** Utility-first styling, no custom CSS unless necessary
- **Server vs Client:** No `"use server"`/`"use client"` directives. Server-only code (Prisma, Supabase, SMTP) must run inside `createServerFn` handlers or server route handlers — never at module top level of client-reachable code. The Vite build mocks server-only modules out of the client bundle (`importProtection: { behavior: "mock" }`), so accidental client access throws at runtime
- **Navigation:** `Link` from `@/components/link` (compat wrapper, `href` prop) or the typed router `Link` from `@tanstack/react-router`; `useLocation`/`useNavigate`/`useRouter` from `@tanstack/react-router`
- **Images:** `Image` from `@/components/image` (unpic-based wrapper) — there is no next/image optimizer
- Components must have TypeScript prop type. e.g.:
    ```tsx
    interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
      variant?: 'primary' | 'secondary';
    }
    export function Button({ variant = 'primary', ...props }: ButtonProps) { ... }
    ```

### Error Handling

- **Server actions return a discriminated union:** `{ success: true; value: T } | { success: false; error: string }` (omit `value` when there is no payload: `{ success: true } | { success: false; error: string }`). Callers narrow on `success` — never optional `success?`/`error?` fields
- **Every server action MUST be wrapped with `withServerAction()`** from `@/lib/sentry` (see [Server Actions](#server-actions))
- **Use the `tryCatch` helper from `@/lib/utils` instead of `try/catch` blocks — everywhere, not just server actions.** `tryCatch` is overloaded so a single import covers every case:
    - `await tryCatch(promise)` — wrap a Promise (DB call, fetch, etc.)
    - `await tryCatch(() => asyncOp())` — async thunk, also catches synchronous throws inside the thunk
    - `tryCatch(() => syncOp())` — sync thunk (`JSON.parse`, `localStorage`, cookie set, …); returns a sync `Result` (no `await`)

    In every form the result is the same Rust-style discriminated union `{ success: true; value } | { success: false; error }`. Narrow on `success`, call `captureActionError(result.error)` on the failure branch (for genuine exceptions), return a French error string.

- **Plain `try/catch` is forbidden anywhere in the codebase** — the only exception is the one inside `tryCatch` itself in `src/lib/utils.ts`, which has an inline `oxlint-disable` comment. The local oxlint rule `local/no-try-catch` enforces this — silence it inline with `// oxlint-disable-next-line local/no-try-catch` only when there's a documented reason in a comment above
- For pure-side-effect sync calls where you intentionally ignore failure (cookie set, `localStorage` write, best-effort `sendEmail`), call `tryCatch` as a void expression: `void tryCatch(() => cookieStore.set(...))` (or simply `await sendEmail(...)` since it has the same effect)
- **Report genuine exceptions with `captureActionError(error)`** from `@/lib/sentry` on the `tryCatch` failure branch — never a bare `console.error()` (it already logs + sends to Sentry, and re-throws router `redirect`/`notFound` control flow via `isRedirect`/`isNotFound`)
- Do NOT `captureActionError` on validation/permission/not-found early-returns — only on real thrown exceptions surfaced by `tryCatch` (DB, storage, PDF). Keeps Sentry free of expected denials. (`sendEmail` already calls `captureActionError` internally — don't double-capture)
- Never expose sensitive data (stack traces, keys) in error messages
- Use Sonner toasts for client-side error display
- Throw `Error` instances with descriptive messages (oxlint enforces `useThrowOnlyError`)
- Always validate Zod parse results with `.safeParse()` (never throw from validation)

### Folder Structure & Organization

```
src/
├── app/                   # TanStack Start file-based routes
│   ├── __root.tsx        # Root route (html shell, head, 404/error pages)
│   ├── _public/          # Pathless layout: public pages
│   ├── _public.tsx       # Public layout route
│   ├── dashboard/        # Admin dashboard (route.tsx = layout + auth guard)
│   ├── api/              # Server API routes (`server: { handlers }`)
│   └── login/            # Authentication
├── actions/               # Server actions (createServerFn mutations)
│   ├── auth/
│   ├── users/
│   ├── associations/
│   ├── articles/
│   ├── events/
│   └── adhesion/
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui primitives
│   ├── dashboard/        # Dashboard-specific
│   ├── link.tsx          # next/link-compat Link wrapper
│   ├── image.tsx         # unpic-based Image wrapper
│   └── [feature]/        # Feature-specific components
├── helpers/              # Utility functions
│   ├── supabase.server.ts # Server-only Supabase clients
│   ├── supabase/auth.server.ts # getCurrentUserWithPermissions
│   ├── db.server.ts      # Prisma client (server-only)
│   ├── email.server.ts   # Email utilities (server-only)
│   ├── permissions.ts    # PBAC checks
│   └── [domain]/         # Domain-specific helpers
├── hooks/                # Custom React hooks
├── lib/                  # Generic utilities (sentry.ts, seo.ts, utils.ts)
├── env/                  # T3-env: server.ts (process.env) + client.ts (VITE_*)
├── router.tsx            # createRouter (routeTree.gen.ts)
├── start.ts              # createStart (global Sentry middlewares)
├── client.tsx            # Client entry (imports instrument.client.ts)
└── routeTree.gen.ts      # Generated route tree (committed; regenerated by dev server)
```

---

## Database & Migrations

- **Schema definition:** Modify `schema.prisma`
- **Never manually edit migration files** — use Prisma CLI
- **Local development:** `pnpm prisma migrate dev --name your_migration_name`
- **Production:** Migrations + permission seed run at Docker image build (`prisma migrate deploy && prisma db seed` before `pnpm run build` in the Dockerfile)
- **Direct URL:** Use `SUPABASE_POSTGRES_PRISMA_DIRECT_URL` for migrations (separate from regular connection)
- After schema changes, always run `pnpm run check:types` to ensure generated Prisma types are correct
- Test migrations locally before pushing to ensure `prisma migrate deploy` won't fail in production

---

## Security & Authentication

### Permission-Based Access Control (PBAC)

The application uses **granular permission-based access control** instead of role-based checks.

**Core Principles:**

- All sensitive operations must check permissions via `src/helpers/permissions.ts`
- **Never use role checks for authorization** — permissions only
- **Never trust client-side permission checks** — always validate on server (in serverFn handlers/actions)
- Supabase Auth handles authentication; check `user.id` after auth
- Dashboard routes are gated by the `dashboardGuard` serverFn (`src/actions/auth/authGuard.ts`) called from the `beforeLoad` of `src/app/dashboard/route.tsx` (with `shouldReload: false`); per-page serverFns still do their own permission checks

**Permission Checking Pattern (inside every action impl / serverFn handler):**

```typescript
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"

async function someActionImpl(): Promise<
    { success: true } | { success: false; error: string }
> {
    // REQUIRED: Check authentication first
    const user = await getCurrentUserWithPermissions()
    if (!user) {
        return { success: false, error: "Authentification requise" }
    }

    // REQUIRED: Check specific permission
    if (!hasPermission(user, "create:article")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des articles"
        }
    }

    // Proceed with action...
    return { success: true }
}
// Then wrap it as a serverFn action — see "Server Actions" below.
```

**UI Visibility (Client Components):**

```typescript
// Sidebar navigation automatically hides items based on permissions
{
    href: "/dashboard/articles",
    title: "Articles",
    hidden: !permissions?.find((p) => p.name === "access:articles")
}
```

**Available Permissions:**
See `PERMISSIONS.md` for the complete list of all permissions, their naming convention, and database seeding instructions.

**Permission Helpers:**

- `hasPermission(user, permissionName)` - Check if user has specific permission
- `getCurrentUserWithPermissions()` - Fetch authenticated user with all permissions loaded

**Database Schema:**

```typescript
model User {
  permissions  UserPermission[]  // Many-to-many with Permission
}

model Permission {
  name         String @unique    // e.g., "create:article", "access:presse"
  title        String            // Display name
  category     String            // Grouping (e.g., "Articles", "Presse")
  description  String?           // What the permission allows
}
```

**Important Notes:**

- Roles (`ADMIN`, `MEMBER`, `ASSO_OWNER`) exist in the schema but are **not used for authorization**
- All authorization must use permissions, not roles

### Environment Variables

⚠️ **CRITICAL:** Do NOT commit `.env` or `.env.local` files

- `.env.example` documents required variables
- Two env modules: `src/env.server.ts` (server-only, reads `process.env`) and `src/env/client.ts` (public, `VITE_` prefix, reads `import.meta.env`). Both are imported by `vite.config.ts`, so `pnpm run build` validates all required vars
- **All public vars use the `VITE_` prefix** (e.g. `VITE_SUPABASE_URL`, `VITE_SENTRY_DSN`) — there is no `NEXT_PUBLIC_`. `VITE_*` values are baked into the client bundle; never put secrets there
- Secrets include: `SUPABASE_SERVICE_ROLE_KEY`, Prisma URLs, SMTP credentials, `FRIENDLY_CAPTCHA_API_KEY`

### Form Security

- All forms must use Zod v4 schemas for validation
- Server actions validate input before processing
- CAPTCHA required for public contact forms (Friendly Captcha)
- Sanitize user-generated content before storing (especially rich-text from Tiptap)

---

## Architecture Patterns

### Routing & Data Loading

Routes are files in `src/app/**` using `createFileRoute` (TanStack Start):

- `__root.tsx` — root route: html shell, global `head()`, `notFoundComponent`, `errorComponent`
- `_public/` + `_public.tsx` — pathless layout for public pages (no URL segment)
- `dashboard/route.tsx` — dashboard layout: `beforeLoad` calls the `dashboardGuard` serverFn (auth + route permissions, throws `redirect(...)`), with `shouldReload: false` so the guard doesn't re-run on every `router.invalidate()`
- `$id.tsx` — dynamic path params (`Route.useParams()`)
- Search params: declare with `validateSearch` on the route, read with `Route.useSearch()`, feed into the loader via `loaderDeps` (nuqs was removed)
- API routes: files under `src/app/api/` export a route with `server: { handlers: { GET/POST: ... } }` returning a `Response`
- `src/routeTree.gen.ts` is generated and committed — never edit it; regenerate by running the dev server

**Data loading:** pages fetch via colocated `createServerFn` handlers called from the route `loader`; components read `Route.useLoaderData()`. Prisma/Supabase code must only run inside serverFn handlers or server route handlers — the client bundle mocks server-only modules (`importProtection: "mock"`), so leaked imports throw at runtime.

```tsx
// src/app/dashboard/items/index.tsx
const getItems = createServerFn()
    .inputValidator((data: { showDeleted?: boolean }) => data)
    .handler(async ({ data }) => prisma.item.findMany(/* ... */))

export const Route = createFileRoute("/dashboard/items/")({
    validateSearch: (s: Record<string, unknown>): { showDeleted?: true } =>
        s.showDeleted === true ? { showDeleted: true } : {},
    loaderDeps: ({ search }) => search,
    loader: async ({ deps }) => await getItems({ data: deps }),
    head: () => ({ meta: [{ title: dashboardTitle("Items") }] }),
    component: ItemsPage
})
```

**Head/meta:** per-route `head()` returning `meta`/`links`; titles via `pageTitle()` / `dashboardTitle()` from `@/lib/seo`.

**Redirects:** `throw redirect({ href: "/login" })` from `@tanstack/react-router` (in `beforeLoad`, serverFn handlers, or actions). `withServerAction`/`captureActionError` rethrow this control flow via `isRedirect`/`isNotFound`.

### Server Actions

Server actions handle mutations. Files live in `src/actions/**`. **Every
action is a private `…Impl` function, run through
`createServerFn({ method: "POST" })` with the handler wrapped by
`withServerAction()` from `@/lib/sentry`, plus a thin exported wrapper that
keeps the plain `action(args)` call signature.** No `"use server"` directive.
`withServerAction` adds a Sentry trace span and auto-captures uncaught throws;
`packActionArgs`/`unpackActionArgs` serialize the arg list (incl. `File`s and
top-level `FormData`) across the serverFn RPC boundary.

```typescript
// src/actions/items/createItemAction.ts
import { createServerFn } from "@tanstack/react-start"
import { z } from "zod"
import prisma from "@/helpers/db.server"
import { hasPermission } from "@/helpers/permissions"
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth.server"
import {
    type ActionPayload,
    captureActionError,
    packActionArgs,
    unpackActionArgs,
    withServerAction
} from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

const CreateItemSchema = z.object({
    name: z.string().min(1, "Name required"),
    email: z.email()
})

// Discriminated union — callers narrow on `success`, never optional fields
type CreateItemResult =
    | { success: true; value: Item }
    | { success: false; error: string }

async function createItemActionImpl(
    formData: z.infer<typeof CreateItemSchema>
): Promise<CreateItemResult> {
    // 1. Auth + permission guards (early returns — NOT captured by Sentry)
    const user = await getCurrentUserWithPermissions()
    if (!user) return { success: false, error: "Authentification requise" }
    if (!hasPermission(user, "create:item")) {
        return { success: false, error: "Vous n'avez pas la permission" }
    }

    // 2. Zod validation (early return — NOT captured)
    const parsed = CreateItemSchema.safeParse(formData)
    if (!parsed.success) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides."
        }
    }

    // 3. Risky IO via tryCatch — same Result shape as the action return.
    //    Narrow on `success`, capture on failure, return a French error.
    //    DO NOT use a try/catch block here.
    const item = await tryCatch(prisma.item.create({ data: parsed.data }))
    if (!item.success) {
        captureActionError(item.error) // logs + sends to Sentry + rethrows redirect/notFound
        return { success: false, error: "Echec de la création de l'élément" }
    }

    return { success: true, value: item.value }
}

// serverFn: packed args in, withServerAction-wrapped impl as handler.
// Pass `{ attachFormData: true }` to withServerAction ONLY for
// internal/dashboard CRUD actions whose arg is a FormData with no secrets.
const createItemActionServerFn = createServerFn({ method: "POST" })
    .inputValidator(
        (data: ActionPayload<Parameters<typeof createItemActionImpl>>) => data
    )
    .handler(({ data }) =>
        withServerAction(
            "createItemAction",
            createItemActionImpl
        )(...unpackActionArgs<Parameters<typeof createItemActionImpl>>(data))
    )

// Thin exported wrapper — callers keep the plain `action(args)` signature
export default async (
    ...args: Parameters<typeof createItemActionImpl>
): ReturnType<typeof createItemActionImpl> =>
    createItemActionServerFn({
        data: await packActionArgs(args)
    }) as ReturnType<typeof createItemActionImpl>
```

For a named (non-default) export, export the wrapper under the public name
instead of `export default`. For files with multiple actions, build one
serverFn + wrapper per action. Best-effort work (e.g. notification emails
after the record is persisted) does NOT need any wrapping — `sendEmail`
catches and reports its own failures, so just `await sendEmail(...)` and
ignore the result. For other best-effort sync work, use the sync-thunk form
`tryCatch(() => …)` and discard the result.

**Key patterns:**

- Wrap every action's impl with `withServerAction("actionName", impl)` inside
  the serverFn handler — name = the exported function name
- Auth/permission/Zod failures are **early returns**, not exceptions — do not
  `captureActionError` them
- Wrap every genuinely risky IO (DB, storage, PDF/zip, supabase storage
  downloads/uploads, anything that can reject) in `tryCatch` from
  `@/lib/utils` — NOT `try/catch`. Narrow on the returned `success`, call
  `captureActionError(result.error)` on failure, and return a hand-written
  French message in the action's return shape. `sendEmail` is the
  exception: it already wraps `tryCatch` internally and reports failures
  to Sentry, so callers just `await sendEmail(...)` and (optionally)
  narrow on `.success` to decide whether to abort
- Redirects: `throw redirect({ href })` from `@tanstack/react-router`. Keep
  `redirect()`/`notFound()` OUTSIDE the failure branch of any `tryCatch`
  (`withServerAction` and `captureActionError` rethrow them via
  `isRedirect`/`isNotFound`, so a `redirect` inside a `if (!result.success)`
  block still works, but never funnel control-flow throws through `tryCatch`
  intentionally)
- Return a discriminated union `{ success: true; value: T } | { success: false; error: string }` (drop `value` when there is no payload) — every branch sets an explicit `success`; callers narrow on it. This is the same shape `tryCatch` returns, on purpose
- **No `revalidatePath`** — after a successful mutation the CLIENT calls
  `await router.invalidate()` to re-run loaders
- Never expose sensitive data in responses
- Exclude internal sub-routines that other actions call (e.g. captcha
  verification) — only entry-point actions get the serverFn + wrapper
  treatment

### Component Structure

All components render client-side (no RSC split). Data comes in via route
loaders (`Route.useLoaderData()`) or props; mutations go through server
actions. After a successful mutation, call `await router.invalidate()` to
re-run loaders and refresh the page data.

```tsx
import { useRouter } from "@tanstack/react-router"
import { useTransition } from "react"
import { createItem } from "@/actions/items/create"

export function CreateForm() {
    const router = useRouter()
    const [isPending, startTransition] = useTransition()

    async function handleSubmit(formData: FormData) {
        startTransition(async () => {
            const result = await createItem({
                name: formData.get("name") as string
            })
            if (!result.success) toast.error(result.error)
            else {
                toast.success("Created!")
                await router.invalidate()
            }
        })
    }

    return <form action={handleSubmit}>...</form>
}
```

### Supabase (server-only)

- Supabase runs ONLY on the server via `@/helpers/supabase.server`:
  `createClient()` (cookie-bridged through Start server utils
  `getCookies`/`setCookie`) and `createAdminClient()` (service role, bypasses
  RLS). **There is no browser Supabase client**
- Storage public URLs are computed server-side and passed to components as
  props / loader data

### Form Handling

- **TanStack React Form** + Zod v4 validation
- Always pair with server actions for submission
- Display errors via Sonner toasts (already configured)

### Email Templates

Emails live in `emails/` as React components using react-email:

```typescript
// emails/welcome.tsx
import { Container, Text } from 'react-email';
import React from "react"
import BaseTemplate from "./base"


export function WelcomeEmail({ name }: { name: string }) {
  return (
    <BaseTemplate>
        <Container>
            <Text>Welcome, {name}!</Text>
        </Container>
    </BaseTemplate>
  );
}
```

Send using the `sendEmail` helper. It returns
`{ success: true } | { success: false }` (no `error` field — failures are
caught internally and reported to Sentry via `captureActionError`). Do NOT
wrap the call in `try/catch`; narrow on `.success` only if you want to
abort the surrounding action on failure.

```typescript
import { sendEmail } from "@/helpers/email.server"

// Abort-on-failure (action fails if the email fails)
const email = await sendEmail({
    to: "secretariat@fare-asso.fr",
    subject: `Nouvelle demande d'adhésion - ${record.association}`,
    html: await render(<EmailTemplate />)
})
if (!email.success) {
    return { success: false, error: "Echec de l'envoi du mail" }
}

// Best-effort (notification after a successful DB write)
await sendEmail({ to: "...", subject: "...", html: "..." })
// no need to check .success — sendEmail already reported the failure
```

### Sentry

Uses `@sentry/tanstackstart-react`:

- Client init: `src/instrument.client.ts`, imported by `src/client.tsx`
- Server init: `instrument.server.mjs`, loaded via `node --import` (see `pnpm start` / Dockerfile CMD)
- Global request/function middlewares registered in `src/start.ts` (`createStart`)
- Sourcemap upload via the `sentryTanstackStart` vite plugin in `vite.config.ts`

---

## Common Gotchas & Warnings

### Type Safety

- ❌ **Don't use `any`** — use proper types. Only use `unknown` with type guards if absolutely necessary
- ⚠️ **Prisma client generation:** After schema changes, Prisma types auto-generate (checked in CI)
- ⚠️ **Optional fields in Zod v4:** Use `.optional()` or provide defaults; don't assume field exists

### Database

- ❌ **Never manually edit migration files** — let Prisma generate them
- ⚠️ **Migrations are final** — test locally before pushing
- ⚠️ **Direct URL vs Connection String:** Migrations use `PRISMA_DIRECT_URL`, connections use regular `DATABASE_URL`
- ⚠️ **Cascading deletes:** Check `schema.prisma` for `@relation(...onDelete: Cascade)` before deleting parent records

### Authentication & Permissions

- ❌ **Never trust client-side role checks** — always validate permissions server-side
- ⚠️ **Session cookies:** Supabase sessions are read/refreshed server-side through the cookie-bridged `createClient()` (there is no middleware.ts and no browser Supabase client)
- ⚠️ **Private routes:** `/dashboard` is gated by `dashboardGuard` in the layout route's `beforeLoad` (`shouldReload: false`); serverFns still check permissions themselves

### Forms & Input

- ❌ **Never skip Zod v4 validation** on user input
- ⚠️ **Rich text (Tiptap):** Sanitize HTML before storing; use Tiptap's built-in sanitization
- ⚠️ **File uploads:** Store in Supabase Storage, not in database; validate file type/size
- ⚠️ **CAPTCHA:** Required on public forms; verify token server-side in actions using FriendlyCaptcha helper in `@/components/captcha/verify.ts`

### Routing & Data

- ❌ **No `revalidatePath`** — clients call `await router.invalidate()` after successful mutations
- ⚠️ **Server-only imports:** Prisma/Supabase/SMTP must stay inside serverFn or server route handlers; the client bundle mocks them out (`importProtection: "mock"`) and access throws at runtime
- ⚠️ **`routeTree.gen.ts` is generated** — never hand-edit; run the dev server to regenerate after adding/renaming route files
- ⚠️ **Search params:** use route `validateSearch` + `Route.useSearch()` (nuqs was removed)

### Performance

- ⚠️ **Image optimization:** Use `Image` from `@/components/image` (unpic) — no next/image optimizer
- ⚠️ **Lazy loading:** Use dynamic imports for heavy components

### Styling

- ❌ **Don't add inline styles** — use Tailwind classes
- ⚠️ **Custom CSS:** Only in `src/styles/` (imported with `?url` in route `head()` links); avoid duplication
- ⚠️ **Responsive design:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints

### Deployments

- ⚠️ **Environment variables:** Must be set before build; missing vars cause build failure. Docker build ARGs are the `VITE_*` public vars; secrets are BuildKit secret mounts
- ⚠️ **Docker builds:** Multi-stage (builder + runner); migrations + permission seed run at image build; only the Nitro `.output/` is copied to the runner. CMD: `node --import ./.output/server/instrument.server.mjs .output/server/index.mjs`

---

## Testing Strategy

> **Tests are REQUIRED, not optional.** Every new feature, server action,
> form, schema with non-trivial rules, or behavioural bug fix MUST ship with
> tests in the **same PR**, using the stack below. A PR that adds or changes
> behaviour without corresponding tests is incomplete and will not pass review.

**Stack:**

- **Vitest** — test runner for everything (node + browser projects).
- **MSW** (`msw`) — mocks outbound HTTP for the node project
  (`src/test/msw.ts`, `setupServer`, `onUnhandledRequest: "error"`). Use it for
  real external calls (e.g. Friendly Captcha, remote assets). Do NOT let a test
  hit the network — an unmocked request fails the run by design.
- **Playwright** (via `@vitest/browser-playwright`) — drives headless Chromium
  for the browser project; React components render through
  `vitest-browser-react`.

**What to test for each kind of change:**

| Change                                    | Required tests                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------- |
| New/changed server action                 | Node test covering the full branch + IO matrix (see convention 4)            |
| New/changed Zod/arktype schema with rules | Schema test in `src/schemas/__tests__/` (convention 5) — only if non-trivial |
| New/changed form component                | Browser test (convention 6)                                                  |
| New/changed helper with logic             | Node unit test next to it in `__tests__/`                                    |
| Behavioural bug fix                       | A regression test that fails without the fix                                 |

**Framework:** Vitest with two projects (`pnpm test` runs both):

- **node** project — schema, server-action and helper tests. `environment: "node"`,
  msw `setupServer` (`vitest.setup.ts`), `onUnhandledRequest: "error"`.
  `vitest.setup.ts` globally mocks `@tanstack/react-start` with `startModule()`
  from `src/test/mocks.ts` (`createServerFn` becomes a builder that calls the
  handler directly — no Start runtime). Run alone: `pnpm run test:node`.
- **browser** project — React component tests via `vitest-browser-react`
  (Playwright/chromium, headless). Aliases `@tanstack/react-start` and
  `@tanstack/react-start/server` to stubs in `src/test/stubs/` (the Start vite
  plugin's virtual modules aren't available). Run alone: `pnpm run test:browser`.

**Conventions:**

1. **Test files live in a `__tests__/` subfolder of the source dir** — NOT
   colocated as siblings, NOT in a top-level mirror. Source files never move;
   only tests go in `__tests__/`. e.g. `src/actions/contact/submitContactFormAction.tsx`
   → `src/actions/contact/__tests__/submitContactFormAction.test.tsx`.
2. **Component tests use the `.browser.test.tsx` suffix**; node-project tests
   use `.test.ts` / `.test.tsx`.
3. Reuse `src/test/mocks.ts` (hoistable mock builders for db, supabase, email,
   sentry, start, …) and `src/test/factories/<domain>.ts` (valid-input
   builders). Do not re-inline `vi.mock` blocks per file. The `sentryModule`
   mock makes `withServerAction` a passthrough and includes
   `packActionArgs`/`unpackActionArgs` passthroughs so the serverFn wrappers
   stay functional under test.
4. **Action tests** import the wrapped default export (serverFn + sentry mocks
   make it call the impl directly) and cover the full branch + IO matrix:
   invalid payload, each auth/permission denial, every external-IO failure
   branch, partial-failure cleanup, best-effort continuation, happy path with
   exact payload. Redirect assertions use the real `redirect`/`isRedirect`
   from `@tanstack/react-router` (no navigation mocks).
5. **Schema tests** are added only for schemas with non-trivial rules
   (enums, refinements, transforms), in `src/schemas/__tests__/`.
6. **Component tests** mock the form's server-action and captcha modules; assert
   render, client validation (action NOT called), valid submit payload, and
   success/error UI.
7. CI runs node then browser tests before allowing merges. Run locally before
   commits: `pnpm run test`.

Also rely on:

- TypeScript type checking (`pnpm run check:types`)
- oxlint linting (`pnpm run check:lint`)
- Manual testing in dev server (`pnpm run dev`)

---

## Before You Commit

**Always run these checks locally:**

```bash
pnpm run check:types      # Ensure no TypeScript errors
pnpm run check:lint       # Ensure oxlint rules pass
pnpm run check:format     # Ensure oxfmt formatting is clean
pnpm run knip             # Check for unused code/imports
pnpm test                 # Run node + browser test suites
pnpm run build            # Test production build
```

**Commit checklist:**

- ✅ Tests added/updated for the change and `pnpm test` is green
- ✅ No `any`/`unknown` types without justification
- ✅ Server actions use Zod v4 validation
- ✅ Permissions checked server-side
- ✅ Migrations tested locally
- ✅ Code formatted with `pnpm run format`
- ✅ No unused imports (checked by Knip)
- ✅ Tailwind classes sorted correctly (done by oxfmt)
- ✅ Database types regenerated (automatic)

---

## CI/CD Pipeline

**On every push/PR (`.github/workflows/checks.yaml`):**

1. `quality` job: oxlint (`check:lint`) → TypeScript type checking → oxfmt formatting check (`check:format`) → Knip → `pnpm run build` (with dummy env vars)
2. `test` job: `pnpm run test:node`, then install Playwright Chromium and
   `pnpm run test:browser`

Both jobs must be green to merge.

**Automatic dependency updates:**

- Scheduled Monday 9 AM UTC via Taze
- Runs full type check + lint check
- Auto-creates PR assigned to `@finxol`

**Deployment:**

- Docker: Multi-stage build; migrations + seed at image build; runner ships only the Nitro `.output/`

---

## Useful Commands Reference

| Command                | Purpose                                        |
| ---------------------- | ---------------------------------------------- |
| `pnpm run dev`         | Start Vite dev server                          |
| `pnpm run build`       | Build for production (vite build → `.output/`) |
| `pnpm run lint`        | Fix linting & formatting issues                |
| `pnpm run check:types` | Type check only (no fixes)                     |
| `pnpm run knip`        | Find unused code                               |
| `pnpm run format`      | Format code (oxfmt)                            |
| `pnpm run email:dev`   | Preview email templates                        |

---

## Questions?

If something is unclear, check:

- `schema.prisma` for database structure
- `src/actions/` for server action examples
- `src/components/ui/` for available Shadcn components
- `.github/workflows/` for CI pipeline details
- `vite.config.ts` for build configuration (Start plugin, Nitro route rules, Sentry, env validation)
