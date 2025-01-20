"use client";
import React, { ChangeEventHandler, useState, forwardRef } from "react";
import { File, Upload } from "lucide-react";

interface FileInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value'> {
    maxSize?: number;
    onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FileInput = forwardRef<HTMLInputElement, FileInputProps>(
    ({ id, maxSize, onChange, ...props }, ref) => {
        const [filename, setFilename] = useState<string | undefined>(undefined);

        const handleChangeFile = (event: React.ChangeEvent<HTMLInputElement>) => {
            // Mettre à jour le nom du fichier
            if (event.target.files && event.target.files.length > 0) {
                setFilename(event.target.files[0].name);
            } else {
                setFilename(undefined);
            }

            // Appeler le onChange fourni par register
            if (onChange) {
                onChange(event);
            }
        };

        return (
            <div className="w-full max-w-md">
                <div className="flex items-center justify-center w-full">
                    <label 
                        htmlFor={id}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                    >
                        {filename ? (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <File className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="text-sm text-gray-500">
                                    {filename}
                                </p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-4 text-gray-500" />
                                <p className="text-sm text-gray-500">
                                    Cliquez ou glissez un fichier ici
                                </p>
                                {maxSize && (
                                    <p className="text-xs text-gray-500">
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
        );
    }
);

FileInput.displayName = "FileInput";

export default FileInput;