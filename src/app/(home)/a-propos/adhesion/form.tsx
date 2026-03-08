"use client"

import { useForm } from "@tanstack/react-form"
import { Upload, X } from "lucide-react"
import { type ReactNode, useCallback, useState } from "react"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldLegend,
    FieldSet
} from "@/components/ui/field"
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadList
} from "@/components/ui/file-upload"
import FileInput from "@/components/ui/fileInput"
import { Input } from "@/components/ui/input"
import { AdhesionFormSchema } from "./form-schema"

/** Max file size constant: 2 MB per file (in bytes) */
const MAX_FILE_SIZE = 2 * 1024 * 1024

function formatMaxSize(bytes: number): string {
    return `${(bytes / (1024 * 1024)).toFixed(0)} Mo`
}

function FileUploadField({
    name,
    label,
    description,
    accept,
    required,
    onFilesChange,
    max,
    maxSize = MAX_FILE_SIZE
}: {
    max?: number
    maxSize?: number
    name: string
    label: ReactNode
    description?: ReactNode
    accept: string
    required?: boolean
    onFilesChange: (name: string) => (files: File[]) => void
}) {
    const [files, setFiles] = useState<File[]>([])
    const [sizeError, setSizeError] = useState<string | null>(null)

    const handleValueChange = useCallback(
        (newFiles: File[]) => {
            setFiles(newFiles)
            setSizeError(null)
            onFilesChange(name)(newFiles)
        },
        [name, onFilesChange]
    )

    const handleFileReject = useCallback(
        (_file: File, message: string) => {
            if (message === "File too large") {
                setSizeError(
                    `Le fichier dépasse la taille maximale de ${formatMaxSize(maxSize)}.`
                )
            }
        },
        [maxSize]
    )

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FileUpload
                maxFiles={max}
                maxSize={maxSize}
                accept={accept}
                required={required}
                value={files}
                onValueChange={handleValueChange}
                onFileReject={handleFileReject}
            >
                {(!max || files.length < max) && (
                    <FileUploadDropzone className="flex-row gap-4 p-4">
                        <Upload className="size-5 text-muted-foreground" />
                        <div className="text-center">
                            <p className="text-muted-foreground text-sm">
                                Glissez-déposez ou cliquez pour sélectionner
                            </p>
                            <p className="text-muted-foreground text-xs">
                                Max. {formatMaxSize(maxSize)}
                            </p>
                        </div>
                    </FileUploadDropzone>
                )}
                <FileUploadList>
                    {files.map((file) => (
                        <FileUploadItem key={file.name} value={file}>
                            <FileUploadItemPreview />
                            <FileUploadItemMetadata />
                            <FileUploadItemDelete asChild>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="size-7"
                                >
                                    <X className="size-4" />
                                </Button>
                            </FileUploadItemDelete>
                        </FileUploadItem>
                    ))}
                </FileUploadList>
            </FileUpload>
            {sizeError && (
                <p className="text-destructive text-sm">{sizeError}</p>
            )}
        </Field>
    )
}

export function AdhesionFormNew() {
    const form = useForm({
        defaultValues: {
            sigle: "",
            nomComplet: "",
            logo: undefined as File | undefined,
            college: "" as "A" | "B",
            filiere: "",
            objetPrincipal: "",
            adresseAdministrative: "",
            siegeSocial: "",
            numeroSalle: "",
            dateAG: new Date(),
            nombreEtudiantsRepresentes: 0,
            nombreAdherents: 0,
            engagementCotisation: false as unknown as true,
            emailAssociation: "",
            telephonePortable: "",
            telephoneFixe: "",
            bureau: [
                {
                    isAdmin: false,
                    poste: "",
                    nom: "",
                    prenom: "",
                    filiere: "",
                    annee: "",
                    telephone: "",
                    email: "",
                    adresse: ""
                }
            ],
            captchaToken: ""
        },
        validators: {
            onSubmit: AdhesionFormSchema
        },
        onSubmit: async ({ value }) => {
            // TODO: implement submission
        }
    })

    return (
        <Card className="w-full sm:max-w-3xl" variant="ghost">
            <CardHeader>
                <CardTitle>Formulaire d'adhésion</CardTitle>
                <CardDescription>
                    En cas de difficulté, contactez le secrétariat général sur{" "}
                    <a
                        href="mailto:secretariat@fare-asso.fr"
                        className="underline"
                    >
                        secretariat@fare-asso.fr
                    </a>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form
                    id="adhesion-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        form.handleSubmit()
                    }}
                >
                    <FieldGroup>
                        <FieldSet>
                            <FieldLegend>Informations Générales</FieldLegend>
                            <FieldGroup>
                                <form.Field
                                    name="sigle"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Acronyme
                                                </FieldLabel>
                                                <FieldDescription>
                                                    L'acronyme ou le sigle
                                                    officiel de votre
                                                    association.
                                                </FieldDescription>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="ex: FARE"
                                                />
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        )
                                    }}
                                />
                                <form.Field
                                    name="sigle"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Nom Complet
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Le nom complet officiel de
                                                    votre association.
                                                </FieldDescription>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="ex: Fédération des Associations du Réseau Étudiant de Haute Bretagne"
                                                />
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        )
                                    }}
                                />
                                <form.Field
                                    name="logo"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Logo de l'association
                                                </FieldLabel>
                                                <FieldDescription>
                                                    Format : PNG, JPG, JPEG,
                                                    SVG. Maximum 2 Mo.
                                                </FieldDescription>
                                                <FileInput
                                                    max={MAX_FILE_SIZE}
                                                    onChange={
                                                        field.handleChange
                                                    }
                                                />
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </Field>
                                        )
                                    }}
                                />
                            </FieldGroup>
                        </FieldSet>
                    </FieldGroup>
                </form>
            </CardContent>
            <CardFooter>
                <Field orientation="horizontal">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => form.reset()}
                    >
                        Reset
                    </Button>
                    <Button type="submit" form="bug-report-form">
                        Submit
                    </Button>
                </Field>
            </CardFooter>
        </Card>
    )
}
