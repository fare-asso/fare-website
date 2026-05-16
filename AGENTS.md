# AGENTS.md

Guide for AI coding agents working on the FARE Website project.

## Project Overview

A modern Next.js 16 full-stack application for Fédération des Associations du Réseau Étudiant de Haute-Bretagne (FARE), a student federation network. Features include:

- Public website with project showcases (Bouge-ta-Prison, BagadAsso, Agorae)
- Admin dashboard for content, associations, events, and memberships
- Association member portal (Espace Asso)
- Contact forms with CAPTCHA protection
- Email notifications and rich-text content editing

**Tech Stack:** pnpm, Next.js 16, React 19, TypeScript, Tailwind CSS, Shadcn/ui, Prisma, Supabase PostgreSQL, Nodemailer, react-email

---

## Setup Commands

```bash
# Install dependencies (required - pnpm enforced)
pnpm install

# Start development server
pnpm run dev

# Email template development
pnpm run email:dev

# Build for production
pnpm run build

# Start production server
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
- Validate environment variables at build time using `src/env.ts`

### Imports & Exports

- **Use `export type` for TypeScript types and interfaces:** `export type MyType = { ... }`
- **Use ES modules:** `import ... from "..."` (not CommonJS `require`)
- Use Node.js import protocol for standard library: `import fs from "node:fs"`
- Auto-organize imports with Biome (uses `useImportType`, `useExportType`)
- Path aliases: `@/` for `src/` (configured in tsconfig.json)

### Formatting & Linting

- **Biome** is the source of truth (replaces ESLint and Prettier)
- Auto-format with `pnpm lint` before committing
- **Line width:** 80 characters (Biome enforces via `lineWidth`)
- **Indentation:** 4 spaces (not tabs)
- **No semicolons** (Biome removes via `semicolons: asNeeded`)
- **Quote style:** Double quotes for JSX, double quotes for strings
- **Naming:** camelCase for variables/functions, PascalCase for components/types, CONSTANT_CASE for constants
- Biome checks accessibility rules (a11y) and Next.js patterns
- Tailwind classes auto-sorted via `useSortedClasses` rule (functions: `cn`, `twMerge`, `cva`)

### Component Patterns

- **Colocation:** Keep components near their usage, avoid global component dumps
- **Shadcn/ui:** Use existing components from `src/components/ui/` first, install using shadcn cli with pnpm if necessary
- **Tailwind CSS:** Utility-first styling, no custom CSS unless necessary
- **Server vs Client:** Use `"use server"` in server actions, `"use client"` in interactive components
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
- **Report genuine exceptions with `captureActionError(error)`** from `@/lib/sentry` inside `catch` blocks — never a bare `console.error()` (it already logs + sends to Sentry, and re-throws Next.js `redirect`/`notFound` control flow)
- Do NOT `captureActionError` on validation/permission early-returns — only on real thrown exceptions (DB, storage, email, PDF). Keeps Sentry free of expected denials
- Never expose sensitive data (stack traces, keys) in error messages
- Use Sonner toasts for client-side error display
- Throw `Error` instances with descriptive messages (Biome enforces `useThrowOnlyError`)
- Always validate Zod parse results with `.safeParse()` (never throw from validation)

### Folder Structure & Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (public)/            # Public pages grouped by route
│   ├── dashboard/         # Admin dashboard routes
│   ├── espace-asso/       # Member portal
│   ├── api/               # API routes
│   └── login/             # Authentication
├── actions/               # Server actions (mutations)
│   ├── auth/
│   ├── users/
│   ├── associations/
│   ├── articles/
│   ├── events/
│   └── adhesion/
├── components/            # Reusable components
│   ├── ui/               # Shadcn/ui primitives
│   ├── dashboard/        # Dashboard-specific
│   ├── espaceAsso/       # Member portal-specific
│   └── [feature]/        # Feature-specific components
├── helpers/              # Utility functions
│   ├── supabase.ts       # Supabase client
│   ├── db.ts             # Database helpers
│   ├── email.ts          # Email utilities
│   ├── permissions.ts    # RBAC checks
│   └── [domain]/         # Domain-specific helpers
├── hooks/                # Custom React hooks
├── lib/                  # Generic utilities
└── env.ts                # Environment variables (T3-env pattern)
```

---

## Database & Migrations

