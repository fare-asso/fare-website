import { createClient } from "@/helpers/supabase/server";

import prisma from "@/helpers/db";
import AssociationCard from "./associationCard";

import { Association } from "@prisma/client";

export default async function AssociationList() {
    // create supabase client
    const supabase = createClient();

    // fetch all members from DB
    const assos = await prisma.association.findMany({
        orderBy: {
            name: "asc",
        },
    });

    if (assos == null) {
        return (
            <span className="text-xl text-red-800">
                Echec du chargement des associations, veuillez réessayer
            </span>
        );
    } else {
        const assoCards: JSX.Element[] = assos.map((asso) => (
            <AssociationCard
                key={asso.id}
                association={asso}
                logoUrl={
                    supabase.storage
                        .from("association-pictures")
                        .getPublicUrl(asso.logoPath).data.publicUrl
                }
            />
        ));

        return (
            <div className="h-full w-full rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="grid h-full w-full grid-cols-1 gap-8 overflow-auto sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                    {assoCards}
                </div>
            </div>
        );
    }
}
