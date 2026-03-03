import { BuildingIcon } from "lucide-react"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import AssociationCard from "./associationCard"

interface AssociationListProps {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
    canApprove: boolean
}

export default async function AssociationList({
    canEdit,
    canDelete,
    canInvite,
    canApprove
}: AssociationListProps): Promise<React.JSX.Element> {
    const supabase = await createClient()

    const assos = (
        await prisma.association.findMany({
            orderBy: { name: "asc" },
            include: {
                representative: true
            }
        })
    ).sort((a, b) => {
        // Pending (approved === null) first, then alphabetical by name
        if (a.approved === null && b.approved !== null) return -1
        if (a.approved !== null && b.approved === null) return 1
        return 0
    })

    if (assos == null) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="rounded-full bg-destructive/10 p-3">
                    <BuildingIcon size={24} className="text-destructive" />
                </div>
                <p className="font-medium text-destructive text-sm">
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
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <BuildingIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">
                    Aucune association
                </p>
                <p className="mt-1 text-muted-foreground/70 text-sm">
                    Ajoutez une association pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="h-full w-full overflow-y-auto rounded-lg border bg-card p-4 text-card-foreground shadow-xs md:p-6">
            <p className="mb-4 text-muted-foreground text-sm">
                {assos.length} association{assos.length > 1 ? "s" : ""}
            </p>
            <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {assos.map((asso) => (
                    <AssociationCard
                        key={asso.id}
                        association={asso}
                        logoUrl={
                            supabase.storage
                                .from("association-pictures")
                                .getPublicUrl(asso.logoPath).data.publicUrl
                        }
                        hasRepresentative={!!asso.representative}
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
