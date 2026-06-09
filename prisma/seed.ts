import process from "node:process"

import { PrismaPg } from "@prisma/adapter-pg"

import { PrismaClient } from "../src/generated/prisma/client"
import { loadDbUrl } from "./loadDbUrl"

const connectionString = loadDbUrl("SUPABASE_POSTGRES_PRISMA_DIRECT_URL")
if (!connectionString) {
    throw new Error("SUPABASE_POSTGRES_PRISMA_DIRECT_URL is not set")
}

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
    console.log("🌱 Seeding permissions...")

    const permissions = [
        // Articles
        {
            name: "access:articles",
            title: "Accès Articles",
            category: "Articles",
            description: "Voir la page de gestion des articles"
        },
        {
            name: "create:article",
            title: "Créer Article",
            category: "Articles",
            description: "Créer de nouveaux articles"
        },
        {
            name: "edit:article",
            title: "Modifier Article",
            category: "Articles",
            description: "Modifier des articles existants"
        },
        {
            name: "delete:article",
            title: "Supprimer Article",
            category: "Articles",
            description: "Supprimer des articles"
        },
        {
            name: "publish:article",
            title: "Publier Article",
            category: "Articles",
            description: "Publier/dépublier des articles"
        },

        // Presse
        {
            name: "access:presse",
            title: "Accès Presse",
            category: "Presse",
            description: "Voir la page de gestion de la presse"
        },
        {
            name: "create:cdp",
            title: "Créer CDP",
            category: "Presse",
            description: "Ajouter des communiqués/dossiers de presse"
        },
        {
            name: "delete:cdp",
            title: "Supprimer CDP",
            category: "Presse",
            description: "Supprimer des communiqués de presse"
        },

        // Members
        {
            name: "access:members",
            title: "Accès Membres",
            category: "Membres",
            description: "Voir la page de gestion des membres du bureau"
        },
        {
            name: "create:member",
            title: "Créer Membre",
            category: "Membres",
            description: "Ajouter de nouveaux membres du bureau"
        },
        {
            name: "edit:member",
            title: "Modifier Membre",
            category: "Membres",
            description: "Modifier les informations des membres"
        },
        {
            name: "delete:member",
            title: "Supprimer Membre",
            category: "Membres",
            description: "Retirer des membres du bureau"
        },

        // Elus
        {
            name: "access:elus",
            title: "Accès Elus",
            category: "Elus",
            description: "Voir la page de gestion des elus"
        },
        {
            name: "create:elu",
            title: "Créer Elus",
            category: "Elus",
            description: "Ajouter de nouveaux elus"
        },
        {
            name: "edit:elu",
            title: "Modifier Elus",
            category: "Elus",
            description: "Modifier les informations des elus"
        },
        {
            name: "delete:elu",
            title: "Supprimer Elus",
            category: "Elus",
            description: "Supprimer des elus"
        },

        // Instances
        {
            name: "access:instances",
            title: "Accès Instances",
            category: "Elus",
            description: "Voir la page de gestion des instances"
        },
        {
            name: "create:instance",
            title: "Créer Instance",
            category: "Elus",
            description: "Ajouter de nouvelles instances"
        },
        {
            name: "edit:instance",
            title: "Modifier Instance",
            category: "Elus",
            description: "Modifier les informations des instances"
        },
        {
            name: "delete:instance",
            title: "Supprimer Instance",
            category: "Elus",
            description: "Supprimer des instances"
        },

        // Associations
        {
            name: "create:association",
            title: "Créer Association",
            category: "Associations",
            description: "Ajouter de nouvelles associations"
        },
        {
            name: "edit:association",
            title: "Modifier Association",
            category: "Associations",
            description: "Modifier les informations des associations"
        },
        {
            name: "delete:association",
            title: "Supprimer Association",
            category: "Associations",
            description: "Supprimer des associations"
        },
        {
            name: "invite:representative",
            title: "Inviter Représentant",
            category: "Associations",
            description: "Inviter des représentants d'associations"
        },
        {
            name: "approve:association",
            title: "Approuver Association",
            category: "Associations",
            description:
                "Approuver ou refuser les demandes d'adhésion d'associations"
        },

        // Partenaires
        {
            name: "access:partner",
            title: "Accéder Partenaires",
            category: "Partenaires",
            description: "Voir la page de gestion des partenaires"
        },
        {
            name: "create:partner",
            title: "Créer Partenaire",
            category: "Partenaires",
            description: "Ajouter de nouveaux partenaires"
        },
        {
            name: "edit:partner",
            title: "Modifier Partenaire",
            category: "Partenaires",
            description: "Modifier les informations des partenaires"
        },
        {
            name: "delete:partner",
            title: "Supprimer Partenaire",
            category: "Partenaires",
            description: "Supprimer des partenaires"
        },

        // Events
        {
            name: "access:events",
            title: "Accès Événements",
            category: "Événements",
            description: "Voir la page de gestion des événements"
        },
        {
            name: "create:event",
            title: "Créer Événement",
            category: "Événements",
            description: "Créer de nouveaux événements"
        },
        {
            name: "edit:event",
            title: "Modifier Événement",
            category: "Événements",
            description: "Modifier des événements existants"
        },
        {
            name: "delete:event",
            title: "Supprimer Événement",
            category: "Événements",
            description: "Supprimer des événements"
        },

        // Bagad'Asso
        {
            name: "access:bagad-asso",
            title: "Accès Bagad'Asso",
            category: "Bagad'Asso",
            description: "Voir les pages de gestion Bagad'Asso"
        },
        {
            name: "create:bagad-equipment",
            title: "Créer Matériel",
            category: "Bagad'Asso",
            description: "Ajouter du matériel au catalogue"
        },
        {
            name: "edit:bagad-equipment",
            title: "Modifier Matériel",
            category: "Bagad'Asso",
            description: "Modifier les informations du matériel"
        },
        {
            name: "delete:bagad-equipment",
            title: "Supprimer Matériel",
            category: "Bagad'Asso",
            description: "Retirer du matériel du catalogue"
        },
        {
            name: "edit:bagad-ticket",
            title: "Modifier Ticket",
            category: "Bagad'Asso",
            description: "Archiver/désarchiver des tickets"
        },
        {
            name: "delete:bagad-ticket",
            title: "Supprimer Ticket",
            category: "Bagad'Asso",
            description: "Supprimer des tickets"
        },

        // Adhésions
        {
            name: "access:adhesions",
            title: "Accès Adhésions",
            category: "Adhésions",
            description: "Voir la page de gestion des adhésions"
        },
        {
            name: "edit:adhesion",
            title: "Modifier Adhésion",
            category: "Adhésions",
            description: "Archiver/désarchiver des demandes"
        },
        {
            name: "download:adhesion-folder",
            title: "Télécharger Dossier",
            category: "Adhésions",
            description: "Télécharger les dossiers d'adhésion"
        },

        // Bouge Ta Prison
        {
            name: "access:btp",
            title: "Accès BTP",
            category: "Bouge Ta Prison",
            description: "Voir les pages de gestion Bouge Ta Prison"
        },

        // Défense des droits
        {
            name: "access:defense-droits",
            title: "Accès Défense des droits",
            category: "Défense des droits",
            description:
                "Voir et configurer la page Défense des droits (adresse de réception et délai)"
        },

        // Users
        {
            name: "access:users",
            title: "Accès Utilisateurs",
            category: "Utilisateurs",
            description: "Voir la page de gestion des utilisateurs"
        },
        {
            name: "edit:user",
            title: "Modifier Utilisateur",
            category: "Utilisateurs",
            description: "Modifier les informations utilisateur"
        },
        {
            name: "delete:user",
            title: "Supprimer Utilisateur",
            category: "Utilisateurs",
            description: "Supprimer des utilisateurs"
        },
        {
            name: "edit:user-permissions",
            title: "Gérer Permissions",
            category: "Utilisateurs",
            description: "Gérer les permissions utilisateur"
        },

        // Espace Asso
        {
            name: "access:espace-asso",
            title: "Accès Espace Asso",
            category: "Espace Asso",
            description: "Accéder au portail des associations"
        },
        {
            name: "create:representative-password",
            title: "Créer Mot de Passe",
            category: "Espace Asso",
            description: "Créer un mot de passe pour les représentants"
        }
    ]

    let createdCount = 0
    let updatedCount = 0

    for (const permission of permissions) {
        // oxlint-disable-next-line no-await-in-loop -- sequential seed is fine
        const existing = await prisma.permission.findUnique({
            where: { name: permission.name }
        })

        // oxlint-disable-next-line no-await-in-loop -- sequential seed is fine
        await prisma.permission.upsert({
            where: { name: permission.name },
            update: {
                title: permission.title,
                category: permission.category,
                description: permission.description
            },
            create: permission
        })

        if (existing) {
            updatedCount++
        } else {
            createdCount++
        }
    }

    console.log(
        `✅ Seeded ${createdCount} new permissions, updated ${updatedCount} existing permissions`
    )

    // Codebase is the source of truth: drop permissions that no longer exist
    // here. Their assignments must go first — the UserPermission FK is Restrict.
    const canonicalNames = permissions.map((p) => p.name)
    const removedAssignments = await prisma.userPermission.deleteMany({
        where: { permission: { name: { notIn: canonicalNames } } }
    })
    const removedPermissions = await prisma.permission.deleteMany({
        where: { name: { notIn: canonicalNames } }
    })
    console.log(
        `🧹 Removed ${removedPermissions.count} obsolete permissions (${removedAssignments.count} assignments)`
    )

    console.log(`📊 Total permissions in database: ${permissions.length}`)
}

main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error(e)
        await prisma.$disconnect()
        process.exit(1)
    })
