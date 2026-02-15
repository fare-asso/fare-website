"use client"

import { useForm } from "@tanstack/react-form"
import { Trash2, Upload, UserPlus, X } from "lucide-react"
import {
    memo,
    type ReactNode,
    startTransition,
    useActionState,
    useCallback,
    useRef,
    useState
} from "react"
import {
    type FormState,
    processAdhesionForm
} from "@/actions/adhesion/processAdhesionFormAction"
import { Captcha } from "@/components/captcha"
import LoadingRing from "@/components/dashboard/loadingRing"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldLabel,
    FieldSeparator
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
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select"
import {
    AdhesionClientFormSchema,
    type AdhesionFormData,
    type BureauMember
} from "./form-schema"

// --- Captcha widget (memoized to avoid re-renders) ---

interface CaptchaFieldProps {
    onTokenChange: (token: string) => void
}

const CaptchaWidget = memo(function CaptchaWidget({
    onTokenChange
}: CaptchaFieldProps) {
    return <Captcha onComplete={onTokenChange} />
})

function CaptchaValidation({
    isTouched,
    isValid,
    errors
}: {
    isTouched: boolean
    isValid: boolean
    errors: Array<{ message?: string } | string | undefined>
}) {
    if (!isTouched || isValid) return null
    return <FieldError errors={errors} />
}

// --- Constants ---

