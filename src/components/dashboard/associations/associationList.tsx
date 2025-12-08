import { createClient } from "@/helpers/supabase/server"

import prisma from "@/helpers/db"
import AssociationCard from "./associationCard"

export default async function AssociationList() {
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
            <span className="text-xl text-red-800">
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
            />
        ))

        return (
            <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-6 shadow-xs">
                <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {assoCards}
                </div>
            </div>
        )
    }
}
