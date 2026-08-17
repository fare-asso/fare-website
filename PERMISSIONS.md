# Permission System Documentation

This document lists all permissions required for the FARE Website application. These permissions should be created in the database and assigned to users as appropriate.

## Permission Categories

### Presse / Communiqués de Presse (CDP)

- `access:presse` - View presse/communiques de presse dashboard page
- `create:cdp` - Upload new communiqués de presse or dossiers de presse
- `delete:cdp` - Delete communiqués de presse

### Members (Bureau)

- `access:members` - View members dashboard page
- `create:member` - Add new bureau members
- `edit:member` - Edit member information and reorder members
- `delete:member` - Remove bureau members

### Elus / Instances / Conseils

- `access:elus` - View the elus management dashboard page
- `create:elu` - Add new elus
- `edit:elu` - Edit elu information
- `delete:elu` - Soft delete elus
- `access:instances` - View the instances management dashboard page
- `create:instance` - Add new instances
- `edit:instance` - Edit instance information
- `delete:instance` - Delete instances
- Note: Conseils have no dedicated permissions; they are governed by the `*:instance` permissions (`create:instance`, `edit:instance`, `delete:instance`).

### Associations

- `create:association` - Add new associations to the network
- `edit:association` - Edit association information
- `delete:association` - Delete associations
- `invite:representative` - Invite association representatives (creates ASSO_OWNER accounts)
- `approve:association` - Approve or decline pending association membership applications

### Events

- `access:events` - View events dashboard page
- `create:event` - Create new events
- `edit:event` - Edit existing events
- `delete:event` - Delete events

### Bagad'Asso

- `access:bagad-asso` - View Bagad'Asso dashboard pages (tickets & equipment)
- `create:bagad-equipment` - Add new equipment to the catalog
- `edit:bagad-equipment` - Edit equipment details
- `delete:bagad-equipment` - Remove equipment from catalog
- `edit:bagad-ticket` - Archive/unarchive tickets
- `delete:bagad-ticket` - Soft delete and hard delete tickets
- `edit:bagad-suggestion` - Archive/unarchive equipment suggestions

### Adhésions (Membership Applications)

- `access:adhesions` - View adhesions dashboard page
- `edit:adhesion` - Archive/unarchive adhesion requests
- `download:adhesion-folder` - Download adhesion folders (may contain sensitive information)

### Bouge Ta Prison

- `access:btp` - View Bouge Ta Prison dashboard pages (candidatures & questions)
- Note: Submitting tutor applications and questions are public actions (no permission required)

### Défense des droits

- `access:defense-droits` - View and configure the Défense des droits page (recipient address and response delay)
- Note: Submitting an assistance request is a public action (no permission required)

### Users

- `access:users` - View users dashboard page
- `create:user` - Create new users (currently not implemented)
- `edit:user` - Edit user information
- `delete:user` - Soft delete users
- `edit:user-permissions` - Manage user permissions

### Espace Asso (Association Portal)

- `access:espace-asso` - Access the association member portal
- `create:representative-password` - Create password for invited representatives

## Permission Naming Convention

Permissions follow the pattern: `<action>:<resource>`

**Actions:**

- `access` - View/read access to a section or resource
- `create` - Create new instances
- `edit` - Modify existing instances
- `delete` - Remove instances (soft or hard delete)
- `publish` - Publish content (make publicly visible)
- `download` - Download files or data
- `invite` - Invite new users

**Resources:**

- Singular form (e.g., `member`, `event`)
- Hyphenated compound names (e.g., `bagad-equipment`, `user-permissions`)

## Database Seeding

### Recommended Method: Prisma Seed Script

The easiest way to seed all permissions is to use the Prisma seed script:

```bash
pnpm prisma db seed
```

This will automatically create or update all permissions defined in `prisma/seed.ts`. The script uses `upsert` to avoid duplicate entries and updates existing permissions if their details have changed.

### Alternative Method: Direct SQL

Alternatively, you can add these permissions directly to your database using SQL:

