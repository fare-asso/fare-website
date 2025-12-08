import type { Association } from "@prisma/client"
import prisma from "@/helpers/db"
import AssociationMapCaller from "./associations/map/associationMapCaller"

export default async function AssoMap() {
    let associations: Association[] | undefined

    try {
        associations = await prisma.association.findMany()
    } catch (_e) {
        console.error("Failed to fetch associations")
    }

    return (
        <div className="flex flex-col items-center">
            {associations ? (
                <AssociationMapCaller associations={associations} />
            ) : (
                <span>Echec de la récupération des associations</span>
            )}
        </div>
    )
}
