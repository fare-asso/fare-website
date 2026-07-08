import { actions } from "astro:actions"
import { ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react"
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

interface TicketActionsProps {
    ticketId: number
    ticketName: string
    isArchived: boolean
    canEdit: boolean
    canDelete: boolean
}

export default function TicketActions({
    ticketId,
    ticketName,
    isArchived,
    canEdit,
    canDelete
}: TicketActionsProps) {
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)

    const onArchive = async () => {
        setIsArchiveLoading(true)

        const { data, error } =
            await actions.bagadAsso.deleteBagadAssoTicketAction(ticketId)

        if (error || !data.success) {
            toast.error(
                data?.error ?? "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le ticket a été archivé.")
            window.location.reload()
        }
        setIsArchiveLoading(false)
    }

    const onUnarchive = async () => {
        setIsArchiveLoading(true)

        const { data, error } =
            await actions.bagadAsso.unarchiveBagadAssoTicketAction(ticketId)

        if (error || !data.success) {
            toast.error(
                data?.error ?? "Une erreur est survenue. Veuillez réessayer."
            )
        } else {
            toast.success("Le ticket a été désarchivé.")
            window.location.reload()
        }
        setIsArchiveLoading(false)
    }

    const onHardDelete = async () => {
        setIsDeleteLoading(true)

        const { data, error } =
            await actions.bagadAsso.hardDeleteBagadAssoTicketAction(ticketId)

        if (error || !data.success) {
            toast.error(
                data?.error ?? "Une erreur est survenue. Veuillez réessayer."
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
            <div className="flex flex-wrap gap-2">
                {/* Archive / Unarchive Button */}
                {canEdit ? (
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
                                                Le ticket #{ticketId} pour "
                                                {ticketName}" sera restauré et
                                                réapparaîtra dans la liste des
                                                tickets actifs.
                                            </p>
                                        ) : (
                                            <>
                                                <p>
                                                    Le ticket #{ticketId} pour "
                                                    {ticketName}" sera marqué
                                                    comme traité et masqué de la
                                                    liste.
                                                </p>
                                                <p className="mt-1">
                                                    Il pourra être restauré si
                                                    besoin.
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
                ) : null}

                {/* Hard Delete Button */}
                {canDelete ? (
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
                                            Le ticket #{ticketId} pour "
                                            {ticketName}" sera{" "}
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
