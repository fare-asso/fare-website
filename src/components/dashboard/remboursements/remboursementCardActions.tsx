import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { ArchiveIcon, ArchiveRestoreIcon, DownloadIcon } from "lucide-react"
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
import { Button } from "@/components/ui/button"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger
} from "@/components/ui/tooltip"
import type { Remboursement } from "@/generated/prisma/client"
import { downloadBase64 } from "@/lib/download"

import LoadingRing from "../loadingRing"

interface RemboursementCardActionsProps {
    remboursement: Remboursement
    canEdit: boolean
    canDownload: boolean
}

export default function RemboursementCardActions({
    remboursement,
    canEdit,
    canDownload
}: RemboursementCardActionsProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isArchiving, setIsArchiving] = useState(false)
    const queryClient = useQueryClient()

    const isArchived = remboursement.archived !== null
    const displayName = `${remboursement.prenom} ${remboursement.nom}`

    const handleDownload = async () => {
        setIsDownloading(true)
        const { data, error } =
            await actions.remboursement.downloadRemboursementFolderAction(
                remboursement.id
            )
        if (error) {
            toast.error("Erreur lors du téléchargement du dossier.")
        } else if (!data.success) {
            toast.error(data.error)
        } else if (data.zipData) {
            downloadBase64(
                data.zipData,
                data.filename || "remboursement.zip",
                "application/zip"
            )
            toast.success(`Le dossier de ${displayName} a été téléchargé.`)
        }
        setIsDownloading(false)
    }

    const handleArchiveToggle = async () => {
        setIsArchiving(true)
        const action = isArchived
            ? actions.remboursement.unarchiveRemboursementAction
            : actions.remboursement.archiveRemboursementAction
        const { data, error } = await action(remboursement.id)
        if (error) {
            toast.error("Une erreur est survenue. Veuillez réessayer.")
        } else if (data.success) {
            toast.success(
                isArchived
                    ? "La demande de remboursement a été désarchivée."
                    : "La demande de remboursement a été archivée."
            )
            await queryClient.invalidateQueries({
                queryKey: ["remboursements"]
            })
        } else {
            toast.error(data.error)
        }
        setIsArchiving(false)
    }

    return (
        <div className="flex shrink-0 gap-1">
            {canDownload ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            disabled={isDownloading}
                            onClick={handleDownload}
                        >
                            {isDownloading ? (
                                <LoadingRing className="m-0!" />
                            ) : (
                                <DownloadIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                Télécharger le dossier
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Télécharger le dossier (.zip)
                    </TooltipContent>
                </Tooltip>
            ) : null}

            {canEdit ? (
                <AlertDialog>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className={
                                        isArchived
                                            ? "text-primary hover:bg-primary/10 hover:text-primary"
                                            : "text-muted-foreground hover:text-foreground"
                                    }
                                    disabled={isArchiving}
                                >
                                    {isArchiving ? (
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
                                    ? "Désarchiver la demande ?"
                                    : "Archiver la demande ?"}
                            </AlertDialogTitle>
                            <AlertDialogDescription asChild>
                                <div>
                                    {isArchived ? (
                                        <p>
                                            La demande de remboursement de "
                                            {displayName}" sera restaurée et
                                            réapparaîtra dans la liste des
                                            demandes actives.
                                        </p>
                                    ) : (
                                        <>
                                            <p>
                                                La demande de remboursement de "
                                                {displayName}" sera marquée
                                                comme traitée et masquée de la
                                                liste.
                                            </p>
                                            <p className="mt-1">
                                                Elle pourra être restaurée si
                                                besoin.
                                            </p>
                                        </>
                                    )}
                                </div>
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Annuler</AlertDialogCancel>
                            <AlertDialogAction onClick={handleArchiveToggle}>
                                {isArchived ? "Désarchiver" : "Archiver"}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            ) : null}
        </div>
    )
}
