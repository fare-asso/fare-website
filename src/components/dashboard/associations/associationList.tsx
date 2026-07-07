import { BuildingIcon } from "lucide-react"

import type { Association } from "@/generated/prisma/client"

import AssociationCard from "./associationCard"

interface AssociationListProps {
    assos:
        | (Association & { logoUrl: string; hasRepresentative: boolean })[]
        | null
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
    canApprove: boolean
}

export default function AssociationList({
    assos,
    canEdit,
    canDelete,
    canInvite,
    canApprove
}: AssociationListProps): React.JSX.Element {
    if (assos == null) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="bg-destructive/10 rounded-full p-3">
                    <BuildingIcon size={24} className="text-destructive" />
                </div>
                <p className="text-destructive text-sm font-medium">
                    Echec du chargement des associations
                </p>
                <p className="text-muted-foreground text-xs">
                    Veuillez rafraichir la page pour reessayer
                </p>
            </div>
        )
    }

    if (assos.length === 0) {
        return (
            <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                <BuildingIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
                <p className="text-muted-foreground font-medium">
                    Aucune association
                </p>
                <p className="text-muted-foreground/70 mt-1 text-sm">
                    Ajoutez une association pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-4 shadow-xs md:p-6">
            <p className="text-muted-foreground mb-4 text-sm">
                {assos.length} association{assos.length > 1 ? "s" : ""}
            </p>
            <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {assos.map((asso) => (
                    <AssociationCard
                        key={asso.id}
                        association={asso}
                        logoUrl={asso.logoUrl}
                        hasRepresentative={asso.hasRepresentative}
                        canEdit={canEdit}
                        canDelete={canDelete}
                        canInvite={canInvite}
                        canApprove={canApprove}
                    />
                ))}
            </div>
        </div>
    )
}
