# FARE Website

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## About

This project is a website for the Fédération des Associations du Réseau Étudiant de Haute-Bretagne (FARE). The FARE is a non-profit organization that represents students in the Ille-et-Vilaine and Côtes d'Armor regions. The website provides information about the FARE, its projects, and its member associations. It also includes features for managing memberships, events, and other activities.

## Getting Started

Make sure the `.env` file has all the correct values.

Run the development server:

```bash
pnpm dev
```

## Pending cleanup

- **Drop `BugReport` model + table:** the Bug Report feature was removed, but
  `model BugReport` is still in `schema.prisma` and its table still exists. The
  dev DB had unrelated drift from another feature branch that made
  `prisma migrate dev` want a full reset, so this was deferred. Once the
  migration history is reconciled: delete `model BugReport` from
  `schema.prisma`, then run
  `pnpm prisma migrate dev --name remove_bug_report_model`.
- **Migrate remaining `try/catch` blocks to the `tryCatch` helper, then
  drop the CI carve-out for `local/no-try-catch`:** the local oxlint rule
  `local/no-try-catch` (in `tools/oxlint-rules/`) is set to `warn` locally
  and flags ~90 existing call sites. To keep CI strict on every other
  warn-level rule, `oxlint.config.ts` flips this specific rule to `"off"`
  in CI via `isCI` from `std-env` (oxlint 1.65 silently ignores the CLI
  `-A` flag for jsPlugin rules, so this env-var toggle is the only working
  per-rule carve-out). To finish the migration: run `pnpm oxlint` locally
  to list every `local(no-try-catch)` finding, rewrite each with `tryCatch`
  from `@/lib/utils` (see AGENTS.md → Error Handling), then in
  `oxlint.config.ts` replace `isCI ? "off" : "warn"` with just `"warn"`
  and remove the `isCI` import.