- **Schema definition:** Modify `schema.prisma`
- **Never manually edit migration files** — use Prisma CLI
- **Local development:** `pnpm prisma migrate dev --name your_migration_name`
- **Production:** Migrations run automatically at container startup via `docker-entrypoint.sh`
- **Direct URL:** Use `SUPABASE_POSTGRES_PRISMA_DIRECT_URL` for migrations (separate from regular connection)
- After schema changes, always run `pnpm run check:types` to ensure generated Prisma types are correct
- Test migrations locally before pushing to ensure `prisma migrate deploy` won't fail in production

---

## Security & Authentication

### Permission-Based Access Control (PBAC)

The application uses **granular permission-based access control** instead of role-based checks.

**Core Principles:**

- All sensitive operations must check permissions via `src/helpers/permissions.ts`
- **Never use role checks for authorization** — roles are reserved for future Espace Asso features
- **Never trust client-side permission checks** — always validate on server (in actions)
- Supabase Auth handles authentication; check `user.id` after auth

**Permission Checking Pattern (Server Actions):**

```typescript
"use server";

import { hasPermission } from "@/helpers/permissions";
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth";
import { withServerAction } from "@/lib/sentry";

async function someActionImpl(): Promise<
    { success: true } | { success: false; error: string }
> {
    // REQUIRED: Check authentication first
    const user = await getCurrentUserWithPermissions();
    if (!user) {
        return { success: false, error: "Authentification requise" };
    }

    // REQUIRED: Check specific permission
    if (!hasPermission(user, "create:article")) {
        return {
            success: false,
            error: "Vous n'avez pas la permission de créer des articles",
        };
    }

    // Proceed with action...
    return { success: true };
}

// REQUIRED: every action is wrapped and is the single export of its file
export default withServerAction("someAction", someActionImpl);
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
- Roles will be used later for Espace Asso dashboard (association member portal)
- All authorization must use permissions, not roles

### Environment Variables

⚠️ **CRITICAL:** Do NOT commit `.env` or `.env.local` files

- `.env.example` documents required variables
- At build time, `src/env.ts` validates all required env vars exist
- Run `pnpm run build` locally to catch missing env vars before deploying
- Secrets include: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, SMTP credentials, Captcha keys

### Form Security

- All forms must use Zod v4 schemas for validation
- Server actions validate input before processing
- CAPTCHA required for public contact forms (Friendly Captcha)
- Sanitize user-generated content before storing (especially rich-text from Tiptap)

---

## Architecture Patterns

### Server Actions

Server actions handle mutations and API calls. **Every server action is a
private `…Impl` function wrapped by `withServerAction()` and exported as the
single export of its file.** The wrapper adds a Sentry trace span (linked to
the client trace) and auto-captures uncaught throws.

```typescript
// src/actions/items/createItemAction.ts
"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import prisma from "@/helpers/db";
import { hasPermission } from "@/helpers/permissions";
import { getCurrentUserWithPermissions } from "@/helpers/supabase/auth";
import { captureActionError, withServerAction } from "@/lib/sentry";

const CreateItemSchema = z.object({
    name: z.string().min(1, "Name required"),
    email: z.email(),
});

// Discriminated union — callers narrow on `success`, never optional fields
type CreateItemResult =
    | { success: true; value: Item }
    | { success: false; error: string };

async function createItemActionImpl(
    formData: z.infer<typeof CreateItemSchema>,
): Promise<CreateItemResult> {
    // 1. Auth + permission guards (early returns — NOT captured by Sentry)
    const user = await getCurrentUserWithPermissions();
    if (!user) return { success: false, error: "Authentification requise" };
    if (!hasPermission(user, "create:item")) {
        return { success: false, error: "Vous n'avez pas la permission" };
    }

    // 2. Zod validation (early return — NOT captured)
    const parsed = CreateItemSchema.safeParse(formData);
    if (!parsed.success) {
        return {
            success: false,
            error: "Un ou plusieurs champs sont invalides.",
        };
    }

    // 3. Risky IO wrapped in targeted try/catch (process-adhesion style)
    let item: Item;
    try {
        item = await prisma.item.create({ data: parsed.data });
    } catch (error) {
        captureActionError(error); // logs + sends to Sentry + rethrows redirect/notFound
        return { success: false, error: "Echec de la création de l'élément" };
    }

    revalidatePath("/dashboard/items");
    return { success: true, value: item };
}

