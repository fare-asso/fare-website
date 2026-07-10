import type { Adhesion } from "@/generated/prisma/client"

import AdhesionList from "./adhesionList"

interface ArchivedAdhesionsProps {
    data: Adhesion[]
    canEdit: boolean
    canDownload: boolean
}

export default function ArchivedAdhesions({
    data,
    canEdit,
    canDownload
}: ArchivedAdhesionsProps) {
    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {data.length} demande{data.length > 1 ? "s" : ""}
                </span>{" "}
                d'adhésion archivée{data.length > 1 ? "s" : ""}.
            </p>
            <AdhesionList
                adhesions={data}
                canEdit={canEdit}
                canDownload={canDownload}
            />
        </div>
    )
}
