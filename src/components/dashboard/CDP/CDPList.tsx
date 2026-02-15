import { FaRegFilePdf } from "react-icons/fa"
import prisma from "@/helpers/db"
import { StorageUtils } from "@/helpers/supabase/storageUtils"
import CdpCard from "./CDPCard"

export default async function CDPList() {
    const su = new StorageUtils()

    const communiques = await prisma.communiqueDePresse.findMany({
        take: 32,
        orderBy: { createdAt: "desc" }
    })

    if (communiques == null) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="rounded-full bg-destructive/10 p-3">
                    <FaRegFilePdf size={24} className="text-destructive" />
                </div>
                <p className="font-medium text-destructive text-sm">
                    Echec du chargement des communiques
                </p>
                <p className="text-muted-foreground text-xs">
                    Veuillez rafraichir la page pour reessayer
                </p>
            </div>
        )
    }

    if (communiques.length === 0) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="rounded-full bg-muted p-3">
                    <FaRegFilePdf size={24} className="text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">Aucun document</p>
                <p className="text-muted-foreground text-xs">
                    Ajoutez un communique ou dossier de presse pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="h-full w-full overflow-y-auto rounded-lg border bg-card p-4 text-card-foreground shadow-xs md:p-6">
            <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                {communiques.map((cdp) => (
                    <CdpCard
                        key={cdp.id}
                        cdp={cdp}
                        url={su
                            .from("communique-de-presse")
                            .getPublicUrl(cdp.filePath)}
                        dlUrl={su
                            .from("communique-de-presse")
                            .getPublicUrl(cdp.filePath, true)}
                    />
                ))}
            </div>
        </div>
    )
}