// Single export. Pass `{ attachFormData: true }` ONLY for internal/dashboard
// CRUD actions whose arg is a FormData with no secrets. Never for public
// forms or password-bearing actions.
export default withServerAction("createItemAction", createItemActionImpl);
```

For a named (non-default) export, keep the impl private and export the
wrapped result under the public name:
`export const createItemAction = withServerAction("createItemAction", createItemActionImpl)`.
For files with multiple actions (e.g. `loginAction.tsx`), wrap each one
individually. Best-effort work (e.g. notification emails after the record is
persisted) goes in its own try/catch that `captureActionError`s and continues.

**Key patterns:**

- Wrap every action with `withServerAction("actionName", impl)` — name = the
  exported function name
- Auth/permission/Zod failures are **early returns**, not exceptions — do not
  `captureActionError` them
- Wrap genuinely risky IO (DB, storage, email, PDF/zip) in targeted try/catch
  with `captureActionError(error)` and a hand-written French message in the
  action's return shape
- Keep Next.js `redirect()`/`notFound()` OUTSIDE any `captureActionError`
  try/catch (the wrapper handles them; `captureActionError` rethrows them, so
  a `redirect` inside a catch still works but never wrap it intentionally)
- Return a discriminated union `{ success: true; value: T } | { success: false; error: string }` (drop `value` when there is no payload) — every branch sets an explicit `success`; callers narrow on it
- Call `revalidatePath()` after mutations
- Never expose sensitive data in responses
- Exclude internal sub-routines that other actions call (e.g. captcha
  verification) — only entry-point actions get wrapped

### Component Structure

**Server Components (default in App Router):**

- Fetch data directly from database
- No `"use client"` directive
- Cannot use React hooks or browser APIs

**Client Components (interactive):**

- Add `"use client"` at top
- Use `useTransition()` to call server actions
- Handle loading/error states locally
- Example:

    ```tsx
    "use client";
    import { createItem } from "@/actions/items/create";
    import { useTransition } from "react";

    export function CreateForm() {
        const [isPending, startTransition] = useTransition();

        async function handleSubmit(formData: FormData) {
            startTransition(async () => {
                const result = await createItem({
                    name: formData.get("name") as string,
                });
                if (!result.success) toast.error(result.error);
                else toast.success("Created!");
            });
        }

        return <form action={handleSubmit}>...</form>;
    }
    ```

### Form Handling

- **TanStack React Form** + Zod v4 validation
- Always pair with server actions for submission
- Display errors via Sonner toasts (already configured)

### Email Templates

Emails live in `src/emails/` as React components using react-email:

```typescript
// src/emails/welcome.tsx
import { Container, Text } from '@react-email/components';
//biome-ignore lint/correctness/noUnusedImports: need to import react for react-email to work
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

Send using `sendEmail` helper:

