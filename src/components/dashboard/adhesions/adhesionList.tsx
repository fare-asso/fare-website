import prisma from "@/helpers/db";

import AdhesionCard from "./adhesionCard";
import { StorageUtils } from "@/helpers/supabase/storageUtils";

export default async function AdhesionList() {
    const su = new StorageUtils();

    // fetch all adhesion from DB
    const adhesions = await prisma.adhesion.findMany({
        take: 32,
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
            <div className="relative w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm p-6 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 w-full h-full overflow-auto p-1">
                    {adhesionCards.length > 0 ? (
                        adhesionCards
                    ) : (
                        <span>Aucunes demandes d'adhésion.</span>
                    )}
                </div>
            </div>
        );
    }
}
