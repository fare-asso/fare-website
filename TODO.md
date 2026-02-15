# TODO.md

A prioritized list of improvements, refactors, and fixes needed for the FARE Website project.

---

## 🔴 CRITICAL (Address ASAP - Security)

### 1. Add CAPTCHA to Bouge-ta-Prison Public Forms

**Status:** Todo  
**Severity:** High  
**Impact:** Spam prevention, form abuse protection  
**Effort:** 2-3 hours

**Problem:**
Two public forms accepting user submissions (file uploads + database records) lack CAPTCHA protection, unlike other public forms:

- Tutor application (`src/app/(home)/projets/bouge-ta-prison/tutorat/TutorApplicationForm.tsx`)
- Tutor question submission (`src/app/(home)/projets/bouge-ta-prison/tutorat/question/QuestionForm.tsx`)

**Required Changes:**

1. Add `<Captcha>` component to both form components (follow pattern in `src/components/public/contact/contactForm.tsx`)
2. Update server actions to validate CAPTCHA:
    - `src/actions/bouge-ta-prison/submitTutorApplication.tsx`
    - `src/actions/bouge-ta-prison/submitTutorQuestion.tsx`
3. Use `verifyCaptcha()` helper from `src/helpers/captcha/verify.ts`

**Reference Implementation:**

- See `src/app/(home)/a-propos/contact/page.tsx` for working CAPTCHA pattern

---

### 2. Add Authentication Check to Espace Asso Layout

**Status:** Todo  
**Severity:** High  
**Impact:** Unauthorized access to member portal  
**Effort:** 1 hour

**Problem:**
`src/app/espace-asso/layout.tsx` (lines 1-30) has **no authentication check**, allowing unauthenticated users to access the layout and any future subroutes. Dashboard correctly implements this check.

**Required Changes:**

1. Add to `src/app/espace-asso/layout.tsx` (following `src/app/dashboard/layout.tsx` pattern):
    ```typescript
    const user = await getCurrentUserWithPermissions();
    if (!user) redirect("/login");
    ```
2. Consider what role/permission is needed for espace-asso access
3. Update the placeholder page (`src/app/espace-asso/page.tsx`) with actual content

**Reference Implementation:**

- `src/app/dashboard/layout.tsx` (lines 25-30)

---

### 3. Implement Proper Zod Validation in Public Form Actions

**Status:** Todo  
**Severity:** High  
**Impact:** Form security, data integrity  
**Effort:** 3-4 hours

**Problem:**
Public form actions lack server-side Zod validation, relying only on client-side checks:

1. **`submitTutorApplication.tsx`** (lines 12-91): Manual FormData parsing, no Zod schema validation in action
2. **`submitTutorQuestion.tsx`**: Same issue as above
3. **`bugReportAction.tsx`** (lines 30-32): Uses basic string checks instead of Zod schema

This violates AGENTS.md guideline: "All forms must use Zod v4 schemas for validation" and "Server actions validate input before processing"

**Required Changes:**

1. Create Zod schemas for each form in the action files
2. Use `safeParse()` before database operations (follow pattern in `src/actions/contact/submitContactFormAction.tsx`)
3. Return proper error responses with `fieldErrors` format

**Reference Implementation:**

- `src/actions/contact/submitContactFormAction.tsx` (proper pattern)
- `src/actions/adhesion/processAdhesionForm.ts` (comprehensive validation)

---

## 🟠 HIGH PRIORITY (Address this quarter)

### 4. Add HTML Sanitization to Rich Text Editor Output

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

**Reference Implementation:**

```typescript
import DOMPurify from 'isomorphic-dompurify'
const sanitizedHtml = DOMPurify.sanitize(html, { ALLOWED_TAGS: ['p', 'br', 'strong', ...] })
```

**Files to Update:**

- `src/helpers/tiptap/jsonToHtml.ts`
- `src/components/ui/rich-text-editor/contentHTML.tsx`

---

### 5. Standardize Form Handling to TanStack React Form

**Status:** Todo  
**Severity:** Medium  
**Impact:** Code maintainability, consistency  
**Effort:** 8-10 hours

**Problem:**
Project uses **3 different form handling patterns** inconsistently:

1. **TanStack React Form** (preferred, modern):
    - `src/components/public/adhesion/form.tsx`
    - `src/components/public/bagadAsso/form.tsx`
    - `src/components/public/contact/contactForm.tsx`

