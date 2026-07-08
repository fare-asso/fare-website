import { FileTextIcon } from "lucide-react"

import type { Adhesion } from "@/generated/prisma/client"

import AdhesionCard from "./adhesionCard"

interface AdhesionListProps {
    adhesions: Adhesion[]
    canEdit: boolean
    canDownload: boolean
}

export default function AdhesionList({
    adhesions,
    canEdit,
    canDownload
}: AdhesionListProps) {
    return (
        <div className="@container flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
                {adhesions.length > 0 ? (
                    <div className="grid grid-cols-1 gap-4 @min-2xl:grid-cols-2">
                        {adhesions.map((adhesion) => (
                            <AdhesionCard
                                key={adhesion.id}
                                adhesion={adhesion}
                                canEdit={canEdit}
                                canDownload={canDownload}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                        <FileTextIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
                        <p className="text-muted-foreground font-medium">
                            Aucune demande d'adhésion
                        </p>
                        <p className="text-muted-foreground/70 mt-1 text-sm">
                            Les demandes d'adhésion apparaîtront ici
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
