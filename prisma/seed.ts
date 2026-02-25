import process from "node:process"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

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

        // Associations
        {
            name: "access:associations",
            title: "Accès Associations",
            category: "Associations",
            description: "Voir la page de gestion des associations"
        },
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

        // Bouge Ta Prison
        {
            name: "access:btp",
            title: "Accès BTP",
            category: "Bouge Ta Prison",
            description: "Voir les pages de gestion Bouge Ta Prison"
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
        const existing = await prisma.permission.findUnique({
            where: { name: permission.name }
        })

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
