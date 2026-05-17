# TODO.md

A prioritized list of improvements, refactors, and fixes needed for the FARE Website project.

---

## 🟠 HIGH PRIORITY (Address this quarter)

### 1. Add HTML Sanitization to Rich Text Editor Output

**Status:** Todo  
**Severity:** Medium  
**Impact:** XSS prevention  
**Effort:** 2-3 hours

**Problem:**
Rich text content uses `dangerouslySetInnerHTML` with minimal sanitization:

- `src/components/ui/rich-text-editor/contentHTML.tsx` (line 9)
- `src/helpers/tiptap/jsonToHtml.ts` (line 61)

Current sanitization only removes `<html>`, `<head>`, `<body>` tags but doesn't sanitize:

- Script tags (`<script>`)
- Event handlers (`onclick`, `onload`, etc.)
- Data URLs (`javascript:`, `data:`)

**Required Changes:**

1. Install `isomorphic-dompurify` (SSR-safe version) or similar
2. Update `jsonToHtml()` to sanitize output before rendering
3. Consider using Tiptap's built-in HTML output methods instead
4. Remove the stray `console.log` calls in `contentHTML.tsx` and `jsonToHtml.ts`

**Reference Implementation:**

```typescript
import DOMPurify from 'isomorphic-dompurify'
const sanitizedHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'strong', ...] })
```

**Files to Update:**

- `src/helpers/tiptap/jsonToHtml.ts`
- `src/components/ui/rich-text-editor/contentHTML.tsx`

---

### 2. Standardize Form Handling to TanStack React Form

**Status:** Todo  
**Severity:** Medium  
**Impact:** Code maintainability, consistency  
**Effort:** 6-8 hours

**Problem:**
Project still mixes form handling patterns. `useFormState` → `useActionState`
migration is **done**. Remaining work: React Hook Form components not yet
migrated to the preferred TanStack React Form.

1. **TanStack React Form** (preferred, modern):
    - `src/components/public/adhesion/form.tsx`
    - `src/components/public/bagadAsso/form.tsx`
    - `src/components/public/contact/contactForm.tsx`

2. **React Hook Form** (legacy, to be migrated):
    - `src/app/(home)/projets/bouge-ta-prison/tutorat/TutorApplicationForm.tsx`
    - `src/app/(home)/projets/bouge-ta-prison/tutorat/question/QuestionForm.tsx`
    - `src/components/dashboard/members/addMemberButton.tsx`
    - `src/components/dashboard/members/editMemberButton.tsx`
    - `src/app/dashboard/users/[id]/userInfoForm.tsx`

> Note: `src/components/ui/form.tsx` is the Shadcn RHF wrapper primitive — its
> RHF usage is expected, not in scope for migration.

AGENTS.md explicitly states: "TanStack React Form + Zod v4 validation"

**Required Changes:**

1. Migrate the 5 React Hook Form components above to TanStack React Form
2. Ensure all forms pair with Zod validation in server actions (schemas
   already centralized in `src/schemas/`)

**Priority Order:**

1. Migrate tutor forms (public-facing, security-critical)
2. Migrate member management forms
3. Migrate user info form

**Reference Implementation:**

- `src/components/public/adhesion/form.tsx`

---

### 3. Migrate Server Actions to Discriminated-Union Return Type

**Status:** Todo  
**Severity:** Low-Medium  
**Impact:** API consistency, type safety, testability  
**Effort:** 4-6 hours

**Problem:**
A shared `ActionResponse` type exists (`src/types/actions.ts`) and the
original array-based error format is gone. However, `ActionResponse` uses
all-optional fields (`success?: boolean`, `error?: string`), which **conflicts
with the AGENTS.md mandate**:

> Server actions return a discriminated union:
> `{ success: true; value: T } | { success: false; error: string }`
> (omit `value` when there is no payload). Callers narrow on `success` — never
> optional `success?`/`error?` fields.

The current optional-field shape prevents proper exhaustive narrowing on the
caller side.

**Required Changes:**

1. Redefine the shared type as a discriminated union:
    ```typescript
    export type ActionResponse<T = void> =
        | (T extends void ? { success: true } : { success: true; value: T })
        | {
              success: false;
              error: string;
              fieldErrors?: Record<string, string[]>;
          };
    ```
2. Update all server actions to set an explicit `success` on every branch
3. Update callers to narrow on `success` instead of checking optional fields
4. Migrate `fieldErrors`-returning actions (e.g. tutor actions) to the new shape

**Files to Update:**

- `src/types/actions.ts`
- All server actions in `src/actions/` and their callers

---

## 📊 Action Plan by Timeline

### Short Term (Next 2 Weeks)

- [ ] Add HTML sanitization to rich text (#1)

### Medium Term (Next Month)

- [ ] Standardize form handling to TanStack (#2)
- [ ] Migrate server actions to discriminated-union return type (#3)

---

## 📋 Checklist for Implementation

When implementing fixes:

- [ ] Follow AGENTS.md guidelines strictly
- [ ] Run `pnpm check:types` after changes
- [ ] Run `pnpm lint` to auto-format
- [ ] Run `pnpm knip` to check for unused imports
- [ ] Test affected forms/pages manually in `pnpm dev`
- [ ] Update related documentation
- [ ] Create PR with clear description of changes

---

## 📚 Reference Files

**Security patterns:**

- `src/helpers/permissions.ts` - PBAC checks
- `src/components/captcha/verify.ts` - CAPTCHA verification
- `src/actions/contact/submitContactFormAction.tsx` - Proper form action pattern

**Form patterns:**

- `src/components/public/adhesion/form.tsx` - TanStack React Form reference
- `src/actions/adhesion/processAdhesionForm.ts` - Zod validation reference

**Validation schemas:**

- `src/schemas/` - Centralized schemas (members, bougeTaPrison, contact)

---

## Notes

- Priority levels are based on security impact and code quality
- Effort estimates assume working knowledge of the codebase
- Items can be parallelized (different features/routes)
- Consider creating feature branches for each major refactor
