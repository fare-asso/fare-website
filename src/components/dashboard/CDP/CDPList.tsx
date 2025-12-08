import prisma from "@/helpers/db"

import CdpCard from "./CDPCard"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

export default async function CDPList() {
    const su = new StorageUtils()

    // fetch all cdp from DB
    const communiques = await prisma.communiqueDePresse.findMany({
        take: 32
    })

    if (communiques == null) {
        return (
            <span className="text-xl text-red-800">
                Echec du chargement des CDP, veuillez réessayer
            </span>
        )
    } else {
        const cdpCards = communiques.map((cdp) => (
            <CdpCard
                key={cdp.id}
                cdp={cdp}
                url={su.from("communique-de-presse").getPublicUrl(cdp.filePath)}
                dlUrl={su
                    .from("communique-de-presse")
                    .getPublicUrl(cdp.filePath, true)}
            />
        ))

        return (
            <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-6 shadow-xs">
                <div className="grid h-auto w-full grid-cols-1 gap-4 overflow-y-auto p-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                    {cdpCards.length > 0 ? (
                        cdpCards
                    ) : (
                        <span>Aucuns documents.</span>
                    )}
                </div>
            </div>
        )
    }
}
