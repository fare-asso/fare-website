"use client"

import type { Adhesion } from "@prisma/client"
import { FileTextIcon } from "lucide-react"
import AdhesionCard from "./adhesionCard"

export default function AdhesionList({ adhesions }: { adhesions: Adhesion[] }) {
    return (
        <div className="@container flex h-full flex-col">
            <div className="flex-1 overflow-y-auto">
                {adhesions.length > 0 ? (
                    <div className="grid @min-2xl:grid-cols-2 grid-cols-1 gap-4">
                        {adhesions.map((adhesion) => (
                            <AdhesionCard
                                key={adhesion.id}
                                adhesion={adhesion}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30">
                        <FileTextIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
                        <p className="font-medium text-muted-foreground">
                            Aucune demande d'adhésion
                        </p>
                        <p className="mt-1 text-muted-foreground/70 text-sm">
                            Les demandes d'adhésion apparaîtront ici
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