```typescript
import { sendEmail } from "@/helpers/email";

const emailResponse = await sendEmail({
    to: "secretariat@fare-asso.fr",
    subject: `Nouvelle demande d'adhésion - ${record.association}`,
    html: await render(
        <EmailTemplate />
    )
})
```

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
- ⚠️ **Session cookies:** Supabase session tokens expire; refresh happens via middleware if configured
- ⚠️ **Private routes:** Dashboard routes require authentication check at top of layout/page

### Forms & Input

- ❌ **Never skip Zod v4 validation** on user input
- ⚠️ **Rich text (Tiptap):** Sanitize HTML before storing; use Tiptap's built-in sanitization
- ⚠️ **File uploads:** Store in Supabase Storage, not in database; validate file type/size
- ⚠️ **CAPTCHA:** Required on public forms; verify token server-side in actions using FriendlyCaptcha helper in `@/components/captcha/verify.ts`

### Performance

- ⚠️ **Revalidation:** Only call `revalidatePath()` on affected paths, not globally
- ⚠️ **Image optimization:** Always use `next/image` for images
- ⚠️ **Lazy loading:** Use dynamic imports for heavy components

### Styling

- ❌ **Don't add inline styles** — use Tailwind classes
- ⚠️ **Custom CSS:** Only in `app/globals.css` or module files; avoid duplication
- ⚠️ **Responsive design:** Mobile-first with `sm:`, `md:`, `lg:` breakpoints

### Deployments

- ⚠️ **Environment variables:** Must be set before build; missing vars cause build failure
- ⚠️ **Docker builds:** Multi-stage (builder + runner); migrations run on startup

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

| Change | Required tests |
| --- | --- |
| New/changed server action | Node test covering the full branch + IO matrix (see convention 4) |
| New/changed Zod/arktype schema with rules | Schema test in `src/schemas/__tests__/` (convention 5) — only if non-trivial |
| New/changed form component | Browser test (convention 6) |
| New/changed helper with logic | Node unit test next to it in `__tests__/` |
| Behavioural bug fix | A regression test that fails without the fix |

**Framework:** Vitest with two projects (`pnpm test` runs both):

- **node** project — schema, server-action and helper tests. `environment: "node"`,
  msw `setupServer` (`vitest.setup.ts`), `onUnhandledRequest: "error"`.
  Run alone: `pnpm run test:node`.
- **browser** project — React component tests via `vitest-browser-react`
  (Playwright/chromium, headless). Run alone: `pnpm run test:browser`.

**Conventions:**

1. **Test files live in a `__tests__/` subfolder of the source dir** — NOT
   colocated as siblings, NOT in a top-level mirror. Source files never move;
   only tests go in `__tests__/`. e.g. `src/actions/contact/submitContactFormAction.tsx`
   → `src/actions/contact/__tests__/submitContactFormAction.test.tsx`.
2. **Component tests use the `.browser.test.tsx` suffix**; node-project tests
   use `.test.ts` / `.test.tsx`.
3. Reuse `src/test/mocks.ts` (hoistable mock builders for db, supabase, email,
   sentry, cache, …) and `src/test/factories/<domain>.ts` (valid-input
   builders). Do not re-inline `vi.mock` blocks per file.
4. **Action tests** import the `withServerAction`-wrapped default export (the
   shared sentry mock makes it a passthrough) and cover the full branch + IO
   matrix: invalid payload, each auth/permission denial, every external-IO
   failure branch, partial-failure cleanup, best-effort continuation, happy
   path with exact payload + `revalidatePath`.
5. **Schema tests** are added only for schemas with non-trivial rules
   (enums, refinements, transforms), in `src/schemas/__tests__/`.
6. **Component tests** mock the form's server-action and captcha modules; assert
   render, client validation (action NOT called), valid submit payload, and
   success/error UI.
7. CI runs node then browser tests before allowing merges. Run locally before
   commits: `pnpm run test`.

Also rely on:

- TypeScript type checking (`pnpm run check:types`)
- Biome linting (`pnpm run check:lint`)
- Manual testing in dev server (`pnpm run dev`)

---

## Before You Commit

**Always run these checks locally:**

```bash
pnpm run check:types      # Ensure no TypeScript errors
pnpm run check:lint       # Ensure Biome rules pass
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
- ✅ Code formatted with `pnpm run lint`
- ✅ No unused imports (checked by Knip)
- ✅ Tailwind classes sorted correctly (done by biomejs)
- ✅ Database types regenerated (automatic)

---

## CI/CD Pipeline

**On every push/PR (`.github/workflows/checks.yaml`):**

1. `quality` job: Biome linting → TypeScript type checking → Knip
2. `test` job: `pnpm run test:node`, then install Playwright Chromium and
   `pnpm run test:browser`

Both jobs must be green to merge.

**Automatic dependency updates:**

- Scheduled Monday 9 AM UTC via Taze
- Runs full type check + lint check
- Auto-creates PR assigned to `@finxol`

**Deployment:**

- Docker: Multi-stage build, migrations run on startup

---

## Useful Commands Reference

| Command                | Purpose                                 |
| ---------------------- | --------------------------------------- |
| `pnpm run dev`         | Start dev server + email preview server |
| `pnpm run build`       | Build for production (runs type checks) |
| `pnpm run lint`        | Fix linting & formatting issues         |
| `pnpm run check:types` | Type check only (no fixes)              |
| `pnpm run knip`        | Find unused code                        |
| `pnpm run format`      | Format code (Prettier)                  |
| `pnpm run email:dev`   | Preview email templates                 |

---

## Questions?

If something is unclear, check:

- `schema.prisma` for database structure
- `src/actions/` for server action examples
- `src/components/ui/` for available Shadcn components
- `.github/workflows/` for CI pipeline details
- `next.config.mjs` for build configuration
