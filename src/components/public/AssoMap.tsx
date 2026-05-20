import prisma from "@/helpers/db"
import { captureActionError } from "@/lib/sentry"
import { tryCatch } from "@/lib/utils"

import AssociationMapCaller from "./associations/map/associationMapCaller"

export default async function AssoMap() {
    const result = await tryCatch(
        prisma.association.findMany({
            where: {
                approved: { not: null }
            }
        })
    )
    if (!result.success) {
        captureActionError(result.error)
    }
    const associations = result.success ? result.value : undefined

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
