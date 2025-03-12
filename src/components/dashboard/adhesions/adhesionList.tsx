import prisma from "@/helpers/db";

import AdhesionCard from "./adhesionCard";
import { StorageUtils } from "@/helpers/supabase/storageUtils";

export default async function AdhesionList() {
    const su = new StorageUtils();

    // fetch all adhesion from DB
    const adhesions = await prisma.adhesion.findMany({
        take: 32,
        orderBy: {
            createdAt: "desc",
        },
    });

    if (!adhesions) {
        return (
            <span className="text-xl text-red-800">
                Echec du chargement des adhésions, veuillez réessayer
            </span>
        );
    } else {
        const adhesionCards: JSX.Element[] = adhesions.map((adhesion) => (
            <AdhesionCard key={adhesion.id} adhesion={adhesion} />
        ));

        return (
            <div className="relative h-full w-full rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
                <div className="grid h-full w-full grid-cols-1 gap-8 overflow-auto p-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
                    {adhesionCards.length > 0 ?
                        adhesionCards
                    :   <span>Aucunes demandes d'adhésion.</span>}
                </div>
            </div>
        );
    }
}