const emptyBureauMember: BureauMember = {
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

const FILE_FIELDS = [
    "logo",
    "statuts",
    "recepisse",
    "extraitPV",
    "reglementInterieur",
    "bilanFinancier",
    "lettreEngagement"
] as const

// --- Form default values type (used to derive the form instance type) ---

const adhesionDefaultValues = {
    dateAdhesion: new Date().toISOString(),
    sigle: "",
    nomComplet: "",
    college: "" as "A" | "B" | "",
    objetPrincipal: "",
    adresseAdministrative: "",
    siegeSocial: "",
    numeroSalle: "",
    dateAG: "",
    nombreEtudiantsRepresentes: 0,
    nombreAdherents: 0,
    engagementCotisation: false as boolean,
    emailAssociation: "",
    telephonePortable: "",
    telephoneFixe: "",
    bureau: [{ ...emptyBureauMember }] as BureauMember[],
    captchaToken: ""
}

// --- File upload field component ---

function FileUploadField({
    name,
    label,
    description,
    accept,
    required,
    onFilesChange,
    max
}: {
    max?: number
    name: string
    label: ReactNode
    description?: ReactNode
    accept: string
    required?: boolean
    onFilesChange: (name: string) => (files: File[]) => void
}) {
    const [files, setFiles] = useState<File[]>([])

    const handleValueChange = useCallback(
        (newFiles: File[]) => {
            setFiles(newFiles)
            onFilesChange(name)(newFiles)
        },
        [name, onFilesChange]
    )

    console.log(files.length)

    return (
        <Field>
            <FieldLabel>{label}</FieldLabel>
            {description && <FieldDescription>{description}</FieldDescription>}
            <FileUpload
                maxFiles={max}
                accept={accept}
                required={required}
                value={files}
                onValueChange={handleValueChange}
            >
                {(!max || files.length < max) && (
                    <FileUploadDropzone className="flex-row gap-4 p-4">
                        <Upload className="size-5 text-muted-foreground" />
                        <p className="text-muted-foreground text-sm">
                            Glissez-déposez ou cliquez pour sélectionner
                        </p>
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
        </Field>
    )
}

// --- Main form component ---

export default function AdhesionForm() {
    const [formState, formAction, pending] = useActionState<
        FormState | undefined,
        FormData
    >(processAdhesionForm, undefined)

    const form = useForm({
        defaultValues: { ...adhesionDefaultValues },
        validators: {
            onChange: AdhesionClientFormSchema,
            onSubmit: AdhesionClientFormSchema
        },
        onSubmit: ({ value }) => {
            // Build a FormData with JSON-serialized structured data + file fields
            const submitFormData = new FormData()

            // Serialize structured data as JSON
            const structuredData: AdhesionFormData = {
                dateAdhesion: value.dateAdhesion,
                sigle: value.sigle,
                nomComplet: value.nomComplet,
                college: value.college as "A" | "B",
                objetPrincipal: value.objetPrincipal,
                adresseAdministrative: value.adresseAdministrative,
                siegeSocial: value.siegeSocial,
                numeroSalle: value.numeroSalle,
                dateAG: value.dateAG,
                nombreEtudiantsRepresentes: value.nombreEtudiantsRepresentes,
                nombreAdherents: value.nombreAdherents,
                engagementCotisation: value.engagementCotisation as true,
                emailAssociation: value.emailAssociation,
                telephonePortable: value.telephonePortable,
                telephoneFixe: value.telephoneFixe,
                bureau: value.bureau,
                captchaToken: value.captchaToken
            }
            submitFormData.set("data", JSON.stringify(structuredData))

            // Attach file fields from refs
            for (const name of FILE_FIELDS) {
                const files = fileRefs.current[name]
                if (files && files.length > 0 && files[0]) {
                    submitFormData.set(name, files[0])
                }
            }

            startTransition(() => {
                formAction(submitFormData)
            })
        }
    })

    // Refs to hold files selected via FileUpload components
    const fileRefs = useRef<Record<string, File[]>>({})

    const handleFileChange = useCallback(
        (fieldName: string) => (files: File[]) => {
            fileRefs.current[fieldName] = files
        },
        []
    )

    const handleCaptchaComplete = useCallback(
        (token: string) => {
            form.setFieldValue("captchaToken", token)
            form.setFieldMeta("captchaToken", (prev) => ({
                ...prev,
                isTouched: true
            }))
        },
        [form]
    )

    if (formState?.success) {
        return (
            <Card className="mx-auto w-full max-w-4xl">
                <CardContent className="pt-6">
                    <Alert className="border-green-600 text-green-600">
                        <AlertTitle>
                            Votre demande d&apos;adhésion a bien été soumise
                        </AlertTitle>
                        <AlertDescription>
                            Nous reviendrons vers vous par e-mail dans les plus
                            brefs délais pour vous fournir une réponse
                            concernant votre demande.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card className="mx-auto w-full max-w-4xl">
            <CardHeader>
                <CardTitle>Formulaire d&apos;adhésion</CardTitle>
                <CardDescription>
                    En cas de difficulté, contactez le secrétariat général sur{" "}
                    <a
                        href="mailto:secretariat@fare-asso.fr"
                        className="underline"
                    >
                        secretariat@fare-asso.fr
                    </a>
                    . Temps estimé : <strong>10-15 minutes</strong>.
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
                        {/* ===== Section: Informations générales ===== */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">
                                Informations générales
                            </h3>

                            <form.Field
                                name="dateAdhesion"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Date de la demande
                                                d&apos;adhésion
                                            </FieldLabel>
                                            <FieldDescription>
                                                Sélectionnez la date à laquelle
                                                vous faites cette demande.
                                            </FieldDescription>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="date"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
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
                                            <FieldLabel htmlFor={field.name}>
                                                Sigle de l&apos;association
                                            </FieldLabel>
                                            <FieldDescription>
                                                Entrez l&apos;acronyme ou le
                                                sigle officiel de votre
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
                                                placeholder="Ex: FARE"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="nomComplet"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Nom complet de
                                                l&apos;association
                                            </FieldLabel>
                                            <FieldDescription>
                                                Saisissez le nom complet et
                                                officiel de votre association.
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
                                                placeholder="Ex: Fédération des Associations de Haute-Bretagne"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <FileUploadField
                                name="logo"
                                label={<>Logo de l&apos;association</>}
                                description="Téléchargez le logo au format .ai ou .png."
                                accept=".ai,.png"
                                max={1}
                                onFilesChange={handleFileChange}
                            />
                        </div>

                        <FieldSeparator />

                        {/* ===== Section: Administratif ===== */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">
                                Administratif
                            </h3>

                            <form.Field
                                name="college"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Collège de l&apos;association
                                            </FieldLabel>
                                            <FieldDescription>
                                                Choisissez le collège auquel
                                                votre association appartient.
                                            </FieldDescription>
                                            <Select
                                                name={field.name}
                                                value={field.state.value}
                                                onValueChange={(value) => {
                                                    field.handleChange(
                                                        value as "A" | "B"
                                                    )
                                                    field.handleBlur()
                                                }}
                                            >
                                                <SelectTrigger
                                                    id={field.name}
                                                    aria-invalid={isInvalid}
                                                    className="w-full"
                                                >
                                                    <SelectValue placeholder="Sélectionnez le collège" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="A">
                                                        Collège A - Association
                                                        représentative des
                                                        étudiant.e.s
                                                    </SelectItem>
                                                    <SelectItem value="B">
                                                        Collège B - Association
                                                        étudiante thématique
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="objetPrincipal"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Objet principal de
                                                l&apos;association
                                            </FieldLabel>
                                            <FieldDescription>
                                                Décrivez brièvement le but
                                                principal de votre association.
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
                                                placeholder="Ex: Représentation et défense des intérêts des étudiants"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="adresseAdministrative"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Adresse administrative
                                            </FieldLabel>
                                            <FieldDescription>
                                                Indiquez l&apos;adresse
                                                officielle de votre association.
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
                                                placeholder="Ex: 6 Cours des Alliés, 35000 Rennes"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="siegeSocial"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Siège social (si différent){" "}
                                                <span className="text-muted-foreground">
                                                    (optionnel)
                                                </span>
                                            </FieldLabel>
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
                                                placeholder="Ex: 1 Rue de l'Université, 35000 Rennes"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="numeroSalle"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Numéro de salle du local{" "}
                                                <span className="text-muted-foreground">
                                                    (optionnel)
                                                </span>
                                            </FieldLabel>
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
                                                placeholder="Ex: B204"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <form.Field
                                name="dateAG"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Date de la dernière Assemblée
                                                Générale
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="date"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <form.Field
                                    name="nombreEtudiantsRepresentes"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Nombre d&apos;étudiant.e.s
                                                    représenté.e.s
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    min={0}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            Number.parseInt(
                                                                e.target.value,
                                                                10
                                                            ) || 0
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="Ex: 1000"
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
                                    name="nombreAdherents"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Nombre d&apos;adhérent.e.s
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="number"
                                                    min={0}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            Number.parseInt(
                                                                e.target.value,
                                                                10
                                                            ) || 0
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="Ex: 100"
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
                            </div>

                            <form.Field
                                name="engagementCotisation"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field
                                            orientation="horizontal"
                                            data-invalid={isInvalid}
                                        >
                                            <Checkbox
                                                id={field.name}
                                                name={field.name}
                                                checked={field.state.value}
                                                onCheckedChange={(checked) => {
                                                    field.handleChange(
                                                        checked === true
                                                    )
                                                    field.handleBlur()
                                                }}
                                                aria-invalid={isInvalid}
                                            />
                                            <div className="grid gap-1.5 leading-none">
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                    className="font-normal"
                                                >
                                                    Je m&apos;engage à régler la
                                                    cotisation demandée pour
                                                    l&apos;adhésion de mon
                                                    association dès que le
                                                    secrétariat général aura
                                                    validé ma demande.
                                                </FieldLabel>
                                                {isInvalid && (
                                                    <FieldError
                                                        errors={
                                                            field.state.meta
                                                                .errors
                                                        }
                                                    />
                                                )}
                                            </div>
                                        </Field>
                                    )
                                }}
                            />
                        </div>

                        <FieldSeparator />

                        {/* ===== Section: Documents à fournir ===== */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">
                                Documents à fournir
                            </h3>

                            <FileUploadField
                                name="statuts"
                                label={<>Statuts de l&apos;association</>}
                                description="Format PDF."
                                accept=".pdf"
                                max={1}
                                onFilesChange={handleFileChange}
                            />

                            <FileUploadField
                                name="recepisse"
                                label="Récépissé de déclaration en préfecture"
                                description="Format PDF."
                                accept=".pdf"
                                max={1}
                                onFilesChange={handleFileChange}
                            />

                            <FileUploadField
                                name="extraitPV"
                                label={
                                    <>Extrait de PV d&apos;élection du bureau</>
                                }
                                description="Format PDF."
                                accept=".pdf"
                                max={1}
                                onFilesChange={handleFileChange}
                            />

                            <FileUploadField
                                name="lettreEngagement"
                                label={
                                    <>
                                        Lettre d&apos;engagement (première
                                        adhésion){" "}
                                        <span className="text-muted-foreground">
                                            (optionnel)
                                        </span>
                                    </>
                                }
                                accept=".pdf"
                                max={1}
                                onFilesChange={handleFileChange}
                            />

                            <FileUploadField
                                name="reglementInterieur"
                                label={
                                    <>
                                        Règlement intérieur{" "}
                                        <span className="text-muted-foreground">
                                            (optionnel)
                                        </span>
                                    </>
                                }
                                accept=".pdf"
                                max={1}
                                onFilesChange={handleFileChange}
                            />

                            <FileUploadField
                                name="bilanFinancier"
                                label={
                                    <>
                                        Bilan financier{" "}
                                        <span className="text-muted-foreground">
                                            (optionnel)
                                        </span>
                                    </>
                                }
                                accept=".pdf"
                                max={1}
                                onFilesChange={handleFileChange}
                            />
                        </div>

                        <FieldSeparator />

                        {/* ===== Section: Contacts ===== */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">Contacts</h3>

                            <form.Field
                                name="emailAssociation"
                                children={(field) => {
                                    const isInvalid =
                                        field.state.meta.isTouched &&
                                        !field.state.meta.isValid
                                    return (
                                        <Field data-invalid={isInvalid}>
                                            <FieldLabel htmlFor={field.name}>
                                                Adresse mail de
                                                l&apos;association
                                            </FieldLabel>
                                            <Input
                                                id={field.name}
                                                name={field.name}
                                                type="email"
                                                value={field.state.value}
                                                onBlur={field.handleBlur}
                                                onChange={(e) =>
                                                    field.handleChange(
                                                        e.target.value
                                                    )
                                                }
                                                aria-invalid={isInvalid}
                                                placeholder="Ex: contact@association.fr"
                                            />
                                            {isInvalid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}
                                        </Field>
                                    )
                                }}
                            />

                            <div className="grid gap-4 md:grid-cols-2">
                                <form.Field
                                    name="telephonePortable"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Téléphone portable
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="tel"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="Ex: 06 12 34 56 78"
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
                                    name="telephoneFixe"
                                    children={(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched &&
                                            !field.state.meta.isValid
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel
                                                    htmlFor={field.name}
                                                >
                                                    Téléphone fixe{" "}
                                                    <span className="text-muted-foreground">
                                                        (optionnel)
                                                    </span>
                                                </FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    name={field.name}
                                                    type="tel"
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) =>
                                                        field.handleChange(
                                                            e.target.value
                                                        )
                                                    }
                                                    aria-invalid={isInvalid}
                                                    placeholder="Ex: 02 99 12 34 56"
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
                            </div>
                        </div>

                        <FieldSeparator />

                        {/* ===== Section: Bureau de l'association ===== */}
                        <div className="space-y-4">
                            <h3 className="font-semibold text-lg">
                                Bureau de l&apos;association
                            </h3>

                            <form.Field name="bureau" mode="array">
                                {(field) => (
                                    <div className="space-y-4">
                                        {field.state.value.map((_, index) => (
                                            <BureauMemberFields
                                                key={`bureau-member-${index}`}
                                                form={form}
                                                index={index}
                                                canDelete={
                                                    field.state.value.length > 1
                                                }
                                                onDelete={() =>
                                                    field.removeValue(index)
                                                }
                                            />
                                        ))}

                                        {/* Array-level errors (e.g., max admins) */}
                                        {field.state.meta.isTouched &&
                                            !field.state.meta.isValid && (
                                                <FieldError
                                                    errors={
                                                        field.state.meta.errors
                                                    }
                                                />
                                            )}

                                        <div className="flex justify-end">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() =>
                                                    field.pushValue({
                                                        ...emptyBureauMember
                                                    })
                                                }
                                            >
                                                <UserPlus className="mr-2 h-4 w-4" />
                                                Ajouter un membre
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </form.Field>
                        </div>

                        <FieldSeparator />

                        {/* ===== Section: Captcha ===== */}
                        <div className="space-y-4">
                            <div className="pt-4">
                                <Field>
                                    <CaptchaWidget
                                        onTokenChange={handleCaptchaComplete}
                                    />
                                    <form.Field
                                        name="captchaToken"
                                        children={(field) => (
                                            <CaptchaValidation
                                                isTouched={
                                                    field.state.meta.isTouched
                                                }
                                                isValid={
                                                    field.state.meta.isValid
                                                }
                                                errors={field.state.meta.errors}
                                            />
                                        )}
                                    />
                                </Field>
                            </div>
                        </div>

                        {formState?.error && (
                            <Alert variant="destructive">
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>
                                    {formState.error}
                                </AlertDescription>
                            </Alert>
                        )}

                        <div className="flex justify-end gap-4 pt-4">
                            <Button
                                type="submit"
                                disabled={pending}
                                className="min-w-32"
                            >
                                {pending ? (
                                    <LoadingRing />
                                ) : (
                                    "Envoyer le formulaire d'adhésion"
                                )}
                            </Button>
                        </div>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}

// --- Bureau member sub-form ---

/**
 * TanStack Form's useForm return type has 12 deeply nested generic parameters.
 * We extract the concrete type from a helper function to avoid spelling them out.
 */
function _createAdhesionForm() {
    return useForm({
        defaultValues: { ...adhesionDefaultValues },
        validators: {
            onChange: AdhesionClientFormSchema,
            onSubmit: AdhesionClientFormSchema
        },
        onSubmit: () => {
            // noop — type extraction only
        }
    })
}
type AdhesionFormInstance = ReturnType<typeof _createAdhesionForm>

function BureauMemberFields({
    form,
    index,
    canDelete,
    onDelete
}: {
    form: AdhesionFormInstance
    index: number
    canDelete: boolean
    onDelete: () => void
}) {
    return (
        <div className="rounded-lg border p-4">
            <div className="mb-4 flex items-center justify-between">
                <h4 className="font-medium text-sm">Membre {index + 1}</h4>
                <div className="flex items-center gap-3">
                    <form.Field
                        name={`bureau[${index}].isAdmin`}
                        children={(field) => (
                            <Field orientation="horizontal">
                                <Checkbox
                                    id={field.name}
                                    checked={field.state.value as boolean}
                                    onCheckedChange={(checked) => {
                                        field.handleChange(checked === true)
                                        field.handleBlur()
                                    }}
                                />
                                <FieldLabel
                                    htmlFor={field.name}
                                    className="font-normal text-sm"
                                >
                                    Administrateur
                                </FieldLabel>
                            </Field>
                        )}
                    />
                    {canDelete && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={onDelete}
                        >
                            <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <form.Field
                    name={`bureau[${index}].poste`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Poste
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="Président.e"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name={`bureau[${index}].nom`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Nom
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="Dupont"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name={`bureau[${index}].prenom`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Prénom
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="Jean"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name={`bureau[${index}].filiere`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Filière
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="Informatique"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name={`bureau[${index}].annee`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Année d&apos;études
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="L3"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name={`bureau[${index}].telephone`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Téléphone
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    type="tel"
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="06 12 34 56 78"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name={`bureau[${index}].email`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Email
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    type="email"
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="jean@email.fr"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />

                <form.Field
                    name={`bureau[${index}].adresse`}
                    children={(field) => {
                        const isInvalid =
                            field.state.meta.isTouched &&
                            !field.state.meta.isValid
                        return (
                            <Field data-invalid={isInvalid}>
                                <FieldLabel htmlFor={field.name}>
                                    Adresse postale
                                </FieldLabel>
                                <Input
                                    id={field.name}
                                    value={field.state.value as string}
                                    onBlur={field.handleBlur}
                                    onChange={(e) =>
                                        field.handleChange(e.target.value)
                                    }
                                    aria-invalid={isInvalid}
                                    placeholder="1 Rue de la Paix, 35000 Rennes"
                                />
                                {isInvalid && (
                                    <FieldError
                                        errors={field.state.meta.errors}
                                    />
                                )}
                            </Field>
                        )
                    }}
                />
            </div>
        </div>
    )
}
