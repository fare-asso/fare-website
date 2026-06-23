"use client"

import { DownloadIcon, X } from "lucide-react"
import { useState } from "react"
import { createPortal } from "react-dom"
import { toast } from "sonner"

import downloadTutorApplicationsZipAction from "@/actions/bouge-ta-prison/downloadTutorApplicationsZipAction"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Button } from "@/components/ui/button"
import { downloadBase64 } from "@/lib/download"
import { tryCatch } from "@/lib/utils"
import { MAX_TUTOR_APPLICATIONS_DOWNLOAD } from "@/schemas/bougeTaPrison"

export default function BulkDownloadBar({
    selectedIds,
    onClear
}: {
    selectedIds: number[]
    onClear: () => void
}) {
    const [isDownloading, setIsDownloading] = useState(false)
    const count = selectedIds.length

    if (count === 0 || typeof document === "undefined") return null

    const overCap = count > MAX_TUTOR_APPLICATIONS_DOWNLOAD

    const handleDownload = async () => {
        setIsDownloading(true)
        const call = await tryCatch(
            downloadTutorApplicationsZipAction(selectedIds)
        )
        if (!call.success) {
            toast.error("Erreur lors du téléchargement des candidatures.")
            setIsDownloading(false)
            return
        }
        const result = call.value
        if (result.success) {
            downloadBase64(result.zipData, result.filename, "application/zip")
            if (result.missing > 0) {
                toast.warning(
                    `Téléchargement partiel : ${result.missing} fichier${
                        result.missing > 1 ? "s" : ""
                    } manquant${result.missing > 1 ? "s" : ""}.`
                )
            } else {
                toast.success("Les candidatures ont été téléchargées.")
            }
            onClear()
        } else {
            toast.error(result.error)
        }
        setIsDownloading(false)
    }

    return createPortal(
        <div className="bg-background/95 supports-backdrop-filter:bg-background/80 fixed inset-x-3 bottom-4 z-50 mx-auto w-fit rounded-xl border p-3 shadow-xl backdrop-blur sm:bottom-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                <div className="flex items-center justify-between gap-1 sm:justify-start sm:gap-2">
                    <span className="text-sm font-medium whitespace-nowrap">
                        {count} candidature{count > 1 ? "s" : ""} sélectionnée
                        {count > 1 ? "s" : ""}
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

                <Button
                    onClick={handleDownload}
                    disabled={isDownloading || overCap}
                    className="w-full gap-2 sm:w-auto"
                >
                    {isDownloading ? (
                        <LoadingRing className="m-0!" />
                    ) : (
                        <DownloadIcon className="size-4" />
                    )}
                    Télécharger
                </Button>
            </div>

            {overCap ? (
                <p className="text-destructive mt-2 text-center text-xs sm:text-right">
                    Maximum {MAX_TUTOR_APPLICATIONS_DOWNLOAD} candidatures à la
                    fois
                </p>
            ) : null}
        </div>,
        document.body
    )
}
