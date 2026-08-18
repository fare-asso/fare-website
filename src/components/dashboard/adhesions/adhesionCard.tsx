import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    BuildingIcon,
    MailIcon,
    MapPinIcon,
    PhoneIcon,
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
import type { Adhesion } from "@/generated/prisma/client"
import { locationDisplayName } from "@/helpers/location"

import AdhesionCardActions from "./adhesionCardActions"

interface AdhesionCardProps {
    adhesion: Adhesion
    canEdit: boolean
    canDownload: boolean
}

export default function AdhesionCard({
    adhesion,
    canEdit,
    canDownload
}: AdhesionCardProps) {
    const isArchived = adhesion.archived !== null

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
                                #{adhesion.id}
                            </Badge>
                            {adhesion.college && (
                                <Badge variant="outline">
                                    Collège {adhesion.college}
                                </Badge>
                            )}
                            {isArchived && (
                                <Badge
                                    variant="outline"
                                    className="text-muted-foreground"
                                >
                                    Archivée
                                </Badge>
                            )}
                        </div>
                        {adhesion.sigle ? (
                            <>
                                <CardTitle className="text-lg">
                                    {adhesion.sigle}
                                </CardTitle>
                                <CardDescription className="font-medium">
                                    {adhesion.nomComplet ||
                                        adhesion.association}
                                </CardDescription>
                            </>
                        ) : (
                            <CardTitle className="text-lg">
                                {adhesion.nomComplet || adhesion.association}
                            </CardTitle>
                        )}
                    </div>

                    {canEdit || canDownload ? (
                        <AdhesionCardActions
                            adhesion={adhesion}
                            canEdit={canEdit}
                            canDownload={canDownload}
                        />
                    ) : null}
                </div>
            </CardHeader>

            <CardContent className="flex flex-1 flex-col pt-0">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    {adhesion.email && (
                        <a
                            href={`mailto:${adhesion.email}`}
                            className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                        >
                            <MailIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">{adhesion.email}</span>
                        </a>
                    )}

                    {adhesion.telephonePortable && (
                        <a
                            href={`tel:${adhesion.telephonePortable}`}
                            className="text-muted-foreground hover:text-primary flex items-center gap-2 transition-colors"
                        >
                            <PhoneIcon className="h-4 w-4 shrink-0" />
                            <span>{adhesion.telephonePortable}</span>
                        </a>
                    )}

                    {adhesion.objetPrincipal && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <BuildingIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {adhesion.objetPrincipal}
                            </span>
                        </div>
                    )}

                    {adhesion.adresseAdministrative && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <MapPinIcon className="h-4 w-4 shrink-0" />
                            <span className="truncate">
                                {locationDisplayName(
                                    adhesion.adresseAdministrative
                                )}
                            </span>
                        </div>
                    )}

                    {adhesion.nombreAdherents > 0 && (
                        <div className="text-muted-foreground flex items-center gap-2">
                            <UsersIcon className="h-4 w-4 shrink-0" />
                            <span>
                                {adhesion.nombreAdherents} adhérent
                                {adhesion.nombreAdherents > 1 ? "s" : ""}
                            </span>
                        </div>
                    )}
                </div>

                <div className="text-muted-foreground mt-auto flex items-center justify-between border-t pt-3 text-xs">
                    {adhesion.nombreEtudiantsRepresentes > 0 && (
                        <span>
                            {adhesion.nombreEtudiantsRepresentes} étudiant
                            {adhesion.nombreEtudiantsRepresentes > 1
                                ? "s"
                                : ""}{" "}
                            représenté
                            {adhesion.nombreEtudiantsRepresentes > 1 ? "s" : ""}
                        </span>
                    )}
                    <span className="ml-auto">
                        Reçue le{" "}
                        {format(adhesion.createdAt, "d MMM yyyy", {
                            locale: fr
                        })}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
