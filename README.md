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
