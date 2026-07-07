import AdhesionList from "@/components/dashboard/adhesions/adhesionList"
import type { Adhesion } from "@/generated/prisma/client"

interface ActiveAdhesionsProps {
    adhesions: Adhesion[]
    canEdit: boolean
    canDownload: boolean
}

export default function ActiveAdhesions({
    adhesions,
    canEdit,
    canDownload
}: ActiveAdhesionsProps) {
    return (
        <div>
            <p className="my-4 text-sm text-gray-500">
                <span className="font-bold">
                    {adhesions.length} demande{adhesions.length > 1 ? "s" : ""}
                </span>{" "}
                d'adhésion en attente de traitement.
            </p>
            <AdhesionList
                adhesions={adhesions}
                canEdit={canEdit}
                canDownload={canDownload}
            />
        </div>
    )
}
