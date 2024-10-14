
import prisma from "@/helpers/db";

import CdpCard from "./CDPCard";
import { StorageUtils } from "@/helpers/supabase/storageUtils";

export default async function CDPList() {

    const su = new StorageUtils();

    // fetch all cdp from DB
    const communiques = await prisma.communiqueDePresse.findMany({
        take: 32
    })

    if(communiques == null) {
        return(
            <span className="text-xl text-red-800">Echec du chargement des CDP, veuillez réessayer</span>
        )
    } else {

        const cdpCards: JSX.Element[] = communiques.map((cdp) => <CdpCard key={cdp.id} cdp={cdp}
        url={su.from('communique-de-presse').getPublicUrl(cdp.filePath)}
        dlUrl={su.from('communique-de-presse').getPublicUrl(cdp.filePath, true)}/>)

        return(
            <div className="relative w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm p-6 ">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 w-full h-full overflow-auto p-1">
                    {cdpCards.length > 0 ?
                        cdpCards :
                        <span>Aucuns documents.</span>
                    }
                </div>
            </div>
        )
    }

}