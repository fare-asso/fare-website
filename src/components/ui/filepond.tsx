"use client"

import "filepond/dist/filepond.min.css"
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css"
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
    // The existing image, fetched into a File so it lives entirely client-side.
    // Compared by reference to tell "untouched" from a user replacement.
    const originalFile = useRef<File | null>(null)

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
        <>
            <style>
                {`
                    .filepond--root {
                        font-size: 1rem;
                    }

                    /* Idle state - dashed border with light background */
                    .filepond--panel-root {
                        background-color: #f9fafb;
                        border: 2px dashed #d1d5db;
                        border-radius: 0.5rem;
                        transition: all 0.2s ease;
                    }

                    /* Hover state - highlight on hover */
                    .filepond--drop-label {
                        cursor: pointer;
                    }

                    .filepond--root:hover .filepond--panel-root {
                        background-color: #f3f4f6;
                        border-color: #9ca3af;
                    }

                    /* Focus/drag state */
                    .filepond--root.filepond--drag-over .filepond--panel-root {
                        background-color: #eff6ff;
                        border-color: #3b82f6;
                        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                    }

                    /* Drop label styling */
                    .filepond--drop-label {
                        color: #6b7280;
                        font-weight: 500;
                        padding: 2rem 1rem;
                    }

                    /* Label action (Browse button) styling */
                    .filepond--label-action {
                        color: #3b82f6;
                        text-decoration: underline;
                        text-decoration-color: #93c5fd;
                        cursor: pointer;
                        font-weight: 600;
                        transition: all 0.2s ease;
                    }

                    .filepond--root:hover .filepond--label-action {
                        text-decoration-color: #3b82f6;
                        color: #1d4ed8;
                    }

                    /* File item styling */
                    .filepond--item-panel {
                        background-color: #fff;
                        border-radius: 0.375rem;
                        border: 1px solid #e5e7eb;
                        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
                    }

                    /* File text color - dark text on light background */
                    .filepond--file {
                        color: #1f2937;
                    }

                    /* Action buttons */
                    .filepond--file-action-button {
                        background-color: rgba(59, 130, 246, 0.1);
                        color: #3b82f6;
                        border-radius: 0.375rem;
                        transition: all 0.2s ease;
                    }

                    .filepond--file-action-button:hover,
                    .filepond--file-action-button:focus {
                        background-color: #3b82f6;
                        color: #fff;
                    }

                    /* Processing state */
                    [data-filepond-item-state='processing'] .filepond--item-panel {
                        background-color: #f0fdf4;
                        border-color: #86efac;
                    }

                    /* Complete state */
                    [data-filepond-item-state='processing-complete'] .filepond--item-panel {
                        background-color: #f0fdf4;
                        border-color: #22c55e;
                    }

                    /* Error state */
                    [data-filepond-item-state*='error'] .filepond--item-panel,
                    [data-filepond-item-state*='invalid'] .filepond--item-panel {
                        background-color: #fef2f2;
                        border-color: #ef4444;
                    }
                `}
            </style>
            <ReactFilePond
                files={files}
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
        </>
    )
}
