import { HandshakeIcon } from "lucide-react"

import type { Partenaire } from "@/generated/prisma/client"

import PartenaireCard from "./partenaireCard"

export type PartenaireWithLogo = {
    partenaire: Partenaire
    logoUrl: string
}

interface PartenaireListProps {
    partenaires: PartenaireWithLogo[] | null
    canEdit: boolean
    canDelete: boolean
}

export default function PartenaireList({
    partenaires,
    canEdit,
    canDelete
}: PartenaireListProps): React.JSX.Element {
    if (!partenaires) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="bg-destructive/10 rounded-full p-3">
                    <HandshakeIcon size={24} className="text-destructive" />
                </div>
                <p className="text-destructive text-sm font-medium">
                    Echec du chargement des partenaires
                </p>
                <p className="text-muted-foreground text-xs">
                    Veuillez rafraichir la page pour reessayer
                </p>
            </div>
        )
    }

    if (partenaires.length === 0) {
        return (
            <div className="bg-muted/30 flex h-64 flex-col items-center justify-center rounded-lg border border-dashed">
                <HandshakeIcon className="text-muted-foreground/50 mb-3 h-12 w-12" />
                <p className="text-muted-foreground font-medium">
                    Aucun partenaire
                </p>
                <p className="text-muted-foreground/70 mt-1 text-sm">
                    Ajoutez un partenaire pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="bg-card text-card-foreground h-full w-full overflow-y-auto rounded-lg border p-4 shadow-xs md:p-6">
            <p className="text-muted-foreground mb-4 text-sm">
                {partenaires.length} partenaire
                {partenaires.length > 1 ? "s" : ""}
            </p>
            <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {partenaires.map(({ partenaire, logoUrl }) => (
                    <PartenaireCard
                        key={partenaire.id}
                        partenaire={partenaire}
                        logoUrl={logoUrl}
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                ))}
            </div>
        </div>
    )
}
