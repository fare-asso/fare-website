import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import AssociationCard from "./associationCard"

interface AssociationListProps {
    canEdit: boolean
    canDelete: boolean
    canInvite: boolean
}

export default async function AssociationList({
    canEdit,
    canDelete,
    canInvite
}: AssociationListProps) {
    // create supabase client
    const supabase = await createClient()

    // fetch all members from DB
    const assos = await prisma.association.findMany({
        orderBy: {
            name: "asc"
        }
    })

    if (assos == null) {
        return (
            <span className="text-red-800 text-xl">
                Echec du chargement des associations, veuillez réessayer
            </span>
        )
    } else {
        const assoCards = assos.map((asso) => (
            <AssociationCard
                key={asso.id}
                association={asso}
                logoUrl={
                    supabase.storage
                        .from("association-pictures")
                        .getPublicUrl(asso.logoPath).data.publicUrl
                }
                canEdit={canEdit}
                canDelete={canDelete}
                canInvite={canInvite}
            />
        ))

        return (
            <div className="h-full w-full overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
                <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {assoCards}
                </div>
            </div>
        )
    }
}
