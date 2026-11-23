import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    BuildingIcon,
    CalendarIcon,
    EuroIcon,
    MailIcon,
    MapPinIcon,
    PaperclipIcon,
    PhoneIcon,
    ShoppingBagIcon,
    UsersIcon
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import type { Remboursement } from "@/generated/prisma/client"

import RemboursementCardActions from "./remboursementCardActions"

interface RemboursementCardProps {
    remboursement: Remboursement
    canEdit: boolean
    canDownload: boolean
}

export default function RemboursementCard({
    remboursement,
    canEdit,
    canDownload
}: RemboursementCardProps) {
    const isArchived = remboursement.archived !== null
    const filesCount =
        1 +
        remboursement.justificatifsPaths.length +
        remboursement.piecesMetroBusPaths.length +
        remboursement.justificatifsPassagersPaths.length

    return (
        <Card
            className={`flex h-full flex-col transition-all hover:shadow-md ${
                isArchived
                    ? "border-muted bg-muted/30 opacity-75"
                    : "border-border"
            }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="shrink-0 font-mono text-xs"
                            >
                                #{remboursement.id}
                            </Badge>
                            <Badge variant="outline">
                                {remboursement.type === "train" &&
                                    "Déplacement en train"}
                                {remboursement.type === "voiture" &&
                                    "Déplacement en voiture"}
                                {remboursement.type === "metroBus" &&
                                    "Tickets de métro / bus"}
                                {remboursement.type === "car" &&
                                    "Déplacement en car"}
                                {remboursement.type === "achat" &&
                                    "Achat avec facture"}
                            </Badge>
                            {isArchived && (
                                <Badge
                                    variant="outline"
                                    className="text-muted-foreground"
                                >
                                    Archivée
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">
                            {remboursement.prenom} {remboursement.nom}
                        </CardTitle>
                        <CardDescription className="font-medium">
                            {remboursement.demandeur === "bureauTerritorial" &&
                                "Membre du Bureau Territorial"}
                            {remboursement.demandeur === "equipeTerritoriale" &&
                                "Membre de l'Équipe Territoriale"}
                            {remboursement.demandeur === "adminFARE" &&
                                "Administrateur·ice de la FARE"}
                            {remboursement.association
                                ? ` — ${remboursement.association}`
                                : ""}
                        </CardDescription>
                    </div>

                    {canEdit || canDownload ? (
                        <RemboursementCardActions
                            remboursement={remboursement}
                            canEdit={canEdit}
                            canDownload={canDownload}
                        />
                    ) : null}
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col gap-3 pt-0">
                <div className="grid gap-2 text-sm sm:grid-cols-2">
                    <a
                        href={`mailto:${remboursement.email}`}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                    >
                        <MailIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate">{remboursement.email}</span>
                    </a>

                    <a
                        href={`tel:${remboursement.telephone}`}
                        className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                    >
                        <PhoneIcon className="h-4 w-4 shrink-0" />
                        <span>{remboursement.telephone}</span>
                    </a>

                    {remboursement.association && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <BuildingIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {remboursement.association}
                            </span>
                        </div>
                    )}

                    {remboursement.dateVoyage && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <CalendarIcon className="h-4 w-4 shrink-0" />
                            <span>
                                {format(
                                    new Date(remboursement.dateVoyage),
                                    "d MMM yyyy",
                                    { locale: fr }
                                )}
                            </span>
                        </div>
                    )}

                    {(remboursement.depart || remboursement.arrivee) && (
                        <div className="text-muted-foreground flex items-center gap-2 sm:col-span-2">
                            <MapPinIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {remboursement.depart} → {remboursement.arrivee}
                            </span>
                        </div>
                    )}

                    {remboursement.objet && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <ShoppingBagIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {remboursement.objet}
                            </span>
                        </div>
                    )}

                    {remboursement.montantTTC && (
                        <div className="text-muted-foreground flex items-center gap-2 font-medium">
                            <EuroIcon className="h-4 w-4 shrink-0" />
                            <span>{remboursement.montantTTC} € TTC</span>
                        </div>
                    )}

                    {remboursement.personnes && (
                        <div className="text-muted-foreground flex items-start gap-2 sm:col-span-2">
                            <UsersIcon className="mt-0.5 h-4 w-4 shrink-0" />
                            <span className="whitespace-pre-line">
                                {remboursement.personnes}
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-muted-foreground mt-auto flex items-center justify-between border-t pt-3 text-xs">
                    <span className="flex items-center gap-1.5">
                        <PaperclipIcon className="h-3.5 w-3.5" />
                        {filesCount} pièce{filesCount > 1 ? "s" : ""} (RIB +{" "}
                        {remboursement.justificatifsPaths.length} justificatif
                        {remboursement.justificatifsPaths.length > 1 ? "s" : ""}
                        {remboursement.piecesMetroBusPaths.length > 0
                            ? ` + ${remboursement.piecesMetroBusPaths.length} métro/bus`
                            : ""}
                        {remboursement.justificatifsPassagersPaths.length > 0
                            ? ` + ${remboursement.justificatifsPassagersPaths.length} passagers`
                            : ""}
                        )
                    </span>
                    <span className="ml-auto">
                        Reçue le{" "}
                        {format(
                            new Date(remboursement.createdAt),
                            "d MMM yyyy",
                            {
                                locale: fr
                            }
                        )}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