2. **React Hook Form** (legacy, to be removed):
    - `src/app/(home)/projets/bouge-ta-prison/tutorat/TutorApplicationForm.tsx`
    - `src/app/(home)/projets/bouge-ta-prison/tutorat/question/QuestionForm.tsx`
    - `src/components/dashboard/members/addMemberButton.tsx`
    - `src/components/dashboard/members/editMemberButton.tsx`
    - `src/app/dashboard/users/[id]/userInfoForm.tsx`

3. **useFormState** (React DOM, less preferred):
    - `src/components/espaceAsso/createPasswordForm.tsx`
    - `src/components/dashboard/event/editEventButton.tsx`

AGENTS.md explicitly states: "TanStack React Form + Zod v4 validation"

**Required Changes:**

1. Migrate all React Hook Form components to TanStack React Form
2. Replace remaining `useFormState` calls with `useActionState` pattern
3. Ensure all forms pair with Zod validation in server actions

**Priority Order:**

1. Migrate tutor forms (public-facing, security-critical)
2. Migrate member management forms
3. Migrate user info form
4. Update form state patterns

**Reference Implementation:**

- `src/components/public/adhesion/form.tsx`

---

### 6. Consolidate Duplicate Zod Validation Schemas

**Status:** Todo  
**Severity:** Medium  
**Impact:** Code DRY, maintenance  
**Effort:** 2-3 hours

**Problem:**
Validation schemas are duplicated across action and component files:

**Member Schema duplicated in 3 locations:**

- `src/actions/members/addMemberAction.tsx` (lines 9-14)
- `src/actions/members/editMemberAction.tsx` (lines 9-14)
- `src/components/dashboard/members/addMemberButton.tsx` (lines 28-61)
- `src/components/dashboard/members/editMemberButton.tsx` (lines 39-63)

This violates DRY principle and makes schema updates error-prone.

**Required Changes:**

1. Create `src/schemas/members.ts` with all member-related schemas
2. Create similar schema files for other domains (articles, events, etc.)
3. Import schemas in both action files and component files
4. Update type inference: `z.infer<typeof MemberSchema>`

**Files to Create:**

- `src/schemas/members.ts`
- `src/schemas/articles.ts`
- `src/schemas/events.ts`
- (and others as needed)

**Files to Update:**
All action and component files that define duplicate schemas

---

## 🟡 MEDIUM PRIORITY (Address this quarter)

### 7. Fix Type Safety Violations (z.any() usage)

**Status:** Todo  
**Severity:** Medium  
**Impact:** Type safety, runtime errors  
**Effort:** 2 hours

**Problem:**
Forms use `z.any()` for conditional server-side type checking, breaking type safety:

**In `src/components/dashboard/members/addMemberButton.tsx` (lines 32-44):**

```typescript
picture: typeof window === "undefined" ?
    z.any() // ❌ Type safety violation
:   z.instanceof(FileList).optional();
```

Same issue in `src/components/dashboard/members/editMemberButton.tsx` (lines 46-66)

This pattern makes it impossible to properly validate the picture field during form construction.

**Required Changes:**

1. Move file validation to server action level
2. Use `z.unknown().refine()` instead of `z.any()` if conditional validation is necessary
3. Or restructure schema definition to avoid conditionals

**Reference Pattern:**

```typescript
const schema = z.object({
    picture: z.instanceof(FileList).optional().catch(undefined),
});
```

---

### 8. Add Missing revalidatePath() to Bug Report Action

**Status:** Todo  
**Severity:** Medium  
**Impact:** Cache staleness on bug report dashboard  
**Effort:** 15 minutes

**Problem:**
`src/actions/bug-report/bugReportAction.tsx` creates database records but **doesn't call `revalidatePath()`**, unlike all other public form actions:

**Examples of proper revalidatePath calls:**

- `processAdhesionForm.ts` (line 323): `revalidatePath("/(home)")`
- `submitBagadAssoFormAction.ts` (line 100): `revalidatePath("/dashboard/bagad-asso")`
- `submitTutorApplication.tsx` (line 89): `revalidatePath("/dashboard/bouge-ta-prison")`

**Required Changes:**

1. Add `import { revalidatePath } from "next/cache"` at top of file
2. After successful record creation, add: `revalidatePath("/dashboard/bug-reports")`

**Files to Update:**

- `src/actions/bug-report/bugReportAction.tsx`

---

### 9. Standardize Server Action Return Types

**Status:** Todo  
**Severity:** Low-Medium  
**Impact:** API consistency, testability  
**Effort:** 3 hours

**Problem:**
Server actions return inconsistent response shapes:

**Standard pattern (most actions):**

```typescript
{ success: boolean; error?: string; fieldErrors?: Record<string, string[]> }
```

