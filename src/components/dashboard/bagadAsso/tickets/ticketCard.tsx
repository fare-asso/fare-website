import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { format, isBefore } from "date-fns"
import { fr } from "date-fns/locale"
import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    CalendarIcon,
    CheckIcon,
    MapPinIcon,
    Undo2Icon,
    UserIcon,
    UsersIcon
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

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
import type { BagadAssoTicket } from "@/generated/prisma/client"
import { formatEventDateRangeCompact } from "@/helpers/eventDate"
import { locationDisplayName } from "@/helpers/location"

import LoadingRing from "../../loadingRing"

export default function BagadAssoTicketCard({
    ticket
}: {
    ticket: BagadAssoTicket
}) {
    const [isLoading, setIsLoading] = useState<boolean>(false)
    const [isValidateLoading, setIsValidateLoading] = useState<boolean>(false)
    const queryClient = useQueryClient()

    const isArchived = ticket.deleted !== null
    const isValidated = ticket.validated !== null
    const isExpired = isBefore(
        new Date(ticket.eventEndDate ?? ticket.eventDate),
        new Date()
    )

    const onToggleValidated = async () => {
        setIsValidateLoading(true)

        const { data, error } =
            await actions.bagadAsso.setTicketValidatedAction({
                ticketId: ticket.id,
                validated: !isValidated
            })

        if (error || !data.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success(
                isValidated
                    ? "Le ticket est de nouveau à traiter."
                    : "Le ticket a été validé."
            )
            await queryClient.invalidateQueries({
                queryKey: ["bagadTickets"]
            })
        }
        setIsValidateLoading(false)
    }

    const onArchive = async () => {
        setIsLoading(true)

        const { data, error } =
            await actions.bagadAsso.deleteBagadAssoTicketAction(ticket.id)

        if (error || !data.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le ticket a été archivé.")
            await queryClient.invalidateQueries({
                queryKey: ["bagadTickets"]
            })
        }
        setIsLoading(false)
    }

    const onUnarchive = async () => {
        setIsLoading(true)

        const { data, error } =
            await actions.bagadAsso.unarchiveBagadAssoTicketAction(ticket.id)

        if (error || !data.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le ticket a été désarchivé.")
            await queryClient.invalidateQueries({
                queryKey: ["bagadTickets"]
            })
        }
        setIsLoading(false)
    }

    const getStatusBadge = () => {
        if (isArchived) {
            return (
                <Badge variant="outline" className="text-muted-foreground">
                    Archivé
                </Badge>
            )
        }
        if (isExpired) {
            return <Badge variant="destructive">Terminé</Badge>
        }
        if (isValidated) {
            return (
                <Badge
                    variant="default"
                    className="bg-blue-600 hover:bg-blue-700"
                >
                    Validé
                </Badge>
            )
        }
        return (
            <Badge
                variant="default"
                className="bg-green-600 hover:bg-green-700"
            >
                À venir
            </Badge>
        )
    }

    return (
        <Card
            className={`transition-all hover:shadow-md ${
                isArchived
                    ? "border-muted bg-muted/30 opacity-75"
                    : isExpired
                      ? "border-destructive/30 bg-destructive/5"
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
                                #{ticket.id}
                            </Badge>
                            {getStatusBadge()}
                        </div>
                        <CardTitle className="text-lg">
                            <a
                                href={`/dashboard/bagadAsso/tickets/${ticket.id}`}
                                className="hover:text-primary transition-colors hover:underline"
                            >
                                {ticket.association}
                            </a>
                        </CardTitle>
                        <CardDescription className="text-base font-medium">
                            {ticket.eventName}
                        </CardDescription>
                    </div>

                    <div className="flex shrink-0 gap-2">
                        {!isArchived && (
                            <AlertDialog>
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <AlertDialogTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className={
                                                    isValidated
                                                        ? "text-muted-foreground hover:text-foreground shrink-0"
                                                        : "shrink-0 text-green-600 hover:bg-green-50 hover:text-green-700"
                                                }
                                                disabled={isValidateLoading}
                                            >
                                                {isValidateLoading ? (
                                                    <LoadingRing className="m-0!" />
                                                ) : isValidated ? (
                                                    <Undo2Icon className="h-4 w-4" />
                                                ) : (
                                                    <CheckIcon className="h-4 w-4" />
                                                )}
                                                <span className="sr-only">
                                                    {isValidated
                                                        ? "Invalider"
                                                        : "Valider"}
                                                </span>
                                            </Button>
                                        </AlertDialogTrigger>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        {isValidated
                                            ? "Marquer à traiter"
                                            : "Valider"}
                                    </TooltipContent>
                                </Tooltip>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            {isValidated
                                                ? "Invalider le ticket ?"
                                                : "Valider le ticket ?"}
                                        </AlertDialogTitle>
                                        <AlertDialogDescription>
                                            {isValidated
                                                ? `Le ticket #${ticket.id} pour "${ticket.association}" redeviendra à traiter.`
                                                : `Le ticket #${ticket.id} pour "${ticket.association}" sera marqué comme traité et déplacé dans l'onglet Validés.`}
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={onToggleValidated}
                                        >
                                            {isValidated
                                                ? "Invalider"
                                                : "Valider"}
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
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
                                            ? "Désarchiver le ticket ?"
                                            : "Archiver le ticket ?"}
                                    </AlertDialogTitle>
                                    <AlertDialogDescription asChild>
                                        <div>
                                            {isArchived ? (
                                                <p>
                                                    Le ticket #{ticket.id} pour
                                                    "{ticket.association}" sera
                                                    restauré et réapparaîtra
                                                    dans la liste des tickets
                                                    actifs.
                                                </p>
                                            ) : (
                                                <>
                                                    <p>
                                                        Le ticket #{ticket.id}{" "}
                                                        pour "
                                                        {ticket.association}"
                                                        sera marqué comme traité
                                                        et masqué de la liste.
                                                    </p>
                                                    <p className="mt-1">
                                                        Il pourra être restauré
                                                        si besoin.
                                                    </p>
                                                </>
                                            )}
                                        </div>
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>
                                        Annuler
                                    </AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={
                                            isArchived ? onUnarchive : onArchive
                                        }
                                    >
                                        {isArchived
                                            ? "Désarchiver"
                                            : "Archiver"}
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="grid gap-3 text-sm sm:grid-cols-2">
                    <div className="text-muted-foreground flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 shrink-0" />
                        <span>
                            {formatEventDateRangeCompact(
                                ticket.eventDate,
                                ticket.eventEndDate
                            )}
                        </span>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-2">
                        <MapPinIcon className="h-4 w-4 shrink-0" />
                        <span className="truncate">
                            {locationDisplayName(ticket.eventAddr)}
                        </span>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-2">
                        <UserIcon className="h-4 w-4 shrink-0" />
                        <span>
                            {ticket.firstName} {ticket.lastName}
                        </span>
                    </div>

                    <div className="text-muted-foreground flex items-center gap-2">
                        <UsersIcon className="h-4 w-4 shrink-0" />
                        <span>
                            {ticket.estimatedParticipants} participant
                            {ticket.estimatedParticipants > 1 ? "s" : ""} estimé
                            {ticket.estimatedParticipants > 1 ? "s" : ""}
                        </span>
                    </div>
                </div>

                <div className="text-muted-foreground mt-4 flex items-center justify-between border-t pt-3 text-xs">
                    <span>
                        Type :{" "}
                        <span className="font-medium">
                            {ticket.eventType === "other"
                                ? "Autre"
                                : ticket.eventType}
                        </span>
                    </span>
                    <span>
                        Créé le{" "}
                        {format(ticket.creationDate, "d MMM yyyy", {
                            locale: fr
                        })}
                    </span>
                </div>
            </CardContent>
        </Card>
    )
}
