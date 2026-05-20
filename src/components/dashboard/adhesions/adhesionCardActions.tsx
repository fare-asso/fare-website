"use client"

import {
    ArchiveIcon,
    ArchiveRestoreIcon,
    DownloadIcon,
    FileTextIcon
} from "lucide-react"
import { useState } from "react"

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
import { useToast } from "@/components/ui/use-toast"
import type { Adhesion } from "@/generated/prisma/client"
import { tryCatch } from "@/lib/utils"

import LoadingRing from "../loadingRing"

function downloadBase64Zip(zipData: string, filename: string) {
    const byteCharacters = atob(zipData)
    const byteNumbers = Array.from<number>({ length: byteCharacters.length })
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "application/zip" })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

function downloadBase64Pdf(pdfData: string, filename: string) {
    const byteCharacters = atob(pdfData)
    const byteNumbers = Array.from<number>({ length: byteCharacters.length })
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
    }
    const byteArray = new Uint8Array(byteNumbers)
    const blob = new Blob([byteArray], { type: "application/pdf" })

    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.style.display = "none"
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
}

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
    const { toast } = useToast()

    const isArchived = adhesion.archived !== null
    const displayName = adhesion.nomComplet || adhesion.association

    const handleDownload = async () => {
        setIsDownloading(true)
        const call = await tryCatch(
            downloadFolderAction(undefined, adhesion.folderPath)
        )
        if (!call.success) {
            console.error("Erreur lors du téléchargement:", call.error)
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Erreur lors du téléchargement du dossier."
            })
            setIsDownloading(false)
            return
        }
        const result = call.value
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: result.error
            })
        } else if (result.success && result.zipData) {
            downloadBase64Zip(result.zipData, result.filename || "download.zip")
            toast({
                title: "Téléchargement",
                description: `Le dossier de ${displayName} a été téléchargé.`
            })
        }
        setIsDownloading(false)
    }

    const handleGeneratePdf = async () => {
        setIsGeneratingPdf(true)
        const call = await tryCatch(downloadAdhesionPdfAction(adhesion.id))
        if (!call.success) {
            console.error("Erreur lors de la génération du PDF:", call.error)
            toast({
                variant: "destructive",
                title: "Erreur",
                description: "Erreur lors de la génération du formulaire PDF."
            })
            setIsGeneratingPdf(false)
            return
        }
        const result = call.value
        if (result.error) {
            toast({
                variant: "destructive",
                title: "Erreur",
                description: result.error
            })
        } else if (result.success && result.pdfData) {
            downloadBase64Pdf(
                result.pdfData,
                result.filename || "formulaire-adhesion.pdf"
            )
            toast({
                title: "Téléchargement",
                description: `Le formulaire de ${displayName} a été généré.`
            })
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
            toast({
                variant: "destructive",
                title: "Erreur",
                description: response.error
            })
        } else {
            toast({
                title: "Succès",
                description: isArchived
                    ? "La demande d'adhésion a été désarchivée."
                    : "La demande d'adhésion a été archivée."
            })
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
