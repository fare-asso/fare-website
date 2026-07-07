import type { Association } from "@/generated/prisma/client"

import AssociationMapCaller from "./associations/map/associationMapCaller"

export default function AssoMap({
    associations
}: {
    associations: Association[] | undefined
}) {
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
