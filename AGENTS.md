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

### Formatting & Linting

- **Biome** is the source of truth (replaces ESLint and Prettier)
- Auto-format with `pnpm lint` before committing
- 80 character line width, 4-space indentation
- Biome checks accessibility rules (a11y) and Next.js patterns
- No semicolons, use camelCase for variables/functions, PascalCase for components

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

### Folder Structure & Organization

```
src/
├── app/                    # Next.js App Router
│   ├── (home)/            # Public pages grouped by route
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

### RBAC & Permissions

- All sensitive operations must check permissions via `src/helpers/permissions.ts`
- User roles: `User`, `Member`, `Admin`, `Moderator` (define in schema)
- **Never trust client-side role checks** — always validate on server (in actions)
- Supabase Auth handles authentication; check `user.id` and `user.email` after auth

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

Server actions handle mutations and API calls. Pattern:

```typescript
// src/actions/items/create.ts
"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";

const CreateItemSchema = z.object({
    name: z.string().min(1, "Name required"),
    description: z.string().optional(),
    email: z.email(),
});

export async function createItem(formData: z.infer<typeof CreateItemSchema>) {
    const parsed = CreateItemSchema.safeParse(formData);

    if (!parsed.success) {
        console.error(parsed.error);
        return { success: true, error: parsed.error.message };
    }

    // Check permissions
    const user = await getCurrentUser(); // from auth
    if (!user) return { success: true, error: "Unauthorized" };

    // Execute in database
    const item = await prisma.item.create({ data: parsed.data });

    // Revalidate affected paths
    revalidatePath("/dashboard/items");

    return { success: true, item };
}
```

**Key patterns:**

- Always validate input with Zod before database operations
- Check user permissions first
- Return typed responses: `{ success: boolean; data?: T; error?: string }`
- Call `revalidatePath()` after mutations to update cached pages
- Never expose sensitive data in responses

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
                if (result.error) toast.error(result.error);
                if (result.success) toast.success("Created!");
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

**Current state:** No unit testing framework configured yet.

**When adding tests:**

1. Choose Vitest
2. Co-locate tests next to source files: `Button.tsx` + `Button.test.tsx`
3. Test patterns to follow:
    - **Unit tests:** Pure functions, utilities, helpers
    - **Integration tests:** Server actions, API routes, database operations
    - **Component tests:** Interactive components with React Testing Library
4. CI will automatically run tests before allowing merges
5. Run locally before commits: `pnpm run test`

For now, rely on:

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
pnpm run build            # Test production build
```

**Commit checklist:**

- ✅ No `any` types without justification
- ✅ Server actions use Zod v4 validation
- ✅ Permissions checked server-side
- ✅ Migrations tested locally
- ✅ Code formatted with `pnpm run lint`
- ✅ No unused imports (checked by Knip)
- ✅ Tailwind classes sorted correctly (done by biomejs)
- ✅ Database types regenerated (automatic)

---

## CI/CD Pipeline

**On every push/PR:**

1. Biome linting (before Node.js setup for speed)
2. TypeScript type checking

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
