import process from "node:process"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function main() {
    // Seed the delete:user permission if it doesn't exist
    const deleteUserPermission = await prisma.permission.upsert({
        where: { name: "delete:user" },
        update: {},
        create: {
            name: "delete:user",
            title: "Supprimer des utilisateurs",
            category: "Utilisateurs",
            description:
                "Permet de supprimer (archiver) des utilisateurs du système"
        }
    })

    console.log("Seeded permission:", deleteUserPermission)
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
