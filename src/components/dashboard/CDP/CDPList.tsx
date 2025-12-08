import prisma from "@/helpers/db"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import CdpCard from "./CDPCard"

export default async function CDPList() {
    const su = new StorageUtils()

    // fetch all cdp from DB
    const communiques = await prisma.communiqueDePresse.findMany({
        take: 32
    })

    if (communiques == null) {
        return (
            <span className="text-red-800 text-xl">
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
            <div className="h-full w-full overflow-y-auto rounded-lg border bg-card p-6 text-card-foreground shadow-xs">
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
