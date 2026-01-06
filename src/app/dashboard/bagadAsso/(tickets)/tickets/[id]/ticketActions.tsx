"use client"

import { ArchiveIcon, ArchiveRestoreIcon, Trash2Icon } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import deleteBagadAssoTicketAction from "@/actions/bagadAsso/deleteTicketAction"
import hardDeleteBagadAssoTicketAction from "@/actions/bagadAsso/hardDeleteTicketAction"
import unarchiveBagadAssoTicketAction from "@/actions/bagadAsso/unarchiveTicketAction"
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
import { useToast } from "@/components/ui/use-toast"

export default function TicketActions({
    ticketId,
    ticketName,
    isArchived
}: {
    ticketId: number
    ticketName: string
    isArchived: boolean
}) {
    const [isArchiveLoading, setIsArchiveLoading] = useState(false)
    const [isDeleteLoading, setIsDeleteLoading] = useState(false)
    const { toast } = useToast()
    const router = useRouter()

    const onArchive = async () => {
        setIsArchiveLoading(true)

        const response = await deleteBagadAssoTicketAction(ticketId)

        if (response.error) {
            toast({
                variant: "destructive",
                description: response.error,
                title: "Erreur"
            })
        } else {
            toast({
                variant: "default",
                description: "Le ticket a été archivé.",
                title: "Succès"
            })
        }
        setIsArchiveLoading(false)
    }

    const onUnarchive = async () => {
        setIsArchiveLoading(true)

        const response = await unarchiveBagadAssoTicketAction(ticketId)

        if (response.error) {
            toast({
                variant: "destructive",
                description: response.error,
                title: "Erreur"
            })
        } else {
            toast({
                variant: "default",
                description: "Le ticket a été désarchivé.",
                title: "Succès"
            })
        }
        setIsArchiveLoading(false)
    }

    const onHardDelete = async () => {
        setIsDeleteLoading(true)

        const response = await hardDeleteBagadAssoTicketAction(ticketId)

        if (response.error) {
            toast({
                variant: "destructive",
                description: response.error,
                title: "Erreur"
            })
            setIsDeleteLoading(false)
        } else {
            toast({
                variant: "default",
                description: "Le ticket a été supprimé définitivement.",
                title: "Succès"
            })
            router.push("/dashboard/bagadAsso")
        }
    }

    return (
        <div className="flex flex-col gap-3 rounded-lg border border-muted-foreground/30 border-dashed p-4">
            <p className="text-muted-foreground text-xs uppercase tracking-wide">
                Actions sur le ticket
            </p>
            <div className="flex flex-wrap gap-2">
                {/* Archive / Unarchive Button */}
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
                                                {ticketName}" sera marqué comme
                                                traité et masqué de la liste.
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
                                onClick={isArchived ? onUnarchive : onArchive}
                            >
                                {isArchived ? "Désarchiver" : "Archiver"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>

                {/* Hard Delete Button */}
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            disabled={isDeleteLoading}
                            className="gap-2 border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
                                        Le ticket #{ticketId} pour "{ticketName}
                                        " sera{" "}
                                        <span className="font-semibold text-destructive">
                                            supprimé de manière permanente
                                        </span>
                                        .
                                    </p>
                                    <p>
                                        Cette action est irréversible et toutes
                                        les données associées seront perdues.
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Utilisez cette option uniquement pour
                                        les doublons ou les tickets créés par
                                        erreur.
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
            </div>
        </div>
    )
}
