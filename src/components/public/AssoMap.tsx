import type { Association } from "@/generated/prisma/client"

type AssociationWithLogo = Association & { logoUrl: string }

import AssociationMapCaller from "./associations/map/associationMapCaller"

export default function AssoMap({
    associations
}: {
    associations: AssociationWithLogo[] | undefined
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
