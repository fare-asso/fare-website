import { actions } from "astro:actions"
import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    CheckCircle2Icon,
    MailIcon,
    Trash2Icon
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
import { Button } from "@/components/ui/button"

import { useTicketContext } from "./ticketContext"

export default function TicketActions() {
    const { ticket, allEquipments, canDeleteTicket, canEditTicket, dispatch } =
        useTicketContext()
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const isArchived = ticket.deleted !== null

    const onSendContract = async () => {
        console.log(ticket)
    }

    const onArchive = async () => {
        setIsArchiveLoading(true)

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
            dispatch({ type: "setArchived", deleted: new Date() })
        }
        setIsArchiveLoading(false)
    }

    const onUnarchive = async () => {
        setIsArchiveLoading(true)

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
            dispatch({ type: "setArchived", deleted: null })
        }
        setIsArchiveLoading(false)
    }

    const onHardDelete = async () => {
        setIsDeleteLoading(true)

        const { data, error } =
            await actions.bagadAsso.hardDeleteBagadAssoTicketAction(ticket.id)

        if (error || !data.success) {
            toast.error(
                data && !data.success
                    ? data.error
                    : "Une erreur est survenue. Veuillez réessayer."
            )
            setIsDeleteLoading(false)
        } else {
            toast.success("Le ticket a été supprimé définitivement.")
            window.location.href = "/dashboard/bagadAsso"
        }
    }

    return (
        <div className="border-muted-foreground/30 flex flex-col gap-3 rounded-lg border border-dashed p-4">
            <p className="text-muted-foreground text-xs tracking-wide uppercase">
                Actions sur le ticket
            </p>
            <div className="flex flex-col flex-wrap gap-2">
                {/* Archive / Unarchive Button */}
                {canEditTicket ? (
                    <>
                        {ticket.validated ? (
                            <div className="mx-auto my-2 flex items-center gap-2 text-sm font-medium">
                                <CheckCircle2Icon className="h-4 w-4" />
                                Contrat envoyé
                            </div>
                        ) : (
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={isArchiveLoading}
                                        className="gap-2"
                                    >
                                        {isArchiveLoading ? (
                                            <LoadingRing className="m-0!" />
                                        ) : (
                                            <MailIcon className="h-4 w-4" />
                                        )}
                                        Envoyer le contrat
                                    </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>
                                            Envoyer le contrat ?
                                        </AlertDialogTitle>
                                        <AlertDialogDescription asChild>
                                            <div>
                                                Le contrat pour le ticket{" "}
                                                <b className="text-accent-foreground">
                                                    #{ticket.id}
                                                </b>{" "}
                                                sera envoyé à{" "}
                                                <b className="text-accent-foreground">
                                                    {ticket.representativeEmail}
                                                </b>{" "}
                                                avec les équipements suivants :
                                                <ul className="my-2">
                                                    {allEquipments.filter(
                                                        (eq) => eq.checked
                                                    ).length === 0 && (
                                                        <div className="text-muted-foreground p-3 text-sm">
                                                            Aucun matériel
                                                            demandé
                                                        </div>
                                                    )}
                                                    {allEquipments
                                                        .filter(
                                                            (eq) => eq.checked
                                                        )
                                                        .map((equipment) => (
                                                            <li
                                                                key={
                                                                    equipment.id
                                                                }
                                                                className="ml-8 list-disc"
                                                            >
                                                                <b className="text-accent-foreground font-medium">
                                                                    {
                                                                        equipment.quantity
                                                                    }
                                                                    x
                                                                </b>{" "}
                                                                {equipment.name}
                                                            </li>
                                                        ))}
                                                </ul>
                                            </div>
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>
                                            Annuler
                                        </AlertDialogCancel>
                                        <AlertDialogAction
                                            onClick={onSendContract}
                                        >
                                            Envoyer
                                        </AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        )}
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    disabled={isArchiveLoading}
                                    className="gap-2"
                                >
                                    {isArchiveLoading ? (
                                        <LoadingRing className="m-0!" />
                                    ) : isArchived ? (
                                        <ArchiveRestoreIcon className="h-4 w-4" />
                                    ) : (
                                        <ArchiveIcon className="h-4 w-4" />
                                    )}
                                    {isArchived ? "Désarchiver" : "Archiver"}
                                </Button>
                            </AlertDialogTrigger>
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
                    </>
                ) : null}

                {/* Hard Delete Button */}
                {canDeleteTicket ? (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={isDeleteLoading}
                                className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2"
                            >
                                {isDeleteLoading ? (
                                    <LoadingRing className="m-0!" />
                                ) : (
                                    <Trash2Icon className="h-4 w-4" />
                                )}
                                Supprimer définitivement
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    Supprimer définitivement le ticket ?
                                </AlertDialogTitle>
                                <AlertDialogDescription asChild>
                                    <div className="space-y-2">
                                        <p>
                                            Le ticket #{ticket.id} pour "
                                            {ticket.association}" sera{" "}
                                            <span className="text-destructive font-semibold">
                                                supprimé de manière permanente
                                            </span>
                                            .
                                        </p>
                                        <p>
                                            Cette action est irréversible et
                                            toutes les données associées seront
                                            perdues.
                                        </p>
                                        <p className="text-muted-foreground text-sm">
                                            Utilisez cette option uniquement
                                            pour les doublons ou les tickets
                                            créés par erreur.
                                        </p>
                                    </div>
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={onHardDelete}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                    Supprimer définitivement
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                ) : null}
            </div>
        </div>
    )
}
