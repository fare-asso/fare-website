
import { createClient } from "@/helpers/supabase/server"

import prisma from "@/helpers/db";

import CdpCard from "./CDPCard";



export default async function CDPList() {

    // create supabase client
    const supabase = createClient();

    // fetch all cdp from DB
    const communiques = await prisma.communiqueDePresse.findMany({
        take: 32
    })

    if(communiques == null) {
        return(
            <span className="text-xl text-red-800">Echec du chargement des CDP, veuillez réessayer</span>
        )
    } else {

        const cdpCards: JSX.Element[] = communiques.map((cdp) => <CdpCard key={cdp.id} id={cdp.id} name={cdp.name} size={cdp.size} uploadDate={cdp.createdAt}
        url={supabase.storage.from('communique-de-presse').getPublicUrl(cdp.filePath).data.publicUrl}
        dlUrl={supabase.storage.from('communique-de-presse').getPublicUrl(cdp.filePath, {download: true}).data.publicUrl}/>)

        return(
            <div className="w-full h-full rounded-lg border bg-card text-card-foreground shadow-sm p-6 ">
                <div className="grid grid-cols-8 gap-8 w-full h-auto">
                    {cdpCards}
                </div>
            </div>
        )
    }

}