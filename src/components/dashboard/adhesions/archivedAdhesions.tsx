import AdhesionList from "@/components/dashboard/adhesions/adhesionList"
import type { Adhesion } from "@/generated/prisma/client"

interface ArchivedAdhesionsProps {
    adhesions: Adhesion[]
    canEdit: boolean
    canDownload: boolean
}

export default function ArchivedAdhesions({
    adhesions,
    canEdit,
    canDownload
}: ArchivedAdhesionsProps) {
    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {adhesions.length} demande{adhesions.length > 1 ? "s" : ""}
                </span>{" "}
                d'adhésion archivée{adhesions.length > 1 ? "s" : ""}.
            </p>
            <AdhesionList
                adhesions={adhesions}
                canEdit={canEdit}
                canDownload={canDownload}
            />
        </div>
    )
}
