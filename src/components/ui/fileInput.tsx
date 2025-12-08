"use client"
import { File, Upload } from "lucide-react"
import type React from "react"
import { ChangeEventHandler, forwardRef, useState } from "react"

interface FileInputProps
    extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
    maxSize?: number
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
    ({ id, maxSize, onChange, ...props }, ref) => {
        const [filename, setFilename] = useState<string | undefined>(undefined)

        const handleChangeFile = (
            event: React.ChangeEvent<HTMLInputElement>
        ) => {
            // Mettre à jour le nom du fichier
            if (event.target.files && event.target.files.length > 0) {
                setFilename(event.target.files[0].name)
            } else {
                setFilename(undefined)
            }

            // Appeler le onChange fourni par register
            if (onChange) {
                onChange(event)
            }
        }

        return (
            <div className="w-full max-w-md">
                <div className="flex w-full items-center justify-center">
                    <label
                        htmlFor={id}
                        className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed bg-gray-50 hover:bg-gray-100"
                    >
                        {filename ? (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <File className="mb-4 h-8 w-8 text-gray-500" />
                                <p className="text-gray-500 text-sm">
                                    {filename}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="mb-4 h-8 w-8 text-gray-500" />
                                <p className="text-gray-500 text-sm">
                                    Cliquez ou glissez un fichier ici
                                </p>
                                {maxSize && (
                                    <p className="text-gray-500 text-xs">
                                        (Taille maximale {maxSize}mo)
                                    </p>
                                )}
                            </div>
                        )}
                        <input
                            id={id}
                            type="file"
                            className="hidden"
                            onChange={handleChangeFile}
                            ref={ref}
                            {...props}
                        />
                    </label>
                </div>
            </div>
        )
    }
)

FileInput.displayName = "FileInput"

export default FileInput
