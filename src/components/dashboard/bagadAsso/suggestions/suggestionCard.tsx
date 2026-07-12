import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    ExternalLinkIcon,
    MailIcon,
    UserIcon
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import LoadingRing from "@/components/dashboard/loadingRing"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { BagadAssoSuggestion } from "@/generated/prisma/client"
import { equipmentTypeLabel } from "@/schemas/bagadAsso"

export default function BagadAssoSuggestionCard({
    suggestion
}: {
    suggestion: BagadAssoSuggestion
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const isArchived = suggestion.archived !== null

    const onArchive = async () => {
        setIsLoading(true)

        const { data, error } = await actions.bagadAsso.archiveSuggestionAction(
            suggestion.id
        )

        if (error || !data.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("La suggestion a été archivée.")
            await queryClient.invalidateQueries({
                queryKey: ["bagadSuggestions"]
            })
        }
        setIsLoading(false)
    }

    const onUnarchive = async () => {
        setIsLoading(true)

        const { data, error } =
            await actions.bagadAsso.unarchiveSuggestionAction(suggestion.id)

        if (error || !data.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("La suggestion a été désarchivée.")
            await queryClient.invalidateQueries({
                queryKey: ["bagadSuggestions"]
            })
        }
        setIsLoading(false)
    }

    return (
        <Card
            className={`gap-3 transition-all hover:shadow-md ${
                isArchived
                    ? "border-muted bg-muted/30 opacity-75"
                    : "border-border"
            }`}
        >
            <CardHeader>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1 space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                            <Badge
                                variant="secondary"
                                className="shrink-0 font-mono text-xs"
                            >
                                #{suggestion.id}
                            </Badge>
                            <Badge variant="outline">
                                {equipmentTypeLabel(suggestion.equipmentType)}
                            </Badge>
                            {isArchived ? (
                                <Badge
                                    variant="outline"
                                    className="text-muted-foreground"
                                >
                                    Archivée
                                </Badge>
                            ) : (
                                <Badge
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                >
                                    À traiter
                                </Badge>
                            )}
                        </div>
                        <CardTitle className="text-lg">
                            {suggestion.equipmentName}
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                            {suggestion.associationName}
                        </CardDescription>
                    </div>

                    <AlertDialog>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="icon"
                                        className={`shrink-0 ${
                                            isArchived
                                                ? "text-primary hover:bg-primary/10 hover:text-primary"
                                                : "text-muted-foreground hover:text-foreground"
                                        }`}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <LoadingRing className="m-0!" />
                                        ) : isArchived ? (
                                            <ArchiveRestoreIcon className="h-4 w-4" />
                                        ) : (
                                            <ArchiveIcon className="h-4 w-4" />
                                        )}
                                        <span className="sr-only">
                                            {isArchived
                                                ? "Désarchiver"
                                                : "Archiver"}
                                        </span>
                                    </Button>
                                </AlertDialogTrigger>
                            </TooltipTrigger>
                            <TooltipContent>
                                {isArchived ? "Désarchiver" : "Archiver"}
                            </TooltipContent>
                        </Tooltip>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {isArchived
                                        ? "Désarchiver la suggestion ?"
                                        : "Archiver la suggestion ?"}
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div>
                                        {isArchived ? (
                                            <p>
                                                La suggestion #{suggestion.id} "
                                                {suggestion.equipmentName}" sera
                                                restaurée et réapparaîtra dans
                                                la liste des suggestions
                                                actives.
                                            </p>
                                        ) : (
                                            <>
                                                <p>
                                                    La suggestion #
                                                    {suggestion.id} "
                                                    {suggestion.equipmentName}"
                                                    sera marquée comme traitée
                                                    et masquée de la liste.
                                                </p>
                                                <p className="mt-1">
                                                    Elle pourra être restaurée
                                                    si besoin.
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={
                                        isArchived ? onUnarchive : onArchive
                                    }
                                >
                                    {isArchived ? "Désarchiver" : "Archiver"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            </CardHeader>

            <CardContent>
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <UserIcon className="h-4 w-4 shrink-0" />
                        <span>
                            {suggestion.firstName} {suggestion.lastName},{" "}
                            {suggestion.position}
                        </span>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-2">
                        <MailIcon className="h-4 w-4 shrink-0" />
                        <a
                            href={`mailto:${suggestion.contactEmail}`}
                            className="hover:text-foreground truncate transition-colors hover:underline"
                        >
                            {suggestion.contactEmail}
                        </a>
                    </div>

                    {suggestion.referenceUrl && (
                        <div className="text-muted-foreground flex items-center gap-2 sm:col-span-2">
                            <ExternalLinkIcon className="h-4 w-4 shrink-0" />
                            <a
                                href={suggestion.referenceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-foreground truncate transition-colors hover:underline"
                            >
                                {suggestion.referenceUrl}
                            </a>
                        </div>
                    )}
                </div>

                {suggestion.details && (
                    <p className="text-muted-foreground mt-4 text-sm whitespace-pre-line">
                        {suggestion.details}
                    </p>
                )}

                <div className="text-muted-foreground mt-4 flex items-center justify-end border-t pt-3 text-xs">
                    <span>
                        Envoyée le{" "}
                        {format(suggestion.creationDate, "d MMM yyyy", {
                            locale: fr
                        })}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