**Inconsistent patterns in tutor actions:**

```typescript
// submitTutorApplication.tsx returns:
{ success: boolean; errors?: { [x: string]: string }[] }
```

The array-based error format breaks consistency.

**Required Changes:**

1. Create a shared response type in `src/lib/types.ts` or `src/helpers/types.ts`:
    ```typescript
    export type ActionResponse<T = void> = {
        success: boolean;
        error?: string;
        data?: T;
        fieldErrors?: Record<string, string[]>;
    };
    ```
2. Update all server actions to use this type
3. Standardize error responses across all actions

**Files to Update:**

- `src/actions/bouge-ta-prison/submitTutorApplication.tsx` (line 14-27)
- `src/actions/bouge-ta-prison/submitTutorQuestion.tsx`
- All other action files to ensure consistency

---

## 🟢 LOW PRIORITY (Nice to have)

### 10. Remove Unused CAPTCHA State in Bug Report Form

**Status:** Todo  
**Severity:** Low  
**Impact:** Code cleanliness  
**Effort:** 15 minutes

**Problem:**
`src/components/public/bug-report/form.tsx` (line 14) captures CAPTCHA value but doesn't use it:

```typescript
const [_captchaValue, setCaptchaValue] = useState<string | null>(null);
// Set but never used in validation
```

**Required Changes:**

1. Remove unused state variable and setter
2. Ensure CAPTCHA verification happens in server action (likely already does via formData)
3. Simplify component

---

### 11. Verify and Document RBAC Permission Patterns

**Status:** Todo  
**Severity:** Low  
**Impact:** Security clarity  
**Effort:** 2-3 hours

**Problem:**
Permission checking is mostly correct but uses inconsistent approaches:

1. Some actions use `getCurrentUserRole()` (checking role string)
2. Others use `getCurrentUserWithPermissions()` (granular permissions)

Mix-and-match approaches can lead to subtle bugs.

**Files to Audit:**

- `src/actions/bagadAsso/addEquipmentAction.tsx` (role-only check)
- `src/actions/events/createEventAction.tsx` (role-only check)
- `src/actions/users/deleteUser.ts` (granular permission check)

**Required Changes:**

1. Document the permission checking pattern in AGENTS.md
2. Ensure all sensitive operations use consistent approach (recommend granular)
3. Add `// RBAC checked` comments to verified actions

---

### 12. Migrate Remaining useFormState to useActionState

**Status:** Todo  
**Severity:** Low  
**Impact:** API consistency, deprecation warning avoidance  
**Effort:** 1 hour

**Problem:**
6 components use deprecated `useFormState` from React-DOM instead of modern `useActionState`:

**Files to Update:**

- `src/components/espaceAsso/createPasswordForm.tsx`
- `src/components/dashboard/event/editEventButton.tsx`
- (and 4 others)

While functional, Next.js 16 prefers `useActionState` from React.

**Required Changes:**

1. Replace `import { useFormState } from "react-dom"` with `import { useActionState } from "react"`
2. Update hook usage accordingly

---

## 📊 Action Plan by Timeline

### Immediate (This Week)

- [ ] Add CAPTCHA to Bouge-ta-Prison forms (#1)
- [ ] Add auth check to espace-asso (#2)
- [ ] Implement Zod validation in public form actions (#3)

### Short Term (Next 2 Weeks)

- [ ] Add HTML sanitization to rich text (#4)
- [ ] Fix z.any() type safety (#7)
- [ ] Add missing revalidatePath (#8)
- [ ] Remove unused CAPTCHA state (#10)

### Medium Term (Next Month)

- [ ] Standardize form handling to TanStack (#5)
- [ ] Consolidate Zod schemas (#6)
- [ ] Standardize server action return types (#9)
- [ ] Verify RBAC patterns (#11)

### Long Term (Next Quarter)

- [ ] Migrate useFormState to useActionState (#12)

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

- `src/helpers/permissions.ts` - RBAC checks
- `src/helpers/captcha/verify.ts` - CAPTCHA verification
- `src/actions/contact/submitContactFormAction.tsx` - Proper form action pattern

**Form patterns:**

- `src/components/public/adhesion/form.tsx` - TanStack React Form reference
- `src/actions/adhesion/processAdhesionForm.ts` - Zod validation reference

**Validation schemas:**

- `src/schemas/` - Centralized schemas (to be created)

---

## Notes

- Priority levels are based on security impact and code quality
- Effort estimates assume working knowledge of the codebase
- Many items can be parallelized (different features/routes)
- Consider creating feature branches for each major refactor
