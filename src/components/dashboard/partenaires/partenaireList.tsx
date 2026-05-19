import { HandshakeIcon } from "lucide-react"
import prisma from "@/helpers/db"
import { createClient } from "@/helpers/supabase/server"
import PartenaireCard from "./partenaireCard"

interface PartenaireListProps {
    canEdit: boolean
    canDelete: boolean
}

export default async function PartenaireList({
    canEdit,
    canDelete
}: PartenaireListProps): Promise<React.JSX.Element> {
    const supabase = await createClient()

    const partenaires = await prisma.partenaire.findMany({
        orderBy: { name: "asc" }
    })

    if (partenaires == null) {
        return (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-12">
                <div className="rounded-full bg-destructive/10 p-3">
                    <HandshakeIcon size={24} className="text-destructive" />
                </div>
                <p className="font-medium text-destructive text-sm">
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
            <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed bg-muted/30">
                <HandshakeIcon className="mb-3 h-12 w-12 text-muted-foreground/50" />
                <p className="font-medium text-muted-foreground">
                    Aucun partenaire
                </p>
                <p className="mt-1 text-muted-foreground/70 text-sm">
                    Ajoutez un partenaire pour commencer
                </p>
            </div>
        )
    }

    return (
        <div className="h-full w-full overflow-y-auto rounded-lg border bg-card p-4 text-card-foreground shadow-xs md:p-6">
            <p className="mb-4 text-muted-foreground text-sm">
                {partenaires.length} partenaire
                {partenaires.length > 1 ? "s" : ""}
            </p>
            <div className="grid h-auto w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {partenaires.map((partenaire) => (
                    <PartenaireCard
                        key={partenaire.id}
                        partenaire={partenaire}
                        logoUrl={
                            supabase.storage
                                .from("partner-pictures")
                                .getPublicUrl(partenaire.logoPath).data
                                .publicUrl
                        }
                        canEdit={canEdit}
                        canDelete={canDelete}
                    />
                ))}
            </div>
        </div>
    )
}
