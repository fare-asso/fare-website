import { FaRegFilePdf } from "react-icons/fa"

import type { CommuniqueDePresse } from "@/generated/prisma/client"
import { StorageUtils } from "@/helpers/supabase/storageUtils"

import CdpCard from "./CDPCard"

interface CDPListProps {
    communiques: CommuniqueDePresse[] | null
    canDelete: boolean
}

export default function CDPList({ communiques, canDelete }: CDPListProps) {
    const su = new StorageUtils()

    if (communiques == null) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="bg-destructive/10 rounded-full p-3">
                    <FaRegFilePdf size={24} className="text-destructive" />
                </div>
                <p className="text-destructive text-sm font-medium">
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
                <div className="bg-muted rounded-full p-3">
                    <FaRegFilePdf size={24} className="text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">Aucun document</p>
                <p className="text-muted-foreground text-xs">
                    Ajoutez un communique ou dossier de presse pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-4 shadow-xs md:p-6">
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
                        canDelete={canDelete}
                    />
                ))}
            </div>
        </div>
    )
}
