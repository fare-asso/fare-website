"use client"

import "filepond/dist/filepond.min.css"
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css"
import "./filepond.css"
import type { FilePondFile } from "filepond"
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import FilePondPluginImagePreview from "filepond-plugin-image-preview"
import { useCallback, useEffect, useRef, useState } from "react"
import {
    FilePond as ReactFilePond,
    type FilePondProps as ReactFilePondProps,
    registerPlugin
} from "react-filepond"

registerPlugin(
    FilePondPluginFileValidateSize,
    FilePondPluginFileValidateType,
    FilePondPluginImagePreview
)

interface FilePondInputProps extends Omit<
    ReactFilePondProps,
    "onupdatefiles" | "files"
> {
    /** Called with the first File when files change (single mode), or undefined if cleared. */
    onChange?: (file: File) => void
    /** Called with every selected File (multi mode). */
    onChangeMultiple?: (files: File[]) => void
    /**
     * Existing remote image to preview as an already-uploaded item (edit forms).
     * Switches the component to edit mode and reports changes via `onEditChange`.
     */
    initialImageUrl?: string
    /**
     * Edit-mode reporter: `file` is a newly picked replacement (if any), and
     * `cleared` is true when the existing image was removed without replacement.
     */
    onEditChange?: (state: { file?: File; cleared: boolean }) => void
}

/**
 * Thin wrapper around react-filepond pre-configured with
 * image preview, file-type validation, and file-size validation plugins.
 *
 * Designed for single-file use (e.g. logo upload).
 * Pass FilePond props directly — they're forwarded to the underlying component.
 */
export function FilePondInput({
    onChange = () => undefined,
    onChangeMultiple,
    onEditChange,
    initialImageUrl,
    labelIdle = 'Glissez-déposez un fichier ou <span class="filepond--label-action">parcourir</span>',
    ...props
}: FilePondInputProps): React.ReactNode {
    const editMode = initialImageUrl !== undefined
    const [files, setFiles] = useState<File[]>([])
    const wrapperRef = useRef<HTMLDivElement>(null)
    // The existing image, fetched into a File so it lives entirely client-side.
    // Compared by reference to tell "untouched" from a user replacement.
    const originalFile = useRef<File | null>(null)

    // FilePond builds its input outside React with a generated id the
    // FieldLabel can't know; repoint the label once the widget is ready.
    const repairLabel = useCallback(() => {
        const root = wrapperRef.current
        const input = root?.querySelector<HTMLInputElement>("input[type=file]")
        const label = root
            ?.closest("fieldset")
            ?.querySelector<HTMLLabelElement>("label[for]")
        if (input && label && !document.getElementById(label.htmlFor)) {
            label.htmlFor = input.id
        }
    }, [])

    useEffect(() => {
        if (initialImageUrl === undefined) return
        const controller = new AbortController()
        void fetch(initialImageUrl, { signal: controller.signal })
            .then((res) =>
                res.ok ? res.blob() : Promise.reject(new Error("load failed"))
            )
            .then((blob) => {
                const name = initialImageUrl.split("/").pop() || "image"
                const file = new File([blob], name, { type: blob.type })
                originalFile.current = file
                setFiles([file])
            })
            .catch(() => undefined)
        return () => controller.abort()
    }, [initialImageUrl])

    const handleUpdateFiles = useCallback(
        (fileItems: FilePondFile[]) => {
            const nextFiles = fileItems.map((item) => item.file as File)
            setFiles(nextFiles)

            if (editMode) {
                const current = nextFiles[0]
                const original = originalFile.current
                // Treat the seeded image as unchanged even if FilePond hands
                // back a cloned File (reference match OR same name/size/type).
                const isUnchanged =
                    !!current &&
                    !!original &&
                    (current === original ||
                        (current.name === original.name &&
                            current.size === original.size &&
                            current.type === original.type))
                onEditChange?.({
                    file: current && !isUnchanged ? current : undefined,
                    cleared: nextFiles.length === 0
                })
                return
            }
            if (onChangeMultiple) {
                onChangeMultiple(nextFiles)
                return
            }
            onChange(nextFiles[0] as File)
        },
        [onChange, onChangeMultiple, onEditChange, editMode]
    )

    return (
        <div ref={wrapperRef}>
            <ReactFilePond
                files={files}
                oninit={repairLabel}
                onupdatefiles={handleUpdateFiles}
                labelIdle={labelIdle}
                labelInvalidField="Le champ contient des fichiers invalides"
                labelFileWaitingForSize="En attente de la taille"
                labelFileSizeNotAvailable="Taille non disponible"
                labelFileLoading="Chargement"
                labelFileLoadError="Erreur lors du chargement"
                labelFileProcessing="Envoi en cours"
                labelFileProcessingComplete="Envoi terminé"
                labelFileProcessingAborted="Envoi annulé"
                labelFileProcessingError="Erreur lors de l'envoi"
                labelFileProcessingRevertError="Erreur lors de l'annulation"
                labelFileRemoveError="Erreur lors de la suppression"
                labelTapToCancel="appuyez pour annuler"
                labelTapToRetry="appuyez pour réessayer"
                labelTapToUndo="appuyez pour annuler"
                labelButtonRemoveItem="Supprimer"
                labelButtonAbortItemLoad="Abandonner"
                labelButtonRetryItemLoad="Réessayer"
                labelButtonAbortItemProcessing="Annuler"
                labelButtonUndoItemProcessing="Annuler"
                labelButtonRetryItemProcessing="Réessayer"
                labelButtonProcessItem="Envoyer"
                labelMaxFileSizeExceeded="Le fichier est trop volumineux"
                labelMaxFileSize="La taille maximale du fichier est {filesize}"
                labelMaxTotalFileSizeExceeded="La taille totale maximale est dépassée"
                labelMaxTotalFileSize="La taille totale maximale est {filesize}"
                credits={false}
                {...props}
            />
        </div>
    )
}
