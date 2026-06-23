"use client"

import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    DownloadIcon,
    FileTextIcon
} from "lucide-react"
import { useState } from "react"
import { toast } from "sonner"

import archiveAdhesionAction from "@/actions/adhesion/archiveAdhesionAction"
import downloadAdhesionPdfAction from "@/actions/adhesion/downloadAdhesionPdfAction"
import { downloadFolderAction } from "@/actions/adhesion/downloadFolderAction"
import unarchiveAdhesionAction from "@/actions/adhesion/unarchiveAdhesionAction"
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
import type { Adhesion } from "@/generated/prisma/client"
import { downloadBase64 } from "@/lib/download"
import { tryCatch } from "@/lib/utils"

import LoadingRing from "../loadingRing"

interface AdhesionCardActionsProps {
    adhesion: Adhesion
    canEdit: boolean
    canDownload: boolean
}

export default function AdhesionCardActions({
    adhesion,
    canEdit,
    canDownload
}: AdhesionCardActionsProps) {
    const [isDownloading, setIsDownloading] = useState(false)
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
    const [isArchiving, setIsArchiving] = useState(false)

    const isArchived = adhesion.archived !== null
    const displayName = adhesion.nomComplet || adhesion.association

    const handleDownload = async () => {
        setIsDownloading(true)
        const call = await tryCatch(
            downloadFolderAction(undefined, adhesion.folderPath)
        )
        if (!call.success) {
            console.error("Erreur lors du téléchargement:", call.error)
            toast.error("Erreur lors du téléchargement du dossier.")
            setIsDownloading(false)
            return
        }
        const result = call.value
        if (result.error) {
            toast.error(result.error)
        } else if (result.success && result.zipData) {
            downloadBase64(
                result.zipData,
                result.filename || "download.zip",
                "application/zip"
            )
            toast.success(`Le dossier de ${displayName} a été téléchargé.`)
        }
        setIsDownloading(false)
    }

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true)
        const call = await tryCatch(downloadAdhesionPdfAction(adhesion.id))
        if (!call.success) {
            console.error("Erreur lors de la génération du PDF:", call.error)
            toast.error("Erreur lors de la génération du formulaire PDF.")
            setIsGeneratingPdf(false)
            return
        }
        const result = call.value
        if (result.error) {
            toast.error(result.error)
        } else if (result.success && result.pdfData) {
            downloadBase64(
                result.pdfData,
                result.filename || "formulaire-adhesion.pdf",
                "application/pdf"
            )
            toast.success(`Le formulaire de ${displayName} a été généré.`)
        }
        setIsGeneratingPdf(false)
    }

    const handleArchiveToggle = async () => {
        setIsArchiving(true)
        const action = isArchived
            ? unarchiveAdhesionAction
            : archiveAdhesionAction
        const response = await action(adhesion.id)
        if (response.error) {
            toast.error(response.error)
        } else {
            toast.success(
                isArchived
                    ? "La demande d'adhésion a été désarchivée."
                    : "La demande d'adhésion a été archivée."
            )
        }
        setIsArchiving(false)
    }

    return (
        <div className="flex shrink-0 gap-1">
            {/* Generate PDF button */}
            {canDownload ? (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button
                            variant="outline"
                            size="icon"
                            className="text-muted-foreground hover:text-foreground"
                            disabled={isGeneratingPdf}
                            onClick={handleGeneratePdf}
                        >
                            {isGeneratingPdf ? (
                                <LoadingRing className="m-0!" />
                            ) : (
                                <FileTextIcon className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                Générer le formulaire PDF
                            </span>
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                        Générer le formulaire (.pdf)
                    </TooltipContent>
                </Tooltip>
            ) : null}

            {/* Download button */}
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

            {/* Archive / Unarchive button */}
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
                                            La demande d'adhésion de "
                                            {displayName}" sera restaurée et
                                            réapparaîtra dans la liste des
                                            demandes actives.
                                        </p>
                                    ) : (
                                        <>
                                            <p>
                                                La demande d'adhésion de "
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