```sql
INSERT INTO "Permission" (name, title, category, description) VALUES
-- Presse
('access:presse', 'Accès Presse', 'Presse', 'Voir la page de gestion de la presse'),
('create:cdp', 'Créer CDP', 'Presse', 'Ajouter des communiqués/dossiers de presse'),
('delete:cdp', 'Supprimer CDP', 'Presse', 'Supprimer des communiqués de presse'),

-- Members
('access:members', 'Accès Membres', 'Membres', 'Voir la page de gestion des membres du bureau'),
('create:member', 'Créer Membre', 'Membres', 'Ajouter de nouveaux membres du bureau'),
('edit:member', 'Modifier Membre', 'Membres', 'Modifier les informations des membres'),
('delete:member', 'Supprimer Membre', 'Membres', 'Retirer des membres du bureau'),

-- Elus / Instances / Conseils (conseils reuse the *:instance permissions)
('access:elus', 'Accès Elus', 'Elus', 'Voir la page de gestion des elus'),
('create:elu', 'Créer Elus', 'Elus', 'Ajouter de nouveaux elus'),
('edit:elu', 'Modifier Elus', 'Elus', 'Modifier les informations des elus'),
('delete:elu', 'Supprimer Elus', 'Elus', 'Supprimer des elus'),
('access:instances', 'Accès Instances', 'Elus', 'Voir la page de gestion des instances'),
('create:instance', 'Créer Instance', 'Elus', 'Ajouter de nouvelles instances'),
('edit:instance', 'Modifier Instance', 'Elus', 'Modifier les informations des instances'),
('delete:instance', 'Supprimer Instance', 'Elus', 'Supprimer des instances'),

-- Associations
('create:association', 'Créer Association', 'Associations', 'Ajouter de nouvelles associations'),
('edit:association', 'Modifier Association', 'Associations', 'Modifier les informations des associations'),
('delete:association', 'Supprimer Association', 'Associations', 'Supprimer des associations'),
('invite:representative', 'Inviter Représentant', 'Associations', 'Inviter des représentants d''associations'),
('approve:association', 'Approuver Association', 'Associations', 'Approuver ou refuser les demandes d''adhésion d''associations'),

-- Events
('access:events', 'Accès Événements', 'Événements', 'Voir la page de gestion des événements'),
('create:event', 'Créer Événement', 'Événements', 'Créer de nouveaux événements'),
('edit:event', 'Modifier Événement', 'Événements', 'Modifier des événements existants'),
('delete:event', 'Supprimer Événement', 'Événements', 'Supprimer des événements'),

-- Bagad'Asso
('access:bagad-asso', 'Accès Bagad''Asso', 'Bagad''Asso', 'Voir les pages de gestion Bagad''Asso'),
('create:bagad-equipment', 'Créer Matériel', 'Bagad''Asso', 'Ajouter du matériel au catalogue'),
('edit:bagad-equipment', 'Modifier Matériel', 'Bagad''Asso', 'Modifier les informations du matériel'),
('delete:bagad-equipment', 'Supprimer Matériel', 'Bagad''Asso', 'Retirer du matériel du catalogue'),
('edit:bagad-ticket', 'Modifier Ticket', 'Bagad''Asso', 'Archiver/désarchiver des tickets'),
('delete:bagad-ticket', 'Supprimer Ticket', 'Bagad''Asso', 'Supprimer des tickets'),
('edit:bagad-suggestion', 'Modifier Suggestion', 'Bagad''Asso', 'Archiver/désarchiver des suggestions de matériel'),

-- Adhésions
('access:adhesions', 'Accès Adhésions', 'Adhésions', 'Voir la page de gestion des adhésions'),
('edit:adhesion', 'Modifier Adhésion', 'Adhésions', 'Archiver/désarchiver des demandes'),
('download:adhesion-folder', 'Télécharger Dossier', 'Adhésions', 'Télécharger les dossiers d''adhésion'),

-- Bouge Ta Prison
('access:btp', 'Accès BTP', 'Bouge Ta Prison', 'Voir les pages de gestion Bouge Ta Prison'),

-- Défense des droits
('access:defense-droits', 'Accès Défense des droits', 'Défense des droits', 'Voir et configurer la page Défense des droits (adresse de réception et délai)'),

-- Users (already exist in system, documented here for completeness)
('access:users', 'Accès Utilisateurs', 'Utilisateurs', 'Voir la page de gestion des utilisateurs'),
('edit:user', 'Modifier Utilisateur', 'Utilisateurs', 'Modifier les informations utilisateur'),
('delete:user', 'Supprimer Utilisateur', 'Utilisateurs', 'Supprimer des utilisateurs'),
('edit:user-permissions', 'Gérer Permissions', 'Utilisateurs', 'Gérer les permissions utilisateur'),

-- Espace Asso
('access:espace-asso', 'Accès Espace Asso', 'Espace Asso', 'Accéder au portail des associations'),
('create:representative-password', 'Créer Mot de Passe', 'Espace Asso', 'Créer un mot de passe pour les représentants')
ON CONFLICT (name) DO NOTHING;
```

## Role-to-Permission Mapping (Recommended Defaults)

### ADMIN Role

Admins should have ALL permissions by default.

### ASSO_OWNER Role

Association representatives (created via invite):

- `access:espace-asso`
- `edit:association` (own association only - implement in future)

## Migration Notes

- All server actions now use `hasPermission(user, "permission:name")` instead of role checks
- Sidebar navigation automatically hides sections based on permissions
- Users without required permissions will see error messages when attempting restricted actions
- The `Role` enum is kept for future use with Espace Asso but is not used for access control

## Implementation Checklist

- [x] Update all server actions to use permission checks
- [x] Update sidebar navigation to hide sections based on permissions
- [ ] Seed database with all required permissions
- [ ] Assign permissions to existing users
- [ ] Create admin UI for permission management (future enhancement)
- [ ] Add permission-based field-level authorization (e.g., ASSO_OWNER can only edit their own association)
