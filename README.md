# FARE Website

## About

This project is a website for the Fédération des Associations du Réseau Étudiant de Haute-Bretagne (FARE). The FARE is a non-profit organization that represents students in the Ille-et-Vilaine and Côtes d'Armor regions. The website provides information about the FARE, its projects, and its member associations. It also includes features for managing memberships, events, and other activities.

## Getting Started

Make sure the `.env` file has all the correct values.

Run the development server:

```bash
pnpm dev
```

## Data retention (external cron)

Retention/anonymisation of form data is enforced by `POST /api/cron/purge`, but
the app does **not** schedule itself. An external scheduler (e.g. a Dokploy
scheduled task) must call it monthly with the `CRON_SECRET`:

```bash
curl -fsS -X POST https://fare-asso.fr/api/cron/purge \
  -H "Authorization: Bearer $CRON_SECRET"
```

⚠️ If the hosting/deployment changes, recreate this scheduled task, or the
retention durations promised in the privacy policy will no longer be enforced.
