import { useQueryClient } from "@tanstack/react-query"
import { actions } from "astro:actions"
import { ArchiveIcon, ArchiveRestoreIcon, DownloadIcon, X } from "lucide-react"
import { useState } from "react"
import { createPortal } from "react-dom"
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
import { downloadBase64 } from "@/lib/download"
import { MAX_TUTOR_APPLICATIONS_DOWNLOAD } from "@/schemas/bougeTaPrison"

export default function BulkActionsBar({
    selectedIds,
    onClear,
    archived = false
}: {
    selectedIds: number[]
    onClear: () => void
    archived?: boolean
}) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isArchiving, setIsArchiving] = useState(false)
    const queryClient = useQueryClient()
    const count = selectedIds.length

    if (count === 0 || typeof document === "undefined") return null

    const overCap = count > MAX_TUTOR_APPLICATIONS_DOWNLOAD
    const busy = isDownloading || isArchiving
    const plural = count > 1 ? "s" : ""
    const archiveLabel = archived ? "Désarchiver" : "Archiver"

    const handleDownload = async () => {
        setIsDownloading(true)
        const { data, error } =
            await actions.bougeTaPrison.downloadTutorApplicationsZipAction(
                selectedIds
            )
        if (error) {
            toast.error("Erreur lors du téléchargement des candidatures.")
        } else if (data.success) {
            downloadBase64(data.zipData, data.filename, "application/zip")
            if (data.missing > 0) {
                toast.warning(
                    `Téléchargement partiel : ${data.missing} fichier${
                        data.missing > 1 ? "s" : ""
                    } manquant${data.missing > 1 ? "s" : ""}.`
                )
            } else {
                toast.success("Les candidatures ont été téléchargées.")
            }
            onClear()
        } else {
            toast.error(data.error)
        }
        setIsDownloading(false)
    }

    const handleArchive = async () => {
        setIsArchiving(true)
        const { data, error } =
            await actions.bougeTaPrison.bulkArchiveTutorApplicationsAction({
                ids: selectedIds,
                archive: !archived
            })
        if (error) {
            toast.error(`Erreur lors de l'opération « ${archiveLabel} ».`)
        } else if (data.success) {
            toast.success(
                archived
                    ? `${data.value.count} candidature${plural} désarchivée${plural}.`
                    : `${data.value.count} candidature${plural} archivée${plural}.`
            )
            onClear()
            await queryClient.invalidateQueries({
                queryKey: ["tutorApplications"]
            })
        } else {
            toast.error(data.error)
        }
        setIsArchiving(false)
    }

    return createPortal(
        <div className="bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-3 bottom-4 z-50 mx-auto w-fit rounded-xl border p-3 shadow-xl backdrop-blur sm:bottom-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center justify-between gap-1 sm:justify-start sm:gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">
                        {count} candidature{plural} sélectionnée{plural}
                    </span>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onClear}
                        className="text-muted-foreground hover:text-foreground h-7 gap-1 px-2"
                    >
                        <X className="size-4" />
                        <span className="hidden sm:inline">
                            Tout désélectionner
                        </span>
                    </Button>
                </div>

                <div className="flex items-center gap-2">
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                variant="outline"
                                disabled={busy}
                                aria-label={`${archiveLabel} la sélection`}
                                className="flex-1 gap-2 sm:flex-none"
                            >
                                {isArchiving ? (
                                    <LoadingRing className="m-0!" />
                                ) : archived ? (
                                    <ArchiveRestoreIcon className="size-4" />
                                ) : (
                                    <ArchiveIcon className="size-4" />
                                )}
                                {archiveLabel}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>
                                    {archiveLabel} {count} candidature{plural} ?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                    {archived
                                        ? "Les candidatures sélectionnées réapparaîtront dans la liste des candidatures actives."
                                        : "Les candidatures sélectionnées seront masquées de la liste. Elles pourront être restaurées si besoin."}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction onClick={handleArchive}>
                                    {archiveLabel}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>

                    <Button
                        onClick={handleDownload}
                        disabled={busy || overCap}
                        className="flex-1 gap-2 sm:flex-none"
                    >
                        {isDownloading ? (
                            <LoadingRing className="m-0!" />
                        ) : (
                            <DownloadIcon className="size-4" />
                        )}
                        Télécharger
                    </Button>
                </div>
            </div>

            {overCap ? (
                <p className="text-destructive mt-2 text-center text-xs sm:text-right">
                    Téléchargement limité à {MAX_TUTOR_APPLICATIONS_DOWNLOAD}{" "}
                    candidatures à la fois
                </p>
            ) : null}
        </div>,
        document.body
    )
}
