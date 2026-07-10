import type { Adhesion } from "@/generated/prisma/client"

import AdhesionList from "./adhesionList"

interface ActiveAdhesionsProps {
    data: Adhesion[]
    canEdit: boolean
    canDownload: boolean
}

export default function ActiveAdhesions({
    data,
    canEdit,
    canDownload
}: ActiveAdhesionsProps) {
    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {data.length} demande{data.length > 1 ? "s" : ""}
                </span>{" "}
                d'adhésion en attente de traitement.
            </p>
            <AdhesionList
                adhesions={data}
                canEdit={canEdit}
                canDownload={canDownload}
            />
        </div>
    )
}
