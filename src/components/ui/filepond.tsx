"use client"

import "filepond/dist/filepond.min.css"
import "filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css"

import type { FilePondFile } from "filepond"
import FilePondPluginFileValidateSize from "filepond-plugin-file-validate-size"
import FilePondPluginFileValidateType from "filepond-plugin-file-validate-type"
import FilePondPluginImagePreview from "filepond-plugin-image-preview"
import { useCallback, useState } from "react"
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

interface FilePondInputProps
    extends Omit<ReactFilePondProps, "onupdatefiles" | "files"> {
    /** Called with the first File when files change (single mode), or undefined if cleared. */
    onChange?: (file: File | undefined) => void
}

/**
 * Thin wrapper around react-filepond pre-configured with
 * image preview, file-type validation, and file-size validation plugins.
 *
 * Designed for single-file use (e.g. logo upload).
 * Pass FilePond props directly — they're forwarded to the underlying component.
 */
export function FilePondInput({
    onChange,
    labelIdle = 'Glissez-déposez un fichier ou <span class="filepond--label-action">parcourir</span>',
    ...props
}: FilePondInputProps): React.ReactNode {
    const [files, setFiles] = useState<FilePondFile[]>([])

    const handleUpdateFiles = useCallback(
        (fileItems: FilePondFile[]) => {
            setFiles(fileItems)
            const file = fileItems[0]?.file as File | undefined
            onChange?.(file)
        },
        [onChange]
    )

    return (
        <ReactFilePond
            files={files.map((f) => f.file)}
            onupdatefiles={handleUpdateFiles}
            labelIdle={labelIdle}
            credits={false}
            {...props}
        />
    )
}
